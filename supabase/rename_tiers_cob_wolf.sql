-- ═══════════════════════════════════════════════════════════════
-- SoyManada · Renombrar tiers: silver → cob, gold → wolf
-- Fuente única de verdad: bronze / cob / wolf
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- 1. Soltar constraints viejos
ALTER TABLE public.providers DROP CONSTRAINT IF EXISTS providers_tier_check;
ALTER TABLE public.profiles  DROP CONSTRAINT IF EXISTS profiles_tier_check;

-- 2. Migrar datos
UPDATE public.providers SET tier = 'cob'  WHERE tier = 'silver';
UPDATE public.providers SET tier = 'wolf' WHERE tier = 'gold';
UPDATE public.profiles  SET tier = 'cob'  WHERE tier = 'silver';
UPDATE public.profiles  SET tier = 'wolf' WHERE tier = 'gold';

-- 3. Nuevos constraints
ALTER TABLE public.providers
  ADD CONSTRAINT providers_tier_check
  CHECK (tier = ANY (ARRAY['bronze','cob','wolf']));

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_tier_check
  CHECK (tier = ANY (ARRAY['bronze','cob','wolf']));

COMMIT;

-- 4. Actualizar vista profiles_with_effective_tier
--    (retornaba 'gold' en trial → ahora retorna 'wolf')
DROP VIEW IF EXISTS public.profiles_with_effective_tier;
CREATE VIEW public.profiles_with_effective_tier
  WITH (security_invoker = true)
AS
SELECT
  id,
  role,
  created_at,
  tier,
  email,
  first_login_at,
  CASE
    WHEN first_login_at IS NOT NULL
     AND now() < first_login_at + interval '90 days'
    THEN 'wolf'::text
    ELSE tier
  END                                                                         AS effective_tier,
  CASE
    WHEN first_login_at IS NOT NULL
     AND now() < first_login_at + interval '90 days'
    THEN extract(day FROM (first_login_at + interval '90 days') - now())::integer
    ELSE 0
  END                                                                         AS trial_days_remaining
FROM public.profiles;

GRANT SELECT ON public.profiles_with_effective_tier TO anon, authenticated;

-- Verificación
SELECT
  (SELECT pg_get_constraintdef(oid) FROM pg_constraint
   WHERE conrelid = 'public.providers'::regclass AND conname = 'providers_tier_check') AS providers_constraint,
  (SELECT pg_get_constraintdef(oid) FROM pg_constraint
   WHERE conrelid = 'public.profiles'::regclass  AND conname = 'profiles_tier_check')  AS profiles_constraint,
  (SELECT json_agg(json_build_object('name', name, 'tier', tier) ORDER BY tier)
   FROM public.providers WHERE tier != 'bronze')                                       AS paid_providers,
  (SELECT tier FROM public.providers WHERE user_id = '7410b6c7-068a-47ba-996a-13085131b0e7') AS faleuy_tier;
