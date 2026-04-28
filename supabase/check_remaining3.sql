SELECT extname, extnamespace::regnamespace AS schema
FROM pg_extension
WHERE extname IN ('unaccent','btree_gist','btree_gin','pg_trgm');
