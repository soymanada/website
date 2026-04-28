-- 1. Políticas INSERT duplicadas en provider_applications
SELECT policyname, cmd, roles::text, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'provider_applications' AND cmd = 'INSERT';

-- 2. Estado del bucket avatars (public vs private)
SELECT name, public FROM storage.buckets WHERE name = 'avatars';
