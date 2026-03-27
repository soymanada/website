-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Actividad diaria del proveedor (últimos 7 días)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Requiere: providers.sql ejecutado previamente
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.provider_activity_weekly (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id  UUID        NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  dow          SMALLINT    NOT NULL CHECK (dow BETWEEN 0 AND 6),  -- 0=domingo, 6=sábado
  views        INTEGER     DEFAULT 0,
  contacts     INTEGER     DEFAULT 0,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (provider_id, dow)
);

CREATE INDEX IF NOT EXISTS provider_activity_weekly_provider_id_idx ON public.provider_activity_weekly (provider_id);

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE public.provider_activity_weekly ENABLE ROW LEVEL SECURITY;

-- El dueño puede leer su actividad semanal
CREATE POLICY "provider_activity_weekly_select_own" ON public.provider_activity_weekly
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.providers pv
      WHERE pv.id = provider_id AND pv.user_id = auth.uid()
    )
  );

-- Admins tienen acceso total
CREATE POLICY "provider_activity_weekly_all_admin" ON public.provider_activity_weekly
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
