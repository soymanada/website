SELECT pg_get_constraintdef(oid) AS constraint_def
FROM pg_constraint
WHERE conrelid = 'public.providers'::regclass
  AND conname ILIKE '%tier%';
