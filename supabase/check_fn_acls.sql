-- 3. Todas las funciones SECURITY DEFINER en public y sus ACLs
SELECT
  p.proname                                    AS function_name,
  pg_get_function_arguments(p.oid)             AS args,
  pg_get_function_result(p.oid)                AS returns,
  p.prosecdef                                  AS security_definer,
  p.proacl                                     AS acl
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true
ORDER BY p.proname;
