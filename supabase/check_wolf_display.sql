-- Estado completo de faleuy para entender el badge "Pro"
SELECT
  p.tier                AS profile_tier,
  p.first_login_at,
  -- effective_tier que calcula la vista (lo que usa useAuth)
  CASE
    WHEN p.first_login_at IS NOT NULL
     AND now() < p.first_login_at + interval '90 days'
    THEN 'gold'
    ELSE p.tier
  END                   AS effective_tier_computed,
  pr.tier               AS provider_tier,
  pr.whatsapp_addon
FROM public.profiles  p
JOIN public.providers pr ON pr.user_id = p.id
WHERE p.id = '7410b6c7-068a-47ba-996a-13085131b0e7';
