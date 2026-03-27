-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Tabla de métricas agregadas por proveedor
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Requiere: providers.sql ejecutado previamente
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.provider_metrics (
  id                      UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id             UUID         NOT NULL UNIQUE REFERENCES public.providers(id) ON DELETE CASCADE,
  profile_views_week      INTEGER      DEFAULT 0,
  contact_clicks_week     INTEGER      DEFAULT 0,
  avg_score               NUMERIC(3,2) DEFAULT 0.00,
  review_count            INTEGER      DEFAULT 0,
  updated_at              TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS provider_metrics_provider_id_idx ON public.provider_metrics (provider_id);

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE public.provider_metrics ENABLE ROW LEVEL SECURITY;

-- El dueño del proveedor puede leer sus propias métricas
CREATE POLICY "provider_metrics_select_own" ON public.provider_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.providers pv
      WHERE pv.id = provider_id AND pv.user_id = auth.uid()
    )
  );

-- Admins tienen acceso total
CREATE POLICY "provider_metrics_all_admin" ON public.provider_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
