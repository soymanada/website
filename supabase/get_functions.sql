SELECT
  p.proname,
  pg_get_functiondef(p.oid) AS def
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('is_admin','set_updated_at','check_pilot_opinion_limit','get_user_id_by_email')
ORDER BY p.proname;
