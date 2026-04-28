-- ═══════════════════════════════════════════════════════════════
-- SoyManada · Alinear naming de tiers  (bronze/activo/pro → bronze/silver/gold)
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- 1. Soltar constraints viejos
ALTER TABLE public.providers DROP CONSTRAINT IF EXISTS providers_tier_check;
ALTER TABLE public.profiles  DROP CONSTRAINT IF EXISTS profiles_tier_check;

-- 2. Migrar providers
UPDATE public.providers SET tier = 'silver' WHERE tier = 'activo';
UPDATE public.providers SET tier = 'gold'   WHERE tier = 'pro';

-- 3. Migrar profiles
UPDATE public.profiles  SET tier = 'silver' WHERE tier = 'activo';
UPDATE public.profiles  SET tier = 'gold'   WHERE tier = 'pro';

-- 4. Recrear constraints con valores correctos
ALTER TABLE public.providers
  ADD CONSTRAINT providers_tier_check
  CHECK (tier = ANY (ARRAY['bronze','silver','gold']));

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_tier_check
  CHECK (tier = ANY (ARRAY['bronze','silver','gold']));

COMMIT;

-- Verificación completa
SELECT
  (SELECT tier FROM public.providers WHERE user_id = '7410b6c7-068a-47ba-996a-13085131b0e7') AS faleuy_provider_tier,
  (SELECT tier FROM public.profiles  WHERE id       = '7410b6c7-068a-47ba-996a-13085131b0e7') AS faleuy_profile_tier,
  (SELECT pg_get_constraintdef(oid) FROM pg_constraint
   WHERE conrelid = 'public.providers'::regclass AND conname = 'providers_tier_check')        AS providers_constraint,
  (SELECT pg_get_constraintdef(oid) FROM pg_constraint
   WHERE conrelid = 'public.profiles'::regclass  AND conname = 'profiles_tier_check')         AS profiles_constraint,
  (SELECT json_agg(json_build_object('name', name, 'tier', tier) ORDER BY tier)
   FROM public.providers WHERE tier != 'bronze')                                              AS paid_providers;
