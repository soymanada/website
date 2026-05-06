-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Multi-categoría para proveedores
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

-- 1. Agregar la columna category_slugs (array de texto)
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS category_slugs text[];

-- 2. Backfill: para todo proveedor sin category_slugs, usar [category_slug]
UPDATE public.providers
SET category_slugs = ARRAY[category_slug]
WHERE category_slugs IS NULL
  AND category_slug IS NOT NULL;

-- 3. Datos reales de los proveedores multi-categoría
--    (Ajustar si el nombre exacto difiere en la DB)

-- Javiera Copplo de Ruta Working Holiday
UPDATE public.providers
SET category_slugs = ARRAY['seguros','migracion','comunidad','traducciones']
WHERE name ILIKE '%Javiera Copplo%';

-- Verificar resultado
SELECT id, name, category_slug, category_slugs
FROM public.providers
WHERE active = true
ORDER BY name;
