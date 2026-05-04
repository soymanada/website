-- Fix: auth loop + trigger explícito + desbloqueo de nizari@live.com
-- 1. Confirmar email de Nicolás manualmente (email_confirmed_at era NULL)
UPDATE auth.users
SET    email_confirmed_at = now()
WHERE  email = 'nizari@live.com'
  AND  email_confirmed_at IS NULL;

-- 2. Crear perfil de Nicolás que nunca se insertó
INSERT INTO public.profiles (id, email, role, tier)
SELECT id, email, 'migrant', 'bronze'
FROM   auth.users
WHERE  email = 'nizari@live.com'
ON CONFLICT (id) DO NOTHING;

-- 3. Actualizar trigger handle_new_user para incluir tier explícito
--    (ya no depende del DEFAULT de la columna)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, tier)
  VALUES (NEW.id, NEW.email, 'migrant', 'bronze')
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
