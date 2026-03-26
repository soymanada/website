-- Tabla para postulaciones de proveedores desde el formulario del sitio
CREATE TABLE IF NOT EXISTS public.provider_applications (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at     TIMESTAMPTZ DEFAULT now(),

  -- Información del negocio
  business_name  TEXT        NOT NULL,
  service_title  TEXT        NOT NULL,
  categories     TEXT[]      NOT NULL,
  description    TEXT        NOT NULL,

  -- Detalles del servicio
  languages      TEXT[]      NOT NULL,
  countries      TEXT[]      NOT NULL,
  modality       TEXT        NOT NULL,

  -- Contacto público
  whatsapp       TEXT        NOT NULL,
  instagram      TEXT,
  website        TEXT,
  profile_link   TEXT        NOT NULL,

  -- Datos internos (no se publican)
  contact_name   TEXT        NOT NULL,
  contact_email  TEXT        NOT NULL,
  terms_accepted BOOLEAN     NOT NULL DEFAULT false,

  -- Estado de revisión
  status         TEXT        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- RLS
ALTER TABLE public.provider_applications ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar (formulario público)
CREATE POLICY "Public can submit applications"
  ON public.provider_applications
  FOR INSERT
  WITH CHECK (true);

-- Solo usuarios autenticados pueden leer (admin)
CREATE POLICY "Authenticated can read applications"
  ON public.provider_applications
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Solo usuarios autenticados pueden actualizar el estado
CREATE POLICY "Authenticated can update application status"
  ON public.provider_applications
  FOR UPDATE
  USING (auth.role() = 'authenticated');
