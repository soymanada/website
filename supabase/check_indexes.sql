-- Índices que usan gist (potencialmente btree_gist)
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexdef ILIKE '%gist%';
