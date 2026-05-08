-- fix_endorsements_rls_recursion.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- PROBLEMA:
--   La política "endorsements_provider_insert" contenía un subquery que
--   seleccionaba desde provider_endorsements dentro del propio RLS de
--   provider_endorsements → "infinite recursion detected in policy for relation".
--
-- SOLUCIÓN:
--   1. Crear función SECURITY DEFINER que cuenta endorsements activos sin
--      pasar por RLS (elimina la recursión).
--   2. Reemplazar la política INSERT usando esa función.
-- ─────────────────────────────────────────────────────────────────────────────

-- Paso 1: función helper que cuenta sin triggerear RLS
CREATE OR REPLACE FUNCTION public.get_active_endorsement_count(p_from_provider_id UUID)
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.provider_endorsements
  WHERE from_provider_id = p_from_provider_id
    AND active = true;
$$;

-- Paso 2: reemplazar política INSERT defectuosa
DROP POLICY IF EXISTS "endorsements_provider_insert" ON public.provider_endorsements;

CREATE POLICY "endorsements_provider_insert" ON public.provider_endorsements
  FOR INSERT WITH CHECK (
    -- El llamante debe ser dueño del proveedor y estar verificado
    EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id    = from_provider_id
        AND p.user_id  = auth.uid()
        AND p.verified = true
    )
    -- Límite de 5 endorsements activos — usando función SECURITY DEFINER (sin recursión)
    AND public.get_active_endorsement_count(from_provider_id) < 5
  );
