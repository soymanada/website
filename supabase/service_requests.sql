-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Solicitudes de servicio de migrantes
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.service_requests (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  category    TEXT,
  description TEXT        NOT NULL CHECK (char_length(description) <= 1000),
  city        TEXT,
  email       TEXT        CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$' OR email IS NULL),
  status      TEXT        NOT NULL DEFAULT 'open'
              CHECK (status IN ('open', 'matched', 'closed'))
);

CREATE INDEX IF NOT EXISTS service_requests_created_at_idx ON public.service_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS service_requests_category_idx   ON public.service_requests (category);
CREATE INDEX IF NOT EXISTS service_requests_status_idx     ON public.service_requests (status);

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar (autenticados y anónimos)
CREATE POLICY "service_requests_insert_all"
  ON public.service_requests FOR INSERT
  WITH CHECK (true);

-- El propio usuario puede leer sus solicitudes
CREATE POLICY "service_requests_own_select"
  ON public.service_requests FOR SELECT
  USING (user_id = auth.uid());

-- Admins pueden leer todas
CREATE POLICY "service_requests_admin_select"
  ON public.service_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
