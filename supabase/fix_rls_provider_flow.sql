-- supabase/fix_rls_provider_flow.sql
-- Fixes RLS policies so the full provider onboarding flow works:
--   1. Admin can look up any profile by email (needed to link user_id on approval)
--   2. A provider can always read their own row in providers (even if active=false)
-- Run in Supabase → SQL Editor

-- ── 1. profiles table ────────────────────────────────────────────────
-- Allow any authenticated user to read profiles.
-- This is needed so the admin panel can do: SELECT id FROM profiles WHERE email = ?
-- Profiles only contain: id, role, email — not sensitive.

DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;

CREATE POLICY "Authenticated users can read profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ── 2. providers table ───────────────────────────────────────────────
-- Ensure a provider can always read their own row (even when active=false).
-- Public can already read active providers; this adds the owner exception.

DROP POLICY IF EXISTS "Provider can read own row" ON public.providers;

CREATE POLICY "Provider can read own row"
  ON public.providers
  FOR SELECT
  USING (user_id = auth.uid());

-- ── 3. providers table — owner can update own row ────────────────────
-- Needed for TrialBanner to activate Gold trial (updates tier + trial dates).

DROP POLICY IF EXISTS "Provider can update own row" ON public.providers;

CREATE POLICY "Provider can update own row"
  ON public.providers
  FOR UPDATE
  USING (user_id = auth.uid());

-- ── Verify ───────────────────────────────────────────────────────────
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('profiles', 'providers')
ORDER BY tablename, policyname;
