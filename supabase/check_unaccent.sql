SELECT proname, prosrc
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND (
    prosrc ILIKE '%unaccent%'
    OR prosrc ILIKE '%btree_gist%'
  );
