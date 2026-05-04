-- Migration: tier_safety_net
-- Centraliza los valores de tier en funciones helper para que ningún trigger
-- los tenga hardcodeados. Si los tiers cambian en el futuro, solo hay que
-- actualizar estas dos funciones — no buscar strings en todo el código.

-- ── Función 1: tier por defecto para usuarios nuevos ────────────────────────
CREATE OR REPLACE FUNCTION public.default_migrant_tier()
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT 'bronze'::text
$$;

COMMENT ON FUNCTION public.default_migrant_tier() IS
  'Tier asignado a nuevos usuarios migrantes al registrarse. Actualizar aquí si cambia el tier base.';

-- ── Función 2: tier de trial para el primer login ────────────────────────────
CREATE OR REPLACE FUNCTION public.default_trial_tier()
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT 'wolf'::text
$$;

COMMENT ON FUNCTION public.default_trial_tier() IS
  'Tier de trial asignado al primer login del proveedor. Actualizar aquí si cambia el tier de trial.';

-- ── Actualizar handle_new_user para usar la función helper ───────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, tier)
  VALUES (NEW.id, NEW.email, 'migrant', public.default_migrant_tier())
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'handle_new_user error for user %: % %',
      NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- ── Actualizar handle_first_login para usar la función helper ────────────────
CREATE OR REPLACE FUNCTION public.handle_first_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.last_sign_in_at IS NOT NULL AND
     (OLD.last_sign_in_at IS NULL OR OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  THEN
    UPDATE public.profiles
    SET
      first_login_at = COALESCE(first_login_at, NEW.last_sign_in_at),
      tier = CASE
               WHEN first_login_at IS NULL THEN public.default_trial_tier()
               ELSE tier
             END
    WHERE id = NEW.id
      AND first_login_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- ── Validación: verifica que ninguna función del schema public tenga
--    tier strings hardcodeados que no correspondan al constraint actual ──────
-- Corre esto después de cualquier rename de tiers:
--
-- SELECT proname, prosrc
-- FROM pg_proc
-- WHERE pronamespace = 'public'::regnamespace
--   AND (
--         prosrc ILIKE '%''gold''%'
--      OR prosrc ILIKE '%''silver''%'
--      OR prosrc ILIKE '%''activo''%'
--      OR prosrc ILIKE '%''pro''%'
--   );
--
-- Resultado esperado: 0 filas. Si hay filas, esas funciones tienen tiers viejos.
