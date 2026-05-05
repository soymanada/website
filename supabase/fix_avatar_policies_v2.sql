-- Fix v2: la carpeta del avatar es provider_id, no user_id.
-- La política anterior comprobaba foldername = auth.uid() lo cual siempre fallaba.
-- Ahora cruza el folder contra providers.id WHERE user_id = auth.uid().

-- Eliminar políticas incorrectas
DROP POLICY IF EXISTS "avatars_provider_upload" ON storage.objects;
DROP POLICY IF EXISTS "avatars_provider_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_provider_delete" ON storage.objects;
DROP POLICY IF EXISTS "avatars_public_read"     ON storage.objects;

-- Lectura pública
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'provider-avatars');

-- Upload: usuario puede subir solo a la carpeta de su propio proveedor
CREATE POLICY "avatars_provider_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'provider-avatars'
    AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );

-- Update: usuario puede reemplazar el avatar de su propio proveedor
CREATE POLICY "avatars_provider_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'provider-avatars'
    AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'provider-avatars'
    AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );

-- Delete: usuario puede borrar el avatar de su propio proveedor
CREATE POLICY "avatars_provider_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'provider-avatars'
    AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );
