-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Tablas de formularios: sugerencias y feedback
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

-- ── 1. category_suggestions ───────────────────────────────────────
-- Sugerencias de categorías desde el botón "¿No ves tu categoría?"

CREATE TABLE IF NOT EXISTS public.category_suggestions (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  role       TEXT        CHECK (role IN ('migrant', 'provider')),
  name       TEXT,
  city       TEXT,
  message    TEXT        NOT NULL CHECK (char_length(message) <= 1000),
  email      TEXT        CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$' OR email IS NULL)
);

CREATE INDEX IF NOT EXISTS category_suggestions_created_at_idx ON public.category_suggestions (created_at DESC);

ALTER TABLE public.category_suggestions ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede insertar
CREATE POLICY "category_suggestions_insert_authenticated"
  ON public.category_suggestions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Solo admins pueden leer
CREATE POLICY "category_suggestions_admin_select"
  ON public.category_suggestions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── 2. site_feedback ──────────────────────────────────────────────
-- Comentarios y sugerencias desde el footer

CREATE TABLE IF NOT EXISTS public.site_feedback (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  type       TEXT        CHECK (type IN ('idea', 'bug', 'praise', 'other')),
  message    TEXT        NOT NULL CHECK (char_length(message) <= 2000),
  email      TEXT        CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$' OR email IS NULL)
);

CREATE INDEX IF NOT EXISTS site_feedback_created_at_idx ON public.site_feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS site_feedback_type_idx       ON public.site_feedback (type);

ALTER TABLE public.site_feedback ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar, incluyendo anónimos
CREATE POLICY "site_feedback_insert_all"
  ON public.site_feedback FOR INSERT
  WITH CHECK (true);

-- Solo admins pueden leer
CREATE POLICY "site_feedback_admin_select"
  ON public.site_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
