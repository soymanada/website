-- ═══════════════════════════════════════════════════════════════
-- SoyManada · Security Hardening
-- Items 1.1 → 1.4 del plan de seguridad
-- ═══════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- 1.1  Recrear vistas con security_invoker = true
--      PG 15+ feature: la vista usa los permisos del llamador,
--      no del propietario → RLS se respeta correctamente.
-- ────────────────────────────────────────────────────────────────

DROP VIEW IF EXISTS public.provider_metrics;
CREATE VIEW public.provider_metrics
  WITH (security_invoker = true)
AS
SELECT
  p.id                                                                                      AS provider_id,
  p.name,
  p.slug,
  p.tier,
  count(DISTINCT e.id) FILTER (
    WHERE e.event_type = 'view'
      AND e.created_at >= now() - interval '7 days'
  )                                                                                         AS views_7d,
  count(DISTINCT e.id) FILTER (
    WHERE e.event_type = ANY (ARRAY[
      'click_whatsapp','click_email','click_website',
      'click_calendar','click_payment'
    ])
    AND e.created_at >= now() - interval '7 days'
  )                                                                                         AS clicks_7d,
  count(DISTINCT o.id)                                                                      AS total_reviews,
  round(avg(o.rating), 2)                                                                   AS avg_rating,
  count(DISTINCT o.id) FILTER (
    WHERE o.created_at >= now() - interval '7 days'
  )                                                                                         AS reviews_7d
FROM public.providers p
LEFT JOIN public.events         e ON e.provider_id = p.id
LEFT JOIN public.pilot_opinions o ON o.provider_id = p.id
GROUP BY p.id, p.name, p.slug, p.tier;

-- ──

DROP VIEW IF EXISTS public.provider_activity_weekly;
CREATE VIEW public.provider_activity_weekly
  WITH (security_invoker = true)
AS
SELECT
  provider_id,
  trim(both from to_char(created_at AT TIME ZONE 'America/Toronto', 'Day')) AS day_of_week,
  extract(dow FROM created_at AT TIME ZONE 'America/Toronto')               AS day_number,
  count(*) FILTER (WHERE event_type = 'view')                               AS views,
  count(*) FILTER (WHERE event_type <> 'view')                              AS clicks
FROM public.events
WHERE created_at >= now() - interval '90 days'
GROUP BY
  provider_id,
  trim(both from to_char(created_at AT TIME ZONE 'America/Toronto', 'Day')),
  extract(dow FROM created_at AT TIME ZONE 'America/Toronto')
ORDER BY provider_id, extract(dow FROM created_at AT TIME ZONE 'America/Toronto');

-- ──

DROP VIEW IF EXISTS public.provider_activity_hourly;
CREATE VIEW public.provider_activity_hourly
  WITH (security_invoker = true)
AS
SELECT
  provider_id,
  extract(hour FROM created_at AT TIME ZONE 'UTC')::integer AS hour_utc,
  count(*) FILTER (WHERE event_type = 'view')               AS views,
  count(*) FILTER (WHERE event_type = 'contact_click')      AS contacts
FROM public.events
WHERE created_at > now() - interval '28 days'
GROUP BY provider_id, extract(hour FROM created_at AT TIME ZONE 'UTC')::integer;

-- ──

DROP VIEW IF EXISTS public.provider_feedback_keywords;
CREATE VIEW public.provider_feedback_keywords
  WITH (security_invoker = true)
AS
SELECT NULL::uuid AS provider_id, NULL::text AS keyword, NULL::integer AS count
WHERE false;

-- ──

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
    THEN 'gold'::text
    ELSE tier
  END                                                                     AS effective_tier,
  CASE
    WHEN first_login_at IS NOT NULL
     AND now() < first_login_at + interval '90 days'
    THEN extract(day FROM (first_login_at + interval '90 days') - now())::integer
    ELSE 0
  END                                                                     AS trial_days_remaining
FROM public.profiles;

-- Re-grant SELECT (DROP + CREATE revoca grants anteriores)
GRANT SELECT ON public.provider_metrics                TO anon, authenticated;
GRANT SELECT ON public.provider_activity_weekly        TO anon, authenticated;
GRANT SELECT ON public.provider_activity_hourly        TO anon, authenticated;
GRANT SELECT ON public.provider_feedback_keywords      TO anon, authenticated;
GRANT SELECT ON public.profiles_with_effective_tier    TO anon, authenticated;


