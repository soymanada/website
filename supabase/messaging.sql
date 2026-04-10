-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Sistema de mensajería interna
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

-- ── 1. conversations ──────────────────────────────────────────────
-- Un hilo por par (migrant, provider). El RPC crea uno si no existe.

CREATE TABLE IF NOT EXISTS public.conversations (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id     UUID        NOT NULL,   -- FK a providers.id
  migrant_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  migrant_name    TEXT        NOT NULL DEFAULT '',
  subject         TEXT,
  status          TEXT        NOT NULL DEFAULT 'open'
                              CHECK (status IN ('open', 'replied', 'closed')),
  unread_count    INT         NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now(),

  UNIQUE (provider_id, migrant_id)   -- un hilo por par
);

CREATE INDEX IF NOT EXISTS conversations_provider_id_idx ON public.conversations (provider_id);
CREATE INDEX IF NOT EXISTS conversations_migrant_id_idx  ON public.conversations (migrant_id);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- El proveedor puede ver todas las conversaciones de su perfil
CREATE POLICY "conversations_provider_select"
  ON public.conversations FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
  );

-- El migrante puede ver sus propias conversaciones
CREATE POLICY "conversations_migrant_select"
  ON public.conversations FOR SELECT
  USING (migrant_id = auth.uid());

-- Solo el RPC puede insertar/actualizar (SECURITY DEFINER omite RLS)
CREATE POLICY "conversations_rpc_insert"
  ON public.conversations FOR INSERT
  WITH CHECK (migrant_id = auth.uid());

CREATE POLICY "conversations_rpc_update"
  ON public.conversations FOR UPDATE
  USING (
    migrant_id = auth.uid()
    OR provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
  );

-- ── 2. messages ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_role     TEXT        NOT NULL CHECK (sender_role IN ('migrant', 'provider')),
  sender_name     TEXT,
  body            TEXT        NOT NULL CHECK (char_length(body) <= 2000),
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON public.messages (conversation_id);
CREATE INDEX IF NOT EXISTS messages_read_at_idx         ON public.messages (read_at) WHERE read_at IS NULL;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- El proveedor puede leer mensajes de sus conversaciones
CREATE POLICY "messages_provider_select"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE provider_id IN (
        SELECT id FROM public.providers WHERE user_id = auth.uid()
      )
    )
  );

-- El migrante puede leer sus propios mensajes
CREATE POLICY "messages_migrant_select"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE migrant_id = auth.uid()
    )
  );

-- Cualquier usuario autenticado puede insertar (el RPC y el provider reply lo usan)
CREATE POLICY "messages_insert_authenticated"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- El proveedor puede marcar mensajes como leídos
CREATE POLICY "messages_update_read_at"
  ON public.messages FOR UPDATE
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE provider_id IN (
        SELECT id FROM public.providers WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (true);

-- ── 3. RPC send_or_reply_message ─────────────────────────────────
-- Crea o reutiliza una conversación y agrega el mensaje del migrante.
-- Se llama desde el frontend como: supabase.rpc('send_or_reply_message', { p_provider_id, p_body, p_subject })

CREATE OR REPLACE FUNCTION public.send_or_reply_message(
  p_provider_id UUID,
  p_body        TEXT,
  p_subject     TEXT DEFAULT NULL
)
RETURNS UUID
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
  -- 1. Obtener identidad del caller
  v_migrant_id := auth.uid();
  IF v_migrant_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. Obtener nombre del migrante desde auth.users metadata
  SELECT COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    email
  )
  INTO v_migrant_name
  FROM auth.users
  WHERE id = v_migrant_id;

  -- 3. Buscar conversación existente o crear una nueva
  SELECT id INTO v_conv_id
  FROM public.conversations
  WHERE provider_id = p_provider_id
    AND migrant_id  = v_migrant_id;

  IF v_conv_id IS NULL THEN
    INSERT INTO public.conversations (
      provider_id, migrant_id, migrant_name, subject, status, unread_count, last_message_at
    ) VALUES (
      p_provider_id,
      v_migrant_id,
      COALESCE(v_migrant_name, ''),
      COALESCE(p_subject, 'Consulta'),
      'open',
      1,
      now()
    )
    RETURNING id INTO v_conv_id;
  ELSE
    -- Incrementar contador de no leídos y actualizar timestamp
    UPDATE public.conversations
    SET unread_count    = unread_count + 1,
        last_message_at = now(),
        status          = 'open'
    WHERE id = v_conv_id;
  END IF;

  -- 4. Insertar mensaje
  INSERT INTO public.messages (
    conversation_id, sender_id, sender_role, sender_name, body
  ) VALUES (
    v_conv_id,
    v_migrant_id,
    'migrant',
    COALESCE(v_migrant_name, ''),
    p_body
  )
  RETURNING id INTO v_msg_id;

  RETURN v_conv_id;
END;
$$;

-- Solo usuarios autenticados pueden llamar al RPC
REVOKE ALL ON FUNCTION public.send_or_reply_message FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_or_reply_message TO authenticated;
