UPDATE public.providers
SET tier = 'pro'
WHERE user_id = '7410b6c7-068a-47ba-996a-13085131b0e7';

SELECT
  p.tier        AS profile_tier,
  pr.tier       AS provider_tier,
  pr.name       AS provider_name
FROM public.profiles  p
JOIN public.providers pr ON pr.user_id = p.id
WHERE p.id = '7410b6c7-068a-47ba-996a-13085131b0e7';
