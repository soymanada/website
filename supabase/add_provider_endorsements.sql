-- Migration: add_provider_endorsements
-- Paso 1: columnas en providers + tabla endorsements + RLS
-- Paso 2: función RPC recommend_new_provider (transacción atómica)
-- Paso 3: vista provider_endorsement_display
-- Paso 4: trigger notificación admin

-- ════════════════════════════════════════════════════════════════════════════
-- PASO 1 — Campos en providers + tabla provider_endorsements + RLS
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS origin TEXT
    DEFAULT 'admin'
    CHECK (origin IN ('admin', 'application', 'recommended')),
  ADD COLUMN IF NOT EXISTS recommended_by_provider_id UUID
    REFERENCES public.providers(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.provider_endorsements (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  from_provider_id UUID        NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  to_provider_id   UUID        NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  message          TEXT        NOT NULL CHECK (
                                 char_length(trim(message)) BETWEEN 10 AND 120
                               ),
  active           BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT no_self_endorse      CHECK (from_provider_id <> to_provider_id),
  CONSTRAINT unique_endorsement   UNIQUE (from_provider_id, to_provider_id)
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_endorsements_to_provider
  ON public.provider_endorsements (to_provider_id)
  WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_endorsements_from_provider
  ON public.provider_endorsements (from_provider_id)
  WHERE active = true;

-- RLS
ALTER TABLE public.provider_endorsements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "endorsements_public_read" ON public.provider_endorsements
  FOR SELECT USING (
    active = true
    AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = from_provider_id
        AND p.verified = true
        AND p.active = true
    )
  );

CREATE POLICY "endorsements_provider_insert" ON public.provider_endorsements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = from_provider_id
        AND p.user_id = auth.uid()
        AND p.verified = true
    )
    AND (
      SELECT COUNT(*) FROM public.provider_endorsements e
      WHERE e.from_provider_id = from_provider_id
        AND e.active = true
    ) < 5
  );

CREATE POLICY "endorsements_provider_deactivate" ON public.provider_endorsements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = from_provider_id
        AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (active = false);

CREATE POLICY "endorsements_admin_all" ON public.provider_endorsements
  FOR ALL USING (is_admin());

-- ════════════════════════════════════════════════════════════════════════════
-- PASO 2 — Función RPC: crear proveedor recomendado + endorsement (atómico)
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.recommend_new_provider(
  p_from_provider_id  UUID,
  p_name              TEXT,
  p_category_slug     TEXT,
  p_service           TEXT,
  p_contact_whatsapp  TEXT DEFAULT NULL,
  p_contact_instagram TEXT DEFAULT NULL,
  p_message           TEXT DEFAULT ''
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_provider_id UUID;
  v_count           INT;
BEGIN
  -- Verificar que quien llama es dueño del proveedor y está verificado
  IF NOT EXISTS (
    SELECT 1 FROM public.providers
    WHERE id = p_from_provider_id
      AND user_id = auth.uid()
      AND verified = true
  ) THEN
    RAISE EXCEPTION 'No autorizado: solo proveedores verificados pueden recomendar';
  END IF;

  -- Verificar límite de 5 endorsements activos
  SELECT COUNT(*) INTO v_count
  FROM public.provider_endorsements
  WHERE from_provider_id = p_from_provider_id AND active = true;

  IF v_count >= 5 THEN
    RAISE EXCEPTION 'Límite alcanzado: máximo 5 recomendaciones activas';
  END IF;

  -- Crear proveedor nuevo (inactivo, no verificado, pendiente revisión)
  INSERT INTO public.providers (
    name, category_slug, service,
    contact_whatsapp, contact_instagram,
    verified, active,
    origin, recommended_by_provider_id
  )
  VALUES (
    p_name, p_category_slug, p_service,
    p_contact_whatsapp, p_contact_instagram,
    false, false,
    'recommended', p_from_provider_id
  )
  RETURNING id INTO v_new_provider_id;

  -- Crear el endorsement vinculando ambos proveedores
  INSERT INTO public.provider_endorsements (from_provider_id, to_provider_id, message)
  VALUES (p_from_provider_id, v_new_provider_id, p_message);

  RETURN v_new_provider_id;
END;
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- PASO 3 — Vista para tarjeta de endorsement (JOIN optimizado, acceso público)
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.provider_endorsement_display AS
SELECT
  e.to_provider_id,
  e.message,
  e.created_at,
  p.id            AS endorser_id,
  p.name          AS endorser_name,
  p.category_slug AS endorser_category,
  p.avatar_url    AS endorser_avatar,
  p.slug          AS endorser_slug
FROM public.provider_endorsements e
JOIN public.providers p ON p.id = e.from_provider_id
WHERE e.active = true
  AND p.verified = true
  AND p.active = true;

GRANT SELECT ON public.provider_endorsement_display TO anon, authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- PASO 4 — Trigger: notificación al admin cuando se crea proveedor recomendado
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.notify_admin_new_recommended_provider()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.site_feedback (message, type)
  VALUES (
    'Nuevo proveedor recomendado pendiente de revisión: provider_id=' || NEW.id
    || ' | Recomendado por: ' || NEW.recommended_by_provider_id::text,
    'admin_alert'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_recommended_provider ON public.providers;

CREATE TRIGGER trg_notify_recommended_provider
  AFTER INSERT ON public.providers
  FOR EACH ROW
  WHEN (NEW.origin = 'recommended')
  EXECUTE FUNCTION public.notify_admin_new_recommended_provider();
