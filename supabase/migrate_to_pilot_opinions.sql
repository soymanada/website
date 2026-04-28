-- ═══════════════════════════════════════════════════════════════
-- SoyManada · Migración sistema de opiniones
-- Elimina sistema reviews (vacío, sin data) y apunta todo a pilot_opinions
-- ═══════════════════════════════════════════════════════════════

-- 1. Actualizar provider_metrics: reviews → pilot_opinions
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
FROM providers p
LEFT JOIN events         e ON e.provider_id = p.id
LEFT JOIN pilot_opinions o ON o.provider_id = p.id
GROUP BY p.id, p.name, p.slug, p.tier;

-- 2. Eliminar trigger del sistema viejo en reviews
DROP TRIGGER IF EXISTS on_review_inserted ON public.reviews;

-- 3. Eliminar función del trigger viejo
DROP FUNCTION IF EXISTS public.on_review_inserted();

-- 4. Eliminar tabla reviews (vacía, 0 rows)
DROP TABLE IF EXISTS public.reviews CASCADE;

-- Verificación
SELECT
  (SELECT COUNT(*) FROM public.pilot_opinions)  AS pilot_opinions_count,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') AS reviews_still_exists,
  (SELECT COUNT(*) FROM public.provider_metrics) AS metrics_rows;
