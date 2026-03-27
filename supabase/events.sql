-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Tabla de eventos de interacción (analytics)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.events (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id  TEXT        NOT NULL,  -- referencia al id del proveedor (TEXT por flexibilidad)
  event_type   TEXT        NOT NULL
               CHECK (event_type IN ('view', 'contact_click', 'profile_view', 'whatsapp_click', 'website_click')),
  user_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS events_provider_id_idx ON public.events (provider_id);
CREATE INDEX IF NOT EXISTS events_event_type_idx  ON public.events (event_type);
CREATE INDEX IF NOT EXISTS events_created_at_idx  ON public.events (created_at DESC);

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar eventos (tracking anónimo y autenticado)
CREATE POLICY "events_insert_public" ON public.events
  FOR INSERT WITH CHECK (true);

-- Solo admins pueden leer eventos
CREATE POLICY "events_select_admin" ON public.events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
