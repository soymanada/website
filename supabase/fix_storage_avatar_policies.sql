-- Fix: recrear políticas de storage para provider-avatars
-- Eliminadas en security_hardening.sql sin reemplazo → uploads daban 400.
-- Estructura de path: provider-avatars/{user_id}/avatar.png

-- Lectura pública (avatares visibles para todos)
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'provider-avatars');

-- Upload: proveedor solo puede subir a su propia carpeta
CREATE POLICY "avatars_provider_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'provider-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Update: proveedor solo puede reemplazar su propio avatar
CREATE POLICY "avatars_provider_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'provider-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'provider-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Delete: proveedor puede borrar su propio avatar
CREATE POLICY "avatars_provider_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'provider-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