-- ────────────────────────────────────────────────────────────────
-- 1.2  Tighten RLS
-- ────────────────────────────────────────────────────────────────

-- ── provider_applications: cualquiera podía leer y actualizar ──
DROP POLICY IF EXISTS "select_all"                               ON public.provider_applications;
DROP POLICY IF EXISTS "update_all"                               ON public.provider_applications;
DROP POLICY IF EXISTS "Authenticated can read applications"      ON public.provider_applications;
DROP POLICY IF EXISTS "Authenticated can update application status" ON public.provider_applications;

-- Solo admins pueden leer solicitudes
CREATE POLICY "applications_admin_select"
  ON public.provider_applications FOR SELECT
  USING (is_admin());

-- Solo admins pueden actualizar (cambiar status, notas, etc.)
CREATE POLICY "applications_admin_update"
  ON public.provider_applications FOR UPDATE
  USING    (is_admin())
  WITH CHECK (is_admin());

-- ── profiles: INSERT abierto → acotar a propio auth.uid() ──────
DROP POLICY IF EXISTS "profiles_insert_on_signup" ON public.profiles;

-- handle_new_user es SECURITY DEFINER → bypassea RLS, no se afecta.
-- Esta policy sólo cubre inserts directos via API.
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());


-- ────────────────────────────────────────────────────────────────
-- 1.3  Fijar search_path en funciones sin él
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_pilot_opinion_limit()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  IF (
    SELECT count(*) FROM public.pilot_opinions
    WHERE provider_id = NEW.provider_id
  ) >= 10 THEN
    RAISE EXCEPTION 'cupo_completo: Este proveedor ya alcanzó el límite de 10 opiniones';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_id_by_email(lookup_email text)
  RETURNS uuid
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT id FROM auth.users
  WHERE lower(trim(email)) = lower(trim(lookup_email))
  LIMIT 1;
$$;


-- ────────────────────────────────────────────────────────────────
-- 1.4  Storage: eliminar policies duplicadas / demasiado amplias
-- ────────────────────────────────────────────────────────────────

-- UPDATE sin restricción de path → cualquier autenticado puede
-- sobreescribir el avatar de cualquier proveedor.
DROP POLICY IF EXISTS "Providers can update avatars"  ON storage.objects;

-- INSERT sin restricción de path → cualquier autenticado puede
-- subir archivos a cualquier ruta del bucket.
DROP POLICY IF EXISTS "Providers can upload avatars"  ON storage.objects;

-- SELECT duplicado (ya existe "Public avatar read" con la misma condición).
DROP POLICY IF EXISTS "Public read avatars"           ON storage.objects;


-- ────────────────────────────────────────────────────────────────
-- Verificación
-- ────────────────────────────────────────────────────────────────
SELECT
  -- vistas recreadas
  (SELECT count(*) FROM pg_views
   WHERE schemaname = 'public'
     AND viewname IN (
       'provider_metrics','provider_activity_weekly',
       'provider_activity_hourly','provider_feedback_keywords',
       'profiles_with_effective_tier'
     )
  )                                                                        AS views_ok,

  -- funciones con search_path
  (SELECT proconfig FROM pg_proc
   WHERE proname = 'is_admin'
     AND pronamespace = 'public'::regnamespace)                           AS is_admin_cfg,
  (SELECT proconfig FROM pg_proc
   WHERE proname = 'set_updated_at'
     AND pronamespace = 'public'::regnamespace)                           AS set_updated_at_cfg,
  (SELECT proconfig FROM pg_proc
   WHERE proname = 'check_pilot_opinion_limit'
     AND pronamespace = 'public'::regnamespace)                           AS check_pilot_cfg,
  (SELECT proconfig FROM pg_proc
   WHERE proname = 'get_user_id_by_email'
     AND pronamespace = 'public'::regnamespace)                           AS get_user_id_cfg,

  -- policies borradas
  NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename   = 'provider_applications'
      AND policyname IN ('select_all','update_all')
  )                                                                        AS dangerous_app_policies_removed,

  -- storage policies borradas
  NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname IN ('Providers can update avatars','Providers can upload avatars','Public read avatars')
  )                                                                        AS overly_broad_storage_removed;
