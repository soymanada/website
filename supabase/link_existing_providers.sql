-- supabase/link_existing_providers.sql
-- Vincula proveedores existentes con user_id = null a sus cuentas Gmail.
-- Corre PRIMERO get_user_id_by_email.sql antes de este script.
-- Run in Supabase → SQL Editor

-- ── PASO 1: Ver el estado actual ─────────────────────────────────────
-- Muestra todos los proveedores y si tienen usuario vinculado
SELECT
  p.id,
  p.name,
  p.user_id,
  pa.contact_email,
  public.get_user_id_by_email(pa.contact_email) AS found_user_id
FROM public.providers p
LEFT JOIN public.provider_applications pa
  ON lower(pa.business_name) = lower(p.name)
  AND pa.status = 'approved'
ORDER BY p.created_at DESC;

-- ── PASO 2: Vincular automáticamente por email de la postulación ─────
-- Actualiza user_id donde hay match en auth.users
UPDATE public.providers p
SET user_id = public.get_user_id_by_email(pa.contact_email)
FROM public.provider_applications pa
WHERE lower(pa.business_name) = lower(p.name)
  AND pa.status = 'approved'
  AND p.user_id IS NULL
  AND public.get_user_id_by_email(pa.contact_email) IS NOT NULL;

-- ── PASO 3: Actualizar rol a 'provider' para los usuarios vinculados ─
UPDATE public.profiles
SET role = 'provider'
WHERE id IN (
  SELECT user_id FROM public.providers WHERE user_id IS NOT NULL
)
AND role != 'admin';

-- ── PASO 4: Ver resultado final ───────────────────────────────────────
SELECT id, name, user_id FROM public.providers ORDER BY created_at DESC;

-- ── PASO 5: Proveedores que aún quedan sin vincular (linkeo manual) ──
-- Si quedan filas con user_id = null, vincula manualmente:
--
-- UPDATE public.providers
-- SET user_id = public.get_user_id_by_email('email-del-proveedor@gmail.com')
-- WHERE id = 'ID-DEL-PROVEEDOR';
--
-- UPDATE public.profiles SET role = 'provider'
-- WHERE id = public.get_user_id_by_email('email-del-proveedor@gmail.com');
