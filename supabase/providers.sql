-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Tabla de proveedores (directorio público)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Requiere: profiles.sql ejecutado previamente
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.providers (
  id                    UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  name                  TEXT        NOT NULL,
  description           TEXT,
  service               TEXT,
  category_slug         TEXT,
  languages             TEXT[]      DEFAULT '{}',
  countries             TEXT[]      DEFAULT '{}',
  verified              BOOLEAN     DEFAULT false,
  active                BOOLEAN     DEFAULT true,
  contact               JSONB       DEFAULT '{}',
  payment_link          TEXT,
  calendar_link         TEXT,
  redirect_email        TEXT,
  predefined_responses  TEXT[]      DEFAULT '{}',
  service_en            TEXT,
  service_fr            TEXT,
  description_en        TEXT,
  description_fr        TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS providers_user_id_idx      ON public.providers (user_id);
CREATE INDEX IF NOT EXISTS providers_category_slug_idx ON public.providers (category_slug);
CREATE INDEX IF NOT EXISTS providers_verified_idx      ON public.providers (verified);
CREATE INDEX IF NOT EXISTS providers_active_idx        ON public.providers (active);
CREATE INDEX IF NOT EXISTS providers_countries_idx     ON public.providers USING GIN (countries);

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer proveedores activos
CREATE POLICY "providers_select_active" ON public.providers
  FOR SELECT USING (active = true);

-- El dueño puede actualizar su propio perfil
CREATE POLICY "providers_update_own" ON public.providers
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins tienen acceso total
CREATE POLICY "providers_all_admin" ON public.providers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
