-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Migraciones completas — ejecutar en orden (1.1 → 1.7)
-- Todos los bloques son idempotentes (IF NOT EXISTS / DROP IF EXISTS)
-- ─────────────────────────────────────────────────────────────────

-- ── 1.1 Tabla provider_applications ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.provider_applications (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at     TIMESTAMPTZ DEFAULT now(),
  business_name  TEXT        NOT NULL,
  service_title  TEXT        NOT NULL,
  categories     TEXT[]      NOT NULL,
  description    TEXT        NOT NULL,
  languages      TEXT[]      NOT NULL,
  countries      TEXT[]      NOT NULL,
  modality       TEXT        NOT NULL,
  whatsapp       TEXT        NOT NULL,
  instagram      TEXT,
  website        TEXT,
  profile_link   TEXT        NOT NULL,
  contact_name   TEXT        NOT NULL,
  contact_email  TEXT        NOT NULL,
  terms_accepted BOOLEAN     NOT NULL DEFAULT false,
  status         TEXT        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected'))
);

ALTER TABLE public.provider_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit applications"              ON public.provider_applications;
DROP POLICY IF EXISTS "Authenticated can read applications"         ON public.provider_applications;
DROP POLICY IF EXISTS "Authenticated can update application status" ON public.provider_applications;

CREATE POLICY "Public can submit applications"
  ON public.provider_applications FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated can read applications"
  ON public.provider_applications FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update application status"
  ON public.provider_applications FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ── 1.2 Columnas de trial en providers ───────────────────────────
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS trial_activated_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS trial_ends_at      TIMESTAMPTZ DEFAULT NULL;

-- ── 1.3 Tabla verified_interactions ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.verified_interactions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id TEXT        NOT NULL,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source      TEXT        NOT NULL DEFAULT 'message_reply'
              CHECK (source IN ('message_reply', 'booking_completed', 'manual')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(provider_id, user_id)
);

ALTER TABLE public.verified_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own interactions" ON public.verified_interactions;
DROP POLICY IF EXISTS "service role insert"         ON public.verified_interactions;
DROP POLICY IF EXISTS "admins manage all"           ON public.verified_interactions;

CREATE POLICY "users read own interactions"
  ON public.verified_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "service role insert"
  ON public.verified_interactions FOR INSERT
  WITH CHECK (true);

-- ── 1.4 Columna verified en reviews ──────────────────────────────
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;

-- ── 1.5 RLS crítico: profiles y providers ────────────────────────
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;
CREATE POLICY "Authenticated users can read profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Provider can read own row" ON public.providers;
CREATE POLICY "Provider can read own row"
  ON public.providers FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Provider can update own row" ON public.providers;
CREATE POLICY "Provider can update own row"
  ON public.providers FOR UPDATE
  USING (user_id = auth.uid());

-- ── 1.6 Fix: desconectar Daniela Valenzuela del user_id incorrecto
-- ONE-TIME data fix: solo aplica al proveedor real con ese UUID.
-- Si se ejecuta en un ambiente limpio (sin ese registro) no hace nada — es seguro.
-- No remover: sirve como documentación del fix aplicado en producción.
UPDATE public.providers
SET user_id = NULL
WHERE id = '2b1c48f4-db3e-4d3f-9222-36ebd827e5ab'
  AND user_id IS NOT NULL;

-- ── 1.7 pg_cron: auto-downgrade de trials expirados ──────────────
-- REQUISITO: activar extensión pg_cron en Database → Extensions antes de ejecutar este bloque.
-- Este bloque es idempotente: elimina el job si ya existe antes de recrearlo.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'downgrade-expired-trials') THEN
    PERFORM cron.unschedule('downgrade-expired-trials');
  END IF;
END
$$;

SELECT cron.schedule(
  'downgrade-expired-trials',
  '0 3 * * *',
  $$
    UPDATE public.providers
    SET tier = 'bronze'
    WHERE trial_ends_at IS NOT NULL
      AND trial_ends_at < now()
      AND tier = 'gold'
      AND trial_activated_at IS NOT NULL;
  $$
);
