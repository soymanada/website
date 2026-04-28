-- Estado actual de faleuy@gmail.com
SELECT
  u.id,
  u.email,
  p.role,
  p.tier         AS profile_tier,
  p.first_login_at,
  pr.id          AS provider_id,
  pr.name        AS provider_name,
  pr.tier        AS provider_tier,
  pr.verified,
  pr.whatsapp_addon
FROM auth.users u
LEFT JOIN public.profiles  p  ON p.id  = u.id
LEFT JOIN public.providers pr ON pr.user_id = u.id
WHERE lower(u.email) = 'faleuy@gmail.com';
