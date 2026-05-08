-- supabase/assign_provider_role_by_email.sql
-- Función SECURITY DEFINER: busca al usuario en auth.users por email
-- y le asigna el rol 'provider' en public.profiles en un solo paso.
-- Resuelve el problema de RLS que impide al admin actualizar perfiles ajenos.
-- Ejecutar en: Supabase Dashboard → SQL Editor

CREATE OR REPLACE FUNCTION public.assign_provider_role_by_email(target_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_id UUID;
BEGIN
  -- Buscar usuario en auth.users (SECURITY DEFINER permite leer auth.*)
  SELECT id INTO target_id
  FROM auth.users
  WHERE lower(trim(email)) = lower(trim(target_email))
  LIMIT 1;

  -- Si no existe en auth.users, el proveedor aún no se registró
  IF target_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Upsert del perfil con rol provider (bypass RLS al correr como owner)
  INSERT INTO public.profiles (id, role)
    VALUES (target_id, 'provider')
  ON CONFLICT (id)
    DO UPDATE SET role = 'provider';

  RETURN TRUE;
END;
$$;

-- Solo usuarios autenticados (admins) pueden llamar esta función
REVOKE ALL ON FUNCTION public.assign_provider_role_by_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_provider_role_by_email(TEXT) TO authenticated;
