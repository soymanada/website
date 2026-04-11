-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Tabla de eventos y vistas de métricas de proveedores
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

-- ── 1. events ────────────────────────────────────────────────────
-- Registra vistas de perfil y clics en contacto desde ProviderCard.

CREATE TABLE IF NOT EXISTS public.events (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID        NOT NULL,   -- FK a providers.id (UUID)
  event_type  TEXT        NOT NULL CHECK (event_type IN ('view', 'contact_click')),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_provider_id_idx  ON public.events (provider_id);
CREATE INDEX IF NOT EXISTS events_created_at_idx   ON public.events (created_at DESC);
CREATE INDEX IF NOT EXISTS events_type_idx         ON public.events (event_type);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar eventos (incluyendo anónimos)
CREATE POLICY "events_insert_all"
  ON public.events FOR INSERT
  WITH CHECK (true);

-- El proveedor puede leer sus propios eventos
CREATE POLICY "events_provider_select"
  ON public.events FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
  );

-- ── 2. provider_metrics (vista) ───────────────────────────────────
-- Una fila por proveedor. Agrega eventos de los últimos 7 días
-- con reseñas publicadas. El dashboard lee con .eq('provider_id', uuid).

CREATE OR REPLACE VIEW public.provider_metrics AS
SELECT
  p.id                                                              AS provider_id,
  COUNT(e.id) FILTER (
    WHERE e.event_type = 'view'
      AND e.created_at > now() - interval '7 days'
  )                                                                 AS profile_views_week,
  COUNT(e.id) FILTER (
    WHERE e.event_type = 'contact_click'
      AND e.created_at > now() - interval '7 days'
  )                                                                 AS contact_clicks_week,
  COALESCE(AVG(r.rating) FILTER (WHERE r.status = 'published'), 0) AS avg_score,
  COUNT(r.id)  FILTER (WHERE r.status = 'published')               AS review_count
FROM public.providers p
LEFT JOIN public.events  e ON e.provider_id = p.id
LEFT JOIN public.reviews r ON r.provider_id::TEXT = p.id::TEXT
GROUP BY p.id;

-- ── 3. provider_activity_weekly (vista) ──────────────────────────
-- Actividad por día de semana (últimas 4 semanas) para el gráfico de barras.

CREATE OR REPLACE VIEW public.provider_activity_weekly AS
SELECT
  provider_id,
  EXTRACT(DOW FROM created_at)::INT                                    AS dow,
  COUNT(*) FILTER (WHERE event_type = 'view')          AS views,
  COUNT(*) FILTER (WHERE event_type = 'contact_click') AS contacts
FROM public.events
WHERE created_at > now() - interval '4 weeks'
GROUP BY provider_id, EXTRACT(DOW FROM created_at)::INT;

-- ── 4. provider_activity_hourly (vista) ──────────────────────────
-- Actividad por hora UTC (últimas 4 semanas) para el gráfico horario.

CREATE OR REPLACE VIEW public.provider_activity_hourly AS
SELECT
  provider_id,
  EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC')::INT AS hour_utc,
  COUNT(*) AS views
FROM public.events
WHERE event_type  = 'view'
  AND created_at  > now() - interval '4 weeks'
GROUP BY provider_id, EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC')::INT;

-- ── 5. provider_feedback_keywords (vista stub) ───────────────────
-- Placeholder: retorna vacío para evitar el error 404 en el dashboard.
-- Reemplazar con lógica real de extracción de keywords cuando aplique.

CREATE OR REPLACE VIEW public.provider_feedback_keywords AS
SELECT
  NULL::UUID  AS provider_id,
  NULL::TEXT  AS keyword,
  NULL::INT   AS count
WHERE false;
