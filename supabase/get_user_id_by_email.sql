-- supabase/get_user_id_by_email.sql
-- Función con SECURITY DEFINER para buscar un user_id desde auth.users por email.
-- El cliente anon no puede leer auth.users directamente — esta función lo permite
-- de forma controlada. Usada en approve() del AdminPanel y en el script de linking.
-- Run in Supabase → SQL Editor

CREATE OR REPLACE FUNCTION public.get_user_id_by_email(lookup_email TEXT)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT id
  FROM auth.users
  WHERE lower(trim(email)) = lower(trim(lookup_email))
  LIMIT 1;
$$;

-- Solo usuarios autenticados pueden llamar esta función
REVOKE ALL ON FUNCTION public.get_user_id_by_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) TO authenticated;

-- Verificar
SELECT public.get_user_id_by_email('tu-email@gmail.com');
