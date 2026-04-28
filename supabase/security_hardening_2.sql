-- ═══════════════════════════════════════════════════════════════
-- SoyManada · Security Hardening — Parte 2
-- Items pendientes tras security_hardening.sql
-- ═══════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- 1.2 (resto)  verified_interactions — INSERT solo service_role
-- ────────────────────────────────────────────────────────────────
-- Problema: la policy "service role insert" tiene roles = {public},
-- lo que permite a cualquier anon o authenticated insertar
-- verified_interactions directamente desde el cliente.
-- service_role bypasea RLS de todas formas → no necesita policy.
-- Fix: eliminar la policy y dejar que solo el backend (service_role)
-- pueda insertar.

DROP POLICY IF EXISTS "service role insert" ON public.verified_interactions;

-- La policy SELECT "users read own interactions" está bien:
-- USING (auth.uid() = user_id) → anon recibe vacío, usuarios ven solo las suyas.


-- ────────────────────────────────────────────────────────────────
-- 1.4  Mover extensiones public → extensions schema
-- ────────────────────────────────────────────────────────────────
-- Riesgo en public: cualquier rol con CREATE en public podría
-- crear objetos con el mismo nombre y "secuestrar" la extensión.
-- Moverlas a un schema dedicado elimina esa superficie.
--
-- Sin impacto en producción:
--   • unaccent()   → no la usa ninguna función custom ni el frontend.
--   • btree_gist   → el índice no_overlapping_bookings referencia
--                    las operator classes por OID, no por nombre,
--                    por lo que sigue funcionando tras el ALTER.

CREATE SCHEMA IF NOT EXISTS extensions;

-- Dar acceso de lectura a los roles de Supabase
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;

-- Mover extensiones
ALTER EXTENSION unaccent   SET SCHEMA extensions;
ALTER EXTENSION btree_gist SET SCHEMA extensions;


-- ────────────────────────────────────────────────────────────────
-- Verificación
-- ────────────────────────────────────────────────────────────────
SELECT
  -- verified_interactions: no debe haber política INSERT para public
  NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'verified_interactions'
      AND cmd        = 'INSERT'
      AND 'public'   = ANY(roles)
  )                                                        AS vi_insert_locked,

  -- extensiones en schema correcto
  (SELECT extnamespace::regnamespace::text
   FROM pg_extension WHERE extname = 'unaccent')          AS unaccent_schema,

  (SELECT extnamespace::regnamespace::text
   FROM pg_extension WHERE extname = 'btree_gist')        AS btree_gist_schema,

  -- índice gist sigue existiendo
  EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'no_overlapping_bookings'
  )                                                        AS gist_index_intact;
