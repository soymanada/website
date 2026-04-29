// supabase/functions/stripe-webhook/index.ts
// Procesa eventos Stripe: checkout.session.completed y account.updated.
//
// IMPORTANTE: deployer con --no-verify-jwt porque Stripe no envía token Supabase.
// Verificación de firma vía stripe.webhooks.constructEventAsync + raw body.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno&deno-std=0.177.0'

const STRIPE_SECRET_KEY     = Deno.env.get('STRIPE_SECRET_KEY')          ?? ''
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')      ?? ''
const SB_URL                = Deno.env.get('SUPABASE_URL')               ?? ''
const SB_SERVICE            = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')  ?? ''

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion:  '2024-06-20',
  httpClient:  Stripe.createFetchHttpClient(),
})
const admin  = createClient(SB_URL, SB_SERVICE)

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  // ── 1. Leer body crudo ANTES de cualquier parseo ─────────────────────────
  const rawBody = await req.text()
  const sig     = req.headers.get('stripe-signature') ?? ''

  // ── 2. Verificar firma ───────────────────────────────────────────────────
  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[stripe-webhook] Firma inválida:', err)
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 })
  }

  console.log(`[stripe-webhook] ${event.type} | ${event.id} | livemode=${event.livemode}`)

  // ── 3. Idempotencia: verificar si ya fue procesado ───────────────────────
  const { data: existing } = await admin
    .from('stripe_webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .maybeSingle()

  if (existing) {
    console.log(`[stripe-webhook] Ya procesado ${event.id} — omitiendo`)
    return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 })
  }

  // ── 4. Procesar evento ───────────────────────────────────────────────────
  let status       = 'processed'
  let errorMessage: string | null = null

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, event.id)
        break
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account)
        break
      default:
        console.log(`[stripe-webhook] Evento no manejado: ${event.type}`)
        status = 'skipped'
    }
  } catch (err) {
    console.error(`[stripe-webhook] Error procesando ${event.type}:`, err)
    status       = 'failed'
    errorMessage = String(err)
  }

  // ── 5. Registrar evento (éxito o fallo) ──────────────────────────────────
  await admin.from('stripe_webhook_events').insert({
    stripe_event_id: event.id,
    event_type:      event.type,
    livemode:        event.livemode,
    status,
    payload_json:    event as unknown as Record<string, unknown>,
    error_message:   errorMessage,
  })

  if (status === 'failed') {
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true, status }), { status: 200 })
})

// ── checkout.session.completed ───────────────────────────────────────────────
async function handleCheckoutCompleted(session: Stripe.Checkout.Session, eventId: string) {
  if (session.payment_status !== 'paid') {
    console.log(`[stripe-webhook] checkout no pagado (${session.payment_status}) — omitiendo`)
    return
  }

  const meta = (session.metadata ?? {}) as Record<string, string>

  const { error } = await admin.from('stripe_payments').upsert({
    stripe_event_id:            eventId,
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id:   (session.payment_intent as string | null) ?? null,
    amount_total:               session.amount_total ?? 0,
    currency:                   session.currency     ?? 'clp',
    payment_status:             session.payment_status,
    customer_email:             session.customer_details?.email ?? null,
    provider_id:                meta.provider_id    || null,
    buyer_user_id:              meta.buyer_user_id  || null,
    booking_id:                 meta.booking_id     || null,
    metadata:                   meta,
    paid_at:                    new Date().toISOString(),
  }, { onConflict: 'stripe_checkout_session_id' })

  if (error) throw new Error(`stripe_payments upsert failed: ${error.message}`)

  console.log(
    `[stripe-webhook] Pago registrado — session=${session.id}` +
    ` amount=${session.amount_total} ${session.currency}` +
    ` provider=${meta.provider_id ?? 'n/a'}`
  )
}

// ── account.updated ──────────────────────────────────────────────────────────
async function handleAccountUpdated(account: Stripe.Account) {
  const req = account.requirements
  const dueCount =
    (req?.currently_due?.length  ?? 0) +
    (req?.eventually_due?.length ?? 0)

  // Onboarding completo si el proveedor puede cobrar y envió sus datos
  const onboardingComplete = (account.charges_enabled === true) && (account.details_submitted === true)

  const { error } = await admin
    .from('providers')
    .update({
      stripe_charges_enabled:              account.charges_enabled    ?? false,
      stripe_payouts_enabled:              account.payouts_enabled    ?? false,
      stripe_details_submitted:            account.details_submitted  ?? false,
      stripe_onboarding_complete:          onboardingComplete,
      stripe_requirements_due_count:       dueCount,
      stripe_requirements_disabled_reason: req?.disabled_reason       ?? null,
      stripe_last_account_event_at:        new Date().toISOString(),
    })
    .eq('stripe_account_id', account.id)

  if (error) throw new Error(`providers update failed for account ${account.id}: ${error.message}`)

  console.log(
    `[stripe-webhook] account.updated — ${account.id}` +
    ` charges_enabled=${account.charges_enabled}` +
    ` onboarding_complete=${onboardingComplete}`
  )
}
