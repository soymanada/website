-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Tabla de fotos comunitarias
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- NOTA: Crear bucket 'community-photos' (público) en Storage UI primero
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.community_photos (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT        NOT NULL,
  public_url   TEXT        NOT NULL,
  caption      TEXT        CHECK (char_length(caption) <= 200),
  status       TEXT        NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS community_photos_user_id_idx  ON public.community_photos (user_id);
CREATE INDEX IF NOT EXISTS community_photos_status_idx   ON public.community_photos (status);
CREATE INDEX IF NOT EXISTS community_photos_created_idx  ON public.community_photos (created_at DESC);

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE public.community_photos ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver fotos aprobadas
CREATE POLICY "community_photos_select_approved" ON public.community_photos
  FOR SELECT USING (status = 'approved');

-- Usuarios autenticados pueden subir fotos
CREATE POLICY "community_photos_insert_auth" ON public.community_photos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Solo admins pueden actualizar el estado (aprobar/rechazar)
CREATE POLICY "community_photos_update_admin" ON public.community_photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ── Storage RLS del bucket community-photos ───────────────────────

-- Lectura pública
CREATE POLICY "Public read community-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-photos');

-- Solo usuarios autenticados pueden subir
CREATE POLICY "Auth users upload community-photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'community-photos');

-- Solo pueden eliminar su propio archivo
CREATE POLICY "Users delete own community-photo"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'community-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
