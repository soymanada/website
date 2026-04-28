SELECT
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'provider_applications',
    'provider_submissions',
    'site_feedback',
    'events',
    'profiles',
    'verified_interactions'
  )
ORDER BY tablename, policyname;
