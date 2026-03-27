-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Actividad por hora del proveedor (motor de recomendación)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Requiere: providers.sql ejecutado previamente
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.provider_activity_hourly (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id  UUID        NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  hour_utc     SMALLINT    NOT NULL CHECK (hour_utc BETWEEN 0 AND 23),  -- hora en UTC
  views        INTEGER     DEFAULT 0,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (provider_id, hour_utc)
);

CREATE INDEX IF NOT EXISTS provider_activity_hourly_provider_id_idx ON public.provider_activity_hourly (provider_id);

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE public.provider_activity_hourly ENABLE ROW LEVEL SECURITY;

-- El dueño puede leer su actividad horaria
CREATE POLICY "provider_activity_hourly_select_own" ON public.provider_activity_hourly
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.providers pv
      WHERE pv.id = provider_id AND pv.user_id = auth.uid()
    )
  );

-- Admins tienen acceso total
CREATE POLICY "provider_activity_hourly_all_admin" ON public.provider_activity_hourly
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
