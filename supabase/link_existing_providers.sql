-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Vincular proveedores existentes a sus cuentas de auth
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Requiere: get_user_id_by_email.sql ejecutado previamente
-- ─────────────────────────────────────────────────────────────────

-- Paso 1: Ver estado actual
SELECT
  p.id,
  p.name,
  p.user_id,
  u.email AS auth_email
FROM public.providers p
LEFT JOIN auth.users u ON u.id = p.user_id
ORDER BY p.created_at;

-- Paso 2: Vincular automáticamente donde el email del contacto matchea auth.users
-- (usa provider_applications como fuente de emails)
UPDATE public.providers prov
SET user_id = public.get_user_id_by_email(app.contact_email)
FROM public.provider_applications app
WHERE lower(trim(prov.name)) = lower(trim(app.business_name))
  AND prov.user_id IS NULL
  AND public.get_user_id_by_email(app.contact_email) IS NOT NULL;

-- Paso 3: Actualizar role = 'provider' en profiles para los recién vinculados
INSERT INTO public.profiles (id, role, tier)
SELECT p.user_id, 'provider', 'bronze'
FROM public.providers p
WHERE p.user_id IS NOT NULL
ON CONFLICT (id) DO UPDATE
  SET role = CASE
    WHEN profiles.role = 'admin' THEN 'admin'
    ELSE 'provider'
  END;

-- Paso 4: Ver resultado
SELECT p.id, p.name, p.user_id, u.email
FROM public.providers p
LEFT JOIN auth.users u ON u.id = p.user_id
ORDER BY p.created_at;

-- Paso 5: Para vincular manualmente uno específico por email de Gmail:
-- UPDATE public.providers
-- SET user_id = public.get_user_id_by_email('email@gmail.com')
-- WHERE id = 'PROVIDER_ID_AQUI';
