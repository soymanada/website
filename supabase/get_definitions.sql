SELECT viewname, definition
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN (
    'provider_metrics',
    'provider_activity_weekly',
    'provider_activity_hourly',
    'provider_feedback_keywords',
    'profiles_with_effective_tier'
  )
ORDER BY viewname;
