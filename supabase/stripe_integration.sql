-- Migration: stripe_integration
-- Tablas y columnas para integración Stripe live

-- ─── 1. stripe_webhook_events ────────────────────────────────────────────────
-- Idempotencia: cada event.id de Stripe se registra exactamente una vez.
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  stripe_event_id text        NOT NULL UNIQUE,
  event_type      text        NOT NULL,
  livemode        boolean     NOT NULL DEFAULT false,
  processed_at    timestamptz NOT NULL DEFAULT now(),
  status          text        NOT NULL CHECK (status IN ('processed','failed','skipped')),
  payload_json    jsonb,
  error_message   text
);

CREATE INDEX IF NOT EXISTS stripe_webhook_events_event_id_idx
  ON public.stripe_webhook_events (stripe_event_id);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhook_events_admin_all"
  ON public.stripe_webhook_events FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── 2. stripe_payments ──────────────────────────────────────────────────────
-- Registro de pagos exitosos desde checkout.session.completed
CREATE TABLE IF NOT EXISTS public.stripe_payments (
  id                         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at                 timestamptz NOT NULL DEFAULT now(),
  stripe_event_id            text        NOT NULL,
  stripe_checkout_session_id text        NOT NULL UNIQUE,
  stripe_payment_intent_id   text,
  amount_total               integer     NOT NULL,
  currency                   text        NOT NULL,
  payment_status             text        NOT NULL,
  customer_email             text,
  provider_id                uuid        REFERENCES public.providers(id) ON DELETE SET NULL,
  buyer_user_id              uuid        REFERENCES auth.users(id)       ON DELETE SET NULL,
  booking_id                 text,
  metadata                   jsonb,
  paid_at                    timestamptz
);

CREATE INDEX IF NOT EXISTS stripe_payments_provider_idx
  ON public.stripe_payments (provider_id);
CREATE INDEX IF NOT EXISTS stripe_payments_buyer_idx
  ON public.stripe_payments (buyer_user_id);

ALTER TABLE public.stripe_payments ENABLE ROW LEVEL SECURITY;

-- Admin: acceso total
CREATE POLICY "payments_admin_all"
  ON public.stripe_payments FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Proveedor: puede ver pagos que le corresponden
CREATE POLICY "payments_provider_select"
  ON public.stripe_payments FOR SELECT
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
  );

-- Comprador: puede ver sus propios pagos
CREATE POLICY "payments_buyer_select"
  ON public.stripe_payments FOR SELECT
  TO authenticated
  USING (buyer_user_id = auth.uid());

-- ─── 3. Columnas Stripe Connect en providers ─────────────────────────────────
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS stripe_account_id              text UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_charges_enabled         boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_payouts_enabled         boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_details_submitted       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_onboarding_complete     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_requirements_due_count  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stripe_requirements_disabled_reason text,
  ADD COLUMN IF NOT EXISTS stripe_last_account_event_at   timestamptz;
