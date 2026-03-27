-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Palabras clave extraídas de reseñas por proveedor
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Requiere: providers.sql ejecutado previamente
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.provider_feedback_keywords (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id  UUID        NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  keyword      TEXT        NOT NULL,
  count        INTEGER     DEFAULT 1,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (provider_id, keyword)
);

CREATE INDEX IF NOT EXISTS provider_feedback_keywords_provider_id_idx ON public.provider_feedback_keywords (provider_id);
CREATE INDEX IF NOT EXISTS provider_feedback_keywords_count_idx       ON public.provider_feedback_keywords (count DESC);

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE public.provider_feedback_keywords ENABLE ROW LEVEL SECURITY;

-- El dueño puede leer sus keywords
CREATE POLICY "provider_feedback_keywords_select_own" ON public.provider_feedback_keywords
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.providers pv
      WHERE pv.id = provider_id AND pv.user_id = auth.uid()
    )
  );

-- Admins tienen acceso total
CREATE POLICY "provider_feedback_keywords_all_admin" ON public.provider_feedback_keywords
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
