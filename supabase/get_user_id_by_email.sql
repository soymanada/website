-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Función para buscar user_id por email en auth.users
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_user_id_by_email(lookup_email TEXT)
RETURNS UUID LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT id FROM auth.users
  WHERE lower(trim(email)) = lower(trim(lookup_email)) LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_user_id_by_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) TO authenticated;
