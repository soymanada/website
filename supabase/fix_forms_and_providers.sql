-- ═══════════════════════════════════════════════════════════════
-- SoyManada · Fix schemas + whatsapp_addon + migrate reviews
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Recrear category_suggestions con schema correcto ─────────
DROP TABLE IF EXISTS public.category_suggestions CASCADE;

CREATE TABLE public.category_suggestions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  role       TEXT        CHECK (role IN ('migrant', 'provider')),
  name       TEXT,
  city       TEXT,
  message    TEXT        NOT NULL,
  email      TEXT
);

ALTER TABLE public.category_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "category_suggestions_insert"
  ON public.category_suggestions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "category_suggestions_admin_select"
  ON public.category_suggestions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ── 2. Recrear service_requests con schema correcto ─────────────
DROP TABLE IF EXISTS public.service_requests CASCADE;

CREATE TABLE public.service_requests (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  category    TEXT,
  description TEXT        NOT NULL,
  city        TEXT,
  email       TEXT
);

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_requests_insert"
  ON public.service_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "service_requests_admin_select"
  ON public.service_requests FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ── 3. Columna whatsapp_addon en providers ──────────────────────
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS whatsapp_addon BOOLEAN NOT NULL DEFAULT false;

-- ── 4. Migración pilot_opinions: actualizar provider_metrics ────
CREATE OR REPLACE VIEW public.provider_metrics AS
SELECT
  p.id                                                             AS provider_id,
  p.name,
  p.slug,
  p.tier,
  COUNT(DISTINCT e.id) FILTER (
    WHERE e.event_type = 'view'
      AND e.created_at >= now() - interval '7 days'
  )                                                                AS views_7d,
  COUNT(DISTINCT e.id) FILTER (
    WHERE e.event_type IN (
      'click_whatsapp','click_email','click_website',
      'click_calendar','click_payment'
    )
    AND e.created_at >= now() - interval '7 days'
  )                                                                AS clicks_7d,
  COUNT(DISTINCT o.id)                                             AS total_reviews,
  ROUND(AVG(o.rating), 2)                                         AS avg_rating,
  COUNT(DISTINCT o.id) FILTER (
    WHERE o.created_at >= now() - interval '7 days'
  )                                                                AS reviews_7d
FROM public.providers p
LEFT JOIN public.events         e ON e.provider_id = p.id
LEFT JOIN public.pilot_opinions o ON o.provider_id = p.id
GROUP BY p.id, p.name, p.slug, p.tier;

-- ── 5. Eliminar sistema reviews viejo ───────────────────────────
DROP TRIGGER  IF EXISTS on_review_inserted ON public.reviews;
DROP FUNCTION IF EXISTS public.on_review_inserted();
DROP TABLE    IF EXISTS public.reviews CASCADE;

-- ── Verificación ─────────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM public.category_suggestions)                   AS cat_suggestions,
  (SELECT COUNT(*) FROM public.service_requests)                       AS service_requests,
  (SELECT column_name FROM information_schema.columns
   WHERE table_name='providers' AND column_name='whatsapp_addon')      AS whatsapp_addon_col,
  NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name='reviews'
  )                                                                     AS reviews_dropped;
