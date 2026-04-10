-- ─────────────────────────────────────────────────────────────────
-- SoyManada · Nuevas columnas en la tabla providers
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

-- ── show_whatsapp ─────────────────────────────────────────────────
-- Controla si el número de WhatsApp es visible en el perfil público.
-- Solo activo para proveedores Silver+ (la validación es en el frontend).

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS show_whatsapp BOOLEAN NOT NULL DEFAULT false;

-- ── notif_new_message ─────────────────────────────────────────────
-- Preferencia: el proveedor recibe email cuando llega un nuevo mensaje.

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS notif_new_message BOOLEAN NOT NULL DEFAULT true;

-- ── notif_new_review ─────────────────────────────────────────────
-- Preferencia: el proveedor recibe email cuando le dejan una nueva reseña.

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS notif_new_review BOOLEAN NOT NULL DEFAULT true;
