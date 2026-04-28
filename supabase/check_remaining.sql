-- Estado de lo pendiente según el plan

-- 1. verified_interactions: política INSERT actual
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'verified_interactions';

-- 2. service_requests y site_feedback (recreadas en fix_forms_and_providers.sql)
SELECT tablename, policyname, cmd, roles, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('service_requests','site_feedback','provider_submissions')
ORDER BY tablename, policyname;

-- 3. Extensiones en public
SELECT extname, extnamespace::regnamespace AS schema
FROM pg_extension
WHERE extname IN ('unaccent','btree_gist','btree_gin','pg_trgm');

-- 4. Verificar views ya tienen security_invoker (opción en reloptions)
SELECT relname, reloptions
FROM pg_class
WHERE relkind = 'v'
  AND relnamespace = 'public'::regnamespace
  AND relname IN (
    'provider_metrics','provider_activity_weekly',
    'provider_activity_hourly','provider_feedback_keywords',
    'profiles_with_effective_tier'
  );
