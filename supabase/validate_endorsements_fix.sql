-- validate_endorsements_fix.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Validates that fix_endorsements_rls_recursion.sql was applied correctly.
-- Run this in the Supabase SQL Editor (read-only — no data is modified).
-- Each check prints PASS or FAIL with a short reason.
-- ─────────────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════════════
-- CHECK 1 — Function exists
-- ════════════════════════════════════════════════════════════════════════════
SELECT
  'CHECK 1 — Function exists' AS check_name,
  CASE
    WHEN COUNT(*) = 1 THEN 'PASS'
    ELSE 'FAIL — function public.get_active_endorsement_count(uuid) not found'
  END AS result
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'get_active_endorsement_count'
  AND p.proargtypes::text = (SELECT oid::text FROM pg_type WHERE typname = 'uuid');

-- ════════════════════════════════════════════════════════════════════════════
-- CHECK 2 — Function has SECURITY DEFINER
-- ════════════════════════════════════════════════════════════════════════════
SELECT
  'CHECK 2 — Function is SECURITY DEFINER' AS check_name,
  CASE
    WHEN COUNT(*) = 1 AND bool_and(p.prosecdef = true) THEN 'PASS'
    WHEN COUNT(*) = 0 THEN 'FAIL — function not found'
    ELSE 'FAIL — function exists but is NOT SECURITY DEFINER (prosecdef = false)'
  END AS result
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'get_active_endorsement_count';

-- ════════════════════════════════════════════════════════════════════════════
-- CHECK 3 — Function returns BIGINT
-- ════════════════════════════════════════════════════════════════════════════
SELECT
  'CHECK 3 — Function return type is BIGINT' AS check_name,
  CASE
    WHEN COUNT(*) = 1 AND bool_and(
      (SELECT typname FROM pg_type WHERE oid = p.prorettype) = 'int8'
    ) THEN 'PASS'
    WHEN COUNT(*) = 0 THEN 'FAIL — function not found'
    ELSE 'FAIL — unexpected return type: ' || (
      SELECT typname FROM pg_type WHERE oid = (
        SELECT prorettype FROM pg_proc pp
        JOIN pg_namespace nn ON nn.oid = pp.pronamespace
        WHERE nn.nspname = 'public' AND pp.proname = 'get_active_endorsement_count'
        LIMIT 1
      )
    )
  END AS result
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'get_active_endorsement_count';

-- ════════════════════════════════════════════════════════════════════════════
-- CHECK 4 — Policy "endorsements_provider_insert" exists on provider_endorsements
-- ════════════════════════════════════════════════════════════════════════════
SELECT
  'CHECK 4 — Policy endorsements_provider_insert exists' AS check_name,
  CASE
    WHEN COUNT(*) = 1 THEN 'PASS'
    ELSE 'FAIL — policy not found on public.provider_endorsements'
  END AS result
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename  = 'provider_endorsements'
  AND policyname = 'endorsements_provider_insert';

-- ════════════════════════════════════════════════════════════════════════════
-- CHECK 5 — Policy uses the SECURITY DEFINER function (not a self-referential subquery)
-- The fixed policy WITH CHECK clause must reference get_active_endorsement_count
-- and must NOT contain a correlated subquery back to provider_endorsements.
-- ════════════════════════════════════════════════════════════════════════════
SELECT
  'CHECK 5 — Policy uses SECURITY DEFINER function, no self-referential subquery' AS check_name,
  CASE
    WHEN COUNT(*) = 0 THEN
      'FAIL — policy not found'
    WHEN bool_and(
           with_check LIKE '%get_active_endorsement_count%'
         )
         AND bool_and(
           -- The with_check should NOT contain a direct subquery into provider_endorsements
           with_check NOT LIKE '%SELECT%FROM%provider_endorsements%'
         )
    THEN 'PASS'
    WHEN bool_and(with_check NOT LIKE '%get_active_endorsement_count%') THEN
      'FAIL — policy does not call get_active_endorsement_count (old version still active?)'
    ELSE
      'FAIL — policy WITH CHECK still contains a direct subquery into provider_endorsements (recursion risk)'
  END AS result
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename  = 'provider_endorsements'
  AND policyname = 'endorsements_provider_insert';

-- ════════════════════════════════════════════════════════════════════════════
-- CHECK 6 — Policy is FOR INSERT (correct command type)
-- ════════════════════════════════════════════════════════════════════════════
SELECT
  'CHECK 6 — Policy is FOR INSERT' AS check_name,
  CASE
    WHEN COUNT(*) = 1 AND bool_and(cmd = 'INSERT') THEN 'PASS'
    WHEN COUNT(*) = 0 THEN 'FAIL — policy not found'
    ELSE 'FAIL — policy cmd is "' || MAX(cmd) || '" instead of INSERT'
  END AS result
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename  = 'provider_endorsements'
  AND policyname = 'endorsements_provider_insert';

-- ════════════════════════════════════════════════════════════════════════════
-- CHECK 7 — All four expected RLS policies are present
-- ════════════════════════════════════════════════════════════════════════════
SELECT
  'CHECK 7 — All 4 RLS policies present on provider_endorsements' AS check_name,
  CASE
    WHEN COUNT(*) = 4 THEN 'PASS'
    ELSE 'FAIL — expected 4 policies, found ' || COUNT(*)::text
      || ': ' || string_agg(policyname, ', ' ORDER BY policyname)
  END AS result
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename  = 'provider_endorsements'
  AND policyname IN (
    'endorsements_public_read',
    'endorsements_provider_insert',
    'endorsements_provider_deactivate',
    'endorsements_admin_all'
  );

-- ════════════════════════════════════════════════════════════════════════════
-- CHECK 8 — READ-ONLY smoke test: SELECT from provider_endorsements (no recursion)
-- If RLS recursion is still present, this query itself will error.
-- We wrap in a DO block to catch the error and surface it as a FAIL row.
-- ════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  v_count  BIGINT;
  v_result TEXT;
BEGIN
  BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.provider_endorsements;

    v_result := 'PASS — SELECT returned ' || v_count::text || ' row(s) without recursion error';
  EXCEPTION
    WHEN OTHERS THEN
      v_result := 'FAIL — SELECT raised: ' || SQLERRM;
  END;

  RAISE NOTICE 'CHECK 8 — SELECT smoke test (no infinite recursion): %', v_result;
END;
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- CHECK 9 — Function body does not bypass the active=true filter
--            (guard: ensure the STABLE function filters on active = true)
-- ════════════════════════════════════════════════════════════════════════════
SELECT
  'CHECK 9 — Function body filters active = true' AS check_name,
  CASE
    WHEN COUNT(*) = 0 THEN 'FAIL — function not found'
    WHEN bool_and(pg_get_functiondef(p.oid) LIKE '%active = true%'
               OR pg_get_functiondef(p.oid) LIKE '%active=true%')
    THEN 'PASS'
    ELSE 'FAIL — function body does not contain "active = true" filter'
  END AS result
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'get_active_endorsement_count';

-- ════════════════════════════════════════════════════════════════════════════
-- SUMMARY — Print all policy definitions for visual inspection
-- ════════════════════════════════════════════════════════════════════════════
SELECT
  '— POLICY DEFINITIONS (for visual inspection) —' AS section,
  policyname,
  cmd,
  qual       AS using_clause,
  with_check AS with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename  = 'provider_endorsements'
ORDER BY policyname;
