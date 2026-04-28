// supabase/functions/mercadopago-create-payment/index.ts
//
// Dos modos según query param:
//   POST /mercadopago-create-payment          → crea preferencia, devuelve init_point
//   POST /mercadopago-create-payment?webhook=1 → recibe notificación MP, registra transacción
//
// Body (modo creación):
//   { provider_id, amount_clp, description, redirect_url }
//
// Body (modo webhook — viene de Mercado Pago):
//   { type: "payment", data: { id: "<payment_id>" } }

import { serve }        from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_TOKEN   = Deno.env.get('MP_ACCESS_TOKEN')           ?? ''
const SB_URL     = Deno.env.get('SUPABASE_URL')              ?? ''
const SB_ANON    = Deno.env.get('SUPABASE_ANON_KEY')         ?? ''
const SB_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// URL pública de esta misma función para el notification_url de MP
const WEBHOOK_URL = `${SB_URL}/functions/v1/mercadopago-create-payment?webhook=1`

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  const url       = new URL(req.url)
  const isWebhook = url.searchParams.get('webhook') === '1'

  return isWebhook
    ? handleWebhook(req)
    : handleCreatePayment(req)
})

// ─────────────────────────────────────────────────────────────────────────────
// MODO CREACIÓN: recibe petición del frontend, crea preferencia en MP
// ─────────────────────────────────────────────────────────────────────────────
async function handleCreatePayment(req: Request): Promise<Response> {
  // 1. Validar que el usuario está autenticado
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return json({ error: 'unauthorized' }, 401)
  }

  const userClient = createClient(SB_URL, SB_ANON, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error: authErr } = await userClient.auth.getUser()
  if (authErr || !user) {
    return json({ error: 'unauthorized' }, 401)
  }

  // 2. Leer y validar body
  let body: { provider_id?: string; amount_clp?: number; description?: string; redirect_url?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }

  const { provider_id, amount_clp, description, redirect_url } = body

  if (!provider_id || !amount_clp || !description || !redirect_url) {
    return json({ error: 'missing required fields: provider_id, amount_clp, description, redirect_url' }, 400)
  }
  if (!Number.isInteger(amount_clp) || amount_clp <= 0) {
    return json({ error: 'amount_clp must be a positive integer (CLP has no decimals)' }, 400)
  }

  // 3. Verificar que el proveedor existe, está verificado y tiene tier Wolf
  const admin = createClient(SB_URL, SB_SERVICE)
  const { data: provider, error: provErr } = await admin
    .from('providers')
    .select('id, name, verified, tier')
    .eq('id', provider_id)
    .single()

  if (provErr || !provider) {
    return json({ error: 'provider not found' }, 404)
  }
  if (!provider.verified) {
    return json({ error: 'provider is not verified' }, 403)
  }
  // B-TIER-1: cobros gestionados solo disponibles para tier Wolf
  if (provider.tier !== 'wolf') {
    return json({ error: 'FORBIDDEN_TIER', message: 'Los cobros gestionados por SoyManada requieren el plan Wolf.' }, 403)
  }

  // 4. Construir preferencia de pago
  //    external_reference = "provider_id:buyer_user_id" para el webhook
  const preference = {
    items: [{
      title:       description,
      unit_price:  amount_clp,
      quantity:    1,
      currency_id: 'CLP',
    }],
    back_urls: {
      success: redirect_url,
      failure: redirect_url,
      pending: redirect_url,
    },
    auto_return:        'approved',
    external_reference: `${provider_id}:${user.id}`,
    notification_url:   WEBHOOK_URL,
    statement_descriptor: 'SOYMANADA',
  }

  // 5. Llamar a Mercado Pago
  const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${MP_TOKEN}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(preference),
  })

  if (!mpRes.ok) {
    const err = await mpRes.text()
    console.error('[create-payment] MP error:', err)
    return json({ error: 'mercadopago_error', detail: err }, 502)
  }

  const { id, init_point } = await mpRes.json()

  console.log(`[create-payment] preference created: ${id} for provider ${provider_id}`)
  return json({ init_point, id })
}

// ─────────────────────────────────────────────────────────────────────────────
// MODO WEBHOOK: recibe notificación de MP, registra transacción en DB
// ─────────────────────────────────────────────────────────────────────────────
async function handleWebhook(req: Request): Promise<Response> {
  let body: { type?: string; data?: { id?: string | number } }
  try {
    body = await req.json()
  } catch {
    return new Response('bad_json', { status: 400 })
  }

  // MP envía varios tipos; solo procesar pagos
  if (body.type !== 'payment' || !body.data?.id) {
    return new Response('ok', { status: 200 })
  }

  const paymentId = String(body.data.id)

  // Obtener detalle del pago desde MP
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { 'Authorization': `Bearer ${MP_TOKEN}` },
  })

  if (!mpRes.ok) {
    console.error('[mp-webhook] error fetching payment', paymentId)
    return new Response('mp_error', { status: 502 })
  }

  const payment = await mpRes.json()

  // Solo registrar pagos aprobados
  if (payment.status !== 'approved') {
    console.log('[mp-webhook] payment not approved:', payment.status)
    return new Response('ok', { status: 200 })
  }

  // Parsear external_reference: "provider_id:buyer_user_id"
  const ref           = payment.external_reference ?? ''
  const [providerId, buyerUserId] = ref.split(':')

  if (!providerId) {
    console.error('[mp-webhook] bad external_reference:', ref)
    return new Response('bad_ref', { status: 400 })
  }

  // Descripción: preferir item title sobre description genérica
  const description =
    payment.additional_info?.items?.[0]?.title ??
    payment.description ??
    'Servicio SoyManada'

  const admin = createClient(SB_URL, SB_SERVICE)

  const { error } = await admin
    .from('provider_transactions')
    .insert({
      provider_id:   providerId,
      buyer_user_id: buyerUserId || null,
      amount_clp:    Math.round(payment.transaction_amount ?? 0),
      description,
      mp_payment_id: paymentId,
      mp_status:     payment.status,
      raw_payload:   payment,
    })

  if (error) {
    // Código 23505 = UNIQUE violation → pago ya procesado (idempotencia)
    if (error.code === '23505') {
      console.log('[mp-webhook] already processed (idempotent):', paymentId)
      return new Response('ok', { status: 200 })
    }
    console.error('[mp-webhook] insert error:', error)
    return new Response('db_error', { status: 500 })
  }

  console.log(`[mp-webhook] transaction recorded: ${paymentId} for provider ${providerId}`)
  return new Response('ok', { status: 200 })
}

// ─────────────────────────────────────────────────────────────────────────────
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
