-- ═══════════════════════════════════════════════════════════════
-- SoyManada · provider_transactions
-- Registra pagos únicos gestionados por SoyManada vía Mercado Pago.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.provider_transactions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  provider_id    uuid        NOT NULL REFERENCES public.providers(id) ON DELETE RESTRICT,
  buyer_user_id  uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  amount_clp     integer     NOT NULL CHECK (amount_clp > 0),
  description    text        NOT NULL,
  mp_payment_id  text        NOT NULL,
  mp_status      text        NOT NULL,
  raw_payload    jsonb       NOT NULL,

  -- Idempotencia: un mismo pago de MP no puede insertarse dos veces
  CONSTRAINT provider_transactions_mp_payment_id_key UNIQUE (mp_payment_id)
);

-- Índices útiles para el dashboard del proveedor
CREATE INDEX IF NOT EXISTS provider_transactions_provider_id_idx
  ON public.provider_transactions (provider_id, created_at DESC);

CREATE INDEX IF NOT EXISTS provider_transactions_buyer_idx
  ON public.provider_transactions (buyer_user_id)
  WHERE buyer_user_id IS NOT NULL;

-- ── RLS ────────────────────────────────────────────────────────
ALTER TABLE public.provider_transactions ENABLE ROW LEVEL SECURITY;

-- Proveedor autenticado: ve solo sus propias transacciones
CREATE POLICY "transactions_provider_select"
  ON public.provider_transactions FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
  );

-- Comprador autenticado: ve sus propias compras
CREATE POLICY "transactions_buyer_select"
  ON public.provider_transactions FOR SELECT
  USING (buyer_user_id = auth.uid());

-- Admin: acceso total
CREATE POLICY "transactions_admin_all"
  ON public.provider_transactions FOR ALL
  USING    (is_admin())
  WITH CHECK (is_admin());

-- INSERT: solo vía service_role (Edge Function con SB_SERVICE_ROLE_KEY).
-- No hay política para anon/authenticated → nadie puede insertar directo desde cliente.

-- ── Verificación ───────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_schema = 'public' AND table_name = 'provider_transactions') AS table_created,
  (SELECT COUNT(*) FROM pg_policies
   WHERE schemaname = 'public' AND tablename = 'provider_transactions')    AS policies_count;
