-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Sistema de Mensajería
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

-- 1. Notification preferences on providers
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS notif_new_message BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_new_review  BOOLEAN NOT NULL DEFAULT true;

-- 2. conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id     UUID        NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  migrant_id      UUID        NOT NULL REFERENCES auth.users(id)       ON DELETE CASCADE,
  migrant_name    TEXT        NOT NULL DEFAULT '',
  subject         TEXT,
  status          TEXT        NOT NULL DEFAULT 'open'
                                CHECK (status IN ('open','replied','closed')),
  unread_count    INT         NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider_id, migrant_id)
);

-- 3. messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_role     TEXT        NOT NULL CHECK (sender_role IN ('migrant','provider')),
  sender_name     TEXT,
  body            TEXT        NOT NULL,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. RLS: conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Provider reads own conversations"   ON public.conversations;
DROP POLICY IF EXISTS "Migrant reads own conversations"    ON public.conversations;
DROP POLICY IF EXISTS "Provider updates own conversations" ON public.conversations;

CREATE POLICY "Provider reads own conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (
    provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid())
  );

CREATE POLICY "Migrant reads own conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (migrant_id = auth.uid());

CREATE POLICY "Provider updates own conversations"
  ON public.conversations FOR UPDATE TO authenticated
  USING (
    provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid())
  );

-- 5. RLS: messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read messages" ON public.messages;
DROP POLICY IF EXISTS "Provider can reply"             ON public.messages;

CREATE POLICY "Participants can read messages"
  ON public.messages FOR SELECT TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE migrant_id = auth.uid()
         OR provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Provider can reply"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_role = 'provider'
    AND conversation_id IN (
      SELECT id FROM public.conversations
      WHERE provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid())
    )
  );

-- 6. SECURITY DEFINER function: migrant sends first message, creates conversation
CREATE OR REPLACE FUNCTION public.send_or_reply_message(
  p_provider_id UUID,
  p_body        TEXT,
  p_subject     TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_migrant_id   UUID;
  v_migrant_name TEXT;
  v_conv_id      UUID;
  v_msg_id       UUID;
BEGIN
  v_migrant_id := auth.uid();
  IF v_migrant_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get display name from Google OAuth metadata or email
  SELECT COALESCE(
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = v_migrant_id),
    (SELECT email FROM auth.users WHERE id = v_migrant_id),
    'Migrante'
  ) INTO v_migrant_name;

  -- Find existing conversation or create one
  SELECT id INTO v_conv_id
  FROM public.conversations
  WHERE provider_id = p_provider_id AND migrant_id = v_migrant_id;

  IF v_conv_id IS NULL THEN
    INSERT INTO public.conversations
      (provider_id, migrant_id, migrant_name, subject, status, unread_count, last_message_at)
    VALUES
      (p_provider_id, v_migrant_id, v_migrant_name,
       COALESCE(p_subject, 'Consulta'), 'open', 1, now())
    RETURNING id INTO v_conv_id;
  ELSE
    UPDATE public.conversations
    SET unread_count    = unread_count + 1,
        last_message_at = now(),
        status          = 'open'
    WHERE id = v_conv_id;
  END IF;

  -- Insert the message
  INSERT INTO public.messages (conversation_id, sender_role, sender_name, body)
  VALUES (v_conv_id, 'migrant', v_migrant_name, p_body)
  RETURNING id INTO v_msg_id;

  RETURN jsonb_build_object(
    'conversation_id', v_conv_id,
    'message_id',      v_msg_id,
    'migrant_name',    v_migrant_name
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_or_reply_message(UUID, TEXT, TEXT) TO authenticated;
