-- Fix v3: storage.foldername(p.name) → storage.foldername(name)
-- p.name era providers.name (ej. "Francisco Aleuy"), no el path del objeto.
-- name (sin prefijo) es storage.objects.name = el path real del archivo.

DROP POLICY IF EXISTS "avatars_provider_upload" ON storage.objects;
CREATE POLICY "avatars_provider_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'provider-avatars'
    AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE (p.id)::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "avatars_provider_update" ON storage.objects;
CREATE POLICY "avatars_provider_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'provider-avatars'
    AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE (p.id)::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'provider-avatars'
    AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE (p.id)::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );
