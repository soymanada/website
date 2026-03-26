-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Tabla de evaluaciones de proveedores
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reviews (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id   TEXT        NOT NULL,                          -- id del providers.json (ej: 'p001')
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating        SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  rating_comm   SMALLINT    CHECK (rating_comm  BETWEEN 1 AND 5),  -- comunicación (opcional)
  rating_qual   SMALLINT    CHECK (rating_qual  BETWEEN 1 AND 5),  -- calidad (opcional)
  rating_price  SMALLINT    CHECK (rating_price BETWEEN 1 AND 5),  -- precio justo (opcional)
  comment       TEXT        CHECK (char_length(comment) <= 300),
  status        TEXT        NOT NULL DEFAULT 'published'
                            CHECK (status IN ('published', 'flagged', 'removed')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, provider_id)   -- un usuario solo puede evaluar una vez por proveedor
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS reviews_provider_id_idx ON public.reviews (provider_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx     ON public.reviews (user_id);
CREATE INDEX IF NOT EXISTS reviews_status_idx      ON public.reviews (status);

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer reviews publicadas (usuarios anónimos también)
CREATE POLICY "reviews_select_published"
  ON public.reviews FOR SELECT
  USING (status = 'published');

-- Solo el propio usuario puede insertar su review
CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- El usuario puede actualizar solo su propia review
CREATE POLICY "reviews_update_own"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins pueden ver y gestionar todo (necesita rol admin en profiles)
CREATE POLICY "reviews_admin_all"
  ON public.reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
