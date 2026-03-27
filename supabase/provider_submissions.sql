-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Tabla de solicitudes de registro de proveedores
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.provider_submissions (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name   TEXT        NOT NULL,
  service_title   TEXT        NOT NULL,
  category_slug   TEXT        NOT NULL,
  description     TEXT        NOT NULL,
  languages       TEXT[]      NOT NULL DEFAULT '{}',
  countries       TEXT[]      NOT NULL DEFAULT '{}',
  modality        TEXT,
  whatsapp        TEXT,
  email           TEXT,
  instagram       TEXT,
  website         TEXT,
  profile_link    TEXT,
  contact_name    TEXT,
  contact_email   TEXT,
  status          TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS provider_submissions_status_idx     ON public.provider_submissions (status);
CREATE INDEX IF NOT EXISTS provider_submissions_created_at_idx ON public.provider_submissions (created_at DESC);

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE public.provider_submissions ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar (formulario público de postulación)
CREATE POLICY "provider_submissions_insert_public" ON public.provider_submissions
  FOR INSERT WITH CHECK (true);

-- Solo admins pueden leer y actualizar el estado
CREATE POLICY "provider_submissions_select_admin" ON public.provider_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "provider_submissions_update_admin" ON public.provider_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
