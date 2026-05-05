-- Fix: normalizar payment_link en la DB (BEFORE trigger)
-- El frontend viejo puede enviar '' (string vacío) porque Vercel está
-- desplegando desde gh-pages con código sin la normalización.
-- Este trigger convierte '' → NULL y hace trim antes de validar el constraint,
-- independientemente de la versión del frontend.

CREATE OR REPLACE FUNCTION public.normalize_payment_link()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Convertir string vacío o whitespace a NULL
  IF NEW.payment_link IS NOT NULL AND trim(NEW.payment_link) = '' THEN
    NEW.payment_link := NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Aplica en INSERT y UPDATE
DROP TRIGGER IF EXISTS trg_normalize_payment_link ON public.providers;

CREATE TRIGGER trg_normalize_payment_link
  BEFORE INSERT OR UPDATE OF payment_link ON public.providers
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_payment_link();
