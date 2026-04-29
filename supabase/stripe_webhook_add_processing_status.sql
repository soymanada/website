-- Migration: stripe_webhook_add_processing_status
-- Agrega 'processing' al CHECK constraint de stripe_webhook_events.status
-- para soportar el patrón insert-before-process (anti race condition).

ALTER TABLE public.stripe_webhook_events
  DROP CONSTRAINT IF EXISTS stripe_webhook_events_status_check;

ALTER TABLE public.stripe_webhook_events
  ADD CONSTRAINT stripe_webhook_events_status_check
  CHECK (status IN ('processing', 'processed', 'failed', 'skipped'));
