-- ─────────────────────────────────────────────────────────────────
-- BACKEND 1 — Verificar tabla provider_applications
-- Ejecutar primero. Si devuelve false, ejecutar create_provider_applications.sql
-- ─────────────────────────────────────────────────────────────────

SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'provider_applications'
) AS tabla_existe;
