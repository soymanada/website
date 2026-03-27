-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Storage bucket avatars + políticas RLS
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- NOTA: El bucket debe crearse manualmente desde Storage UI primero
--   Name: avatars | Public: ON | Max size: 2MB | MIME: jpg, png, webp
-- ─────────────────────────────────────────────────────────────────

-- Agregar columna avatar_url a providers si no existe
ALTER TABLE public.providers ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ── Políticas RLS del bucket avatars ─────────────────────────────

-- Lectura pública
CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Solo proveedores autenticados pueden subir su avatar
CREATE POLICY "Providers can upload avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND name = (
      SELECT id::text FROM public.providers WHERE user_id = auth.uid() LIMIT 1
    ) || '/avatar.' || split_part(name, '.', -1)
  );

-- Solo pueden actualizar su propio archivo
CREATE POLICY "Providers can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND name LIKE (
      SELECT id::text FROM public.providers WHERE user_id = auth.uid() LIMIT 1
    ) || '/%'
  );

-- Solo pueden eliminar su propio archivo
CREATE POLICY "Providers can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND name LIKE (
      SELECT id::text FROM public.providers WHERE user_id = auth.uid() LIMIT 1
    ) || '/%'
  );
