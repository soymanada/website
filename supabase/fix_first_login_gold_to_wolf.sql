-- Fix: handle_first_login usaba tier='gold' que ya no existe (renombrado a 'wolf')
-- Causa: rename_tiers_cob_wolf.sql actualizó constraint y datos pero no esta función.
-- Efecto: cualquier primer login retornaba 500 por violación del profiles_tier_check.

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
               WHEN first_login_at IS NULL THEN 'wolf'  -- primer login → trial wolf (era 'gold')
               ELSE tier                                 -- logins siguientes → no tocar
             END
    WHERE id = NEW.id
      AND first_login_at IS NULL;  -- guard: solo ejecuta una vez
  END IF;
  RETURN NEW;
END;
$$;
