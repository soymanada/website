-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Fix: provider_id debe ser TEXT, no UUID
--
-- CONTEXTO:
--   El directorio público usa providers.json con IDs string ('p001', 'p002'…)
--   La tabla reviews fue creada con provider_id UUID FK → providers,
--   pero el frontend siempre envía el ID string del JSON.
--   Esto provoca que TODAS las queries de reviews fallen silenciosamente.
--
-- SOLUCIÓN:
--   Quitar el FK y cambiar provider_id a TEXT.
--   Esto permite reviews tanto para proveedores del JSON como de Supabase.
--
-- EJECUTAR en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

DO $$
BEGIN
  -- Quitar FK si existe (puede tener nombre variable)
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name   = 'reviews'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'provider_id'
  ) THEN
    -- Buscar y eliminar el constraint FK dinámicamente
    EXECUTE (
      SELECT 'ALTER TABLE public.reviews DROP CONSTRAINT ' || tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name     = 'reviews'
        AND tc.constraint_type  = 'FOREIGN KEY'
        AND kcu.column_name   = 'provider_id'
      LIMIT 1
    );
    RAISE NOTICE 'FK de provider_id eliminado.';
  END IF;

  -- Cambiar tipo a TEXT si es UUID
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'reviews'
      AND column_name  = 'provider_id'
      AND data_type    = 'uuid'
  ) THEN
    ALTER TABLE public.reviews
      ALTER COLUMN provider_id TYPE TEXT USING provider_id::TEXT;
    RAISE NOTICE 'provider_id convertido a TEXT correctamente.';
  ELSE
    RAISE NOTICE 'provider_id ya es TEXT — no se requiere cambio.';
  END IF;
END;
$$;
