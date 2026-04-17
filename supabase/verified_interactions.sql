-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Tabla verified_interactions + columna reviews.verified
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Seguro de re-ejecutar (IF NOT EXISTS)
-- ─────────────────────────────────────────────────────────────────

-- 1. Tabla verified_interactions
CREATE TABLE IF NOT EXISTS public.verified_interactions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id TEXT        NOT NULL,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source      TEXT        NOT NULL DEFAULT 'message_reply'
              CHECK (source IN ('message_reply', 'booking_completed', 'manual')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_id, user_id)
);

ALTER TABLE public.verified_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own interactions"
  ON public.verified_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "service role insert"
  ON public.verified_interactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "admins manage all"
  ON public.verified_interactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.providers
      WHERE user_id = auth.uid()
        AND is_admin = true
    )
  );

-- 2. Columna verified en reviews
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;
