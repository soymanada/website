-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Fix: provider_id debe ser TEXT, no UUID
--
-- Ejecutar SOLO si el backend creó provider_id como UUID.
-- Los IDs de providers.json son strings como 'p001', 'p002', etc.
-- ─────────────────────────────────────────────────────────────────

-- Verificar el tipo actual antes de ejecutar:
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'reviews' AND column_name = 'provider_id';

-- Si data_type es 'uuid', ejecutar el bloque DO siguiente:
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'reviews'
      AND column_name  = 'provider_id'
      AND data_type    = 'uuid'
  ) THEN
    -- Eliminar FK si existe
    ALTER TABLE public.reviews
      DROP CONSTRAINT IF EXISTS reviews_provider_id_fkey;

    -- Cambiar tipo a TEXT
    ALTER TABLE public.reviews
      ALTER COLUMN provider_id TYPE TEXT USING provider_id::TEXT;

    RAISE NOTICE 'provider_id convertido a TEXT correctamente.';
  ELSE
    RAISE NOTICE 'provider_id ya es TEXT — no se requiere cambio.';
  END IF;
END;
$$;
