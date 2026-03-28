-- ─────────────────────────────────────────────────────────────────
-- BACKEND 2 — Columna slug en tabla providers
-- URLs amigables: /proveedor/maria-gonzalez en vez de /proveedor/3f8a...
-- ─────────────────────────────────────────────────────────────────

-- 1. Agregar columna
ALTER TABLE public.providers ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. Generar slugs para proveedores existentes
UPDATE public.providers
SET slug = lower(
  regexp_replace(
    regexp_replace(
      translate(name,
        'áéíóúàèìòùäëïöüâêîôûñÁÉÍÓÚÑ',
        'aeiouaeiouaeiouaeiounAEIOUN'
      ),
      '[^a-z0-9]+', '-', 'g'
    ),
    '^-|-$', '', 'g'
  )
)
WHERE slug IS NULL;

-- 3. Índice para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_providers_slug ON public.providers (slug);
