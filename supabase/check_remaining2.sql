SELECT
  tablename, policyname, cmd, roles::text, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('verified_interactions','service_requests','site_feedback','provider_submissions')
ORDER BY tablename, policyname;
