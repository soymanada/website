-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Manuales de proveedores (PDF / Word)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

-- ── 1. Storage bucket ────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'provider-manuals',
  'provider-manuals',
  true,
  20971520,  -- 20 MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ── 2. Storage policies ──────────────────────────────────────────

-- Lectura pública
CREATE POLICY "manuals_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'provider-manuals');

-- Upload: solo a la carpeta del propio proveedor
CREATE POLICY "manuals_provider_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'provider-manuals'
    AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE (p.id)::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );

-- Update
CREATE POLICY "manuals_provider_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'provider-manuals'
    AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE (p.id)::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'provider-manuals'
    AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE (p.id)::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );

-- Delete
CREATE POLICY "manuals_provider_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'provider-manuals'
    AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE (p.id)::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );

-- ── 3. Tabla provider_manuals ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.provider_manuals (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID        NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  description TEXT        CHECK (char_length(description) <= 500),
  -- storage path: {provider_id}/{uuid}_{filename}
  file_path   TEXT        NOT NULL,
  file_name   TEXT        NOT NULL,
  file_type   TEXT        NOT NULL CHECK (file_type IN ('pdf', 'docx', 'doc')),
  file_size   INT,                    -- bytes
  visible     BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS provider_manuals_provider_id_idx
  ON public.provider_manuals (provider_id);

CREATE INDEX IF NOT EXISTS provider_manuals_visible_idx
  ON public.provider_manuals (provider_id, visible)
  WHERE visible = true;

ALTER TABLE public.provider_manuals ENABLE ROW LEVEL SECURITY;

-- ── 4. RLS policies ──────────────────────────────────────────────

-- Lectura pública (solo manuales visibles)
CREATE POLICY "manuals_public_select"
  ON public.provider_manuals FOR SELECT
  TO public
  USING (visible = true);

-- El proveedor ve todos los suyos (incluso hidden)
CREATE POLICY "manuals_provider_own_select"
  ON public.provider_manuals FOR SELECT
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
  );

-- El proveedor inserta solo en su perfil (máx 20 manuales)
CREATE POLICY "manuals_provider_insert"
  ON public.provider_manuals FOR INSERT
  TO authenticated
  WITH CHECK (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
    AND (
      SELECT COUNT(*) FROM public.provider_manuals pm
      WHERE pm.provider_id = provider_id
    ) < 20
  );

-- El proveedor actualiza solo los suyos
CREATE POLICY "manuals_provider_update"
  ON public.provider_manuals FOR UPDATE
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
  );

-- El proveedor borra solo los suyos
CREATE POLICY "manuals_provider_delete"
  ON public.provider_manuals FOR DELETE
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
  );

-- ── 5. updated_at trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_manual_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_provider_manuals_updated_at
  BEFORE UPDATE ON public.provider_manuals
  FOR EACH ROW EXECUTE FUNCTION public.set_manual_updated_at();

-- ── 6. Permisos ──────────────────────────────────────────────────
GRANT SELECT ON public.provider_manuals TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.provider_manuals TO authenticated;

-- ── 7. Vista pública para el frontend ────────────────────────────
-- Une el manual con datos básicos del proveedor para facilitar renderizado
CREATE OR REPLACE VIEW public.provider_manuals_public AS
  SELECT
    pm.id,
    pm.provider_id,
    p.name        AS provider_name,
    pm.title,
    pm.description,
    pm.file_path,
    pm.file_name,
    pm.file_type,
    pm.file_size,
    pm.created_at
  FROM public.provider_manuals pm
  JOIN public.providers p ON p.id = pm.provider_id
  WHERE pm.visible = true
    AND p.active   = true;

GRANT SELECT ON public.provider_manuals_public TO anon, authenticated;
