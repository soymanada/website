// supabase/functions/stripe-create-checkout/index.ts
// Crea una Checkout Session de Stripe para el pago de un servicio de proveedor.
//
// Body:  { provider_id, service_description, amount_clp, booking_id? }
// Resp:  { url, session_id }

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno&deno-std=0.177.0'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')          ?? ''
const SB_URL            = Deno.env.get('SUPABASE_URL')               ?? ''
const SB_ANON           = Deno.env.get('SUPABASE_ANON_KEY')          ?? ''
const SB_SERVICE        = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')  ?? ''
const BASE_URL          = Deno.env.get('APP_BASE_URL')               ?? 'https://soymanada.com'

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })

  try {
    // ── Autenticación del usuario ──────────────────────────────────────────
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(SB_URL, SB_ANON, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    // ── Validar body ───────────────────────────────────────────────────────
    const { provider_id, service_description, amount_clp, booking_id } = await req.json()

    if (!provider_id || !service_description || !amount_clp) {
      return json({ error: 'Campos requeridos: provider_id, service_description, amount_clp' }, 400)
    }
    if (typeof amount_clp !== 'number' || amount_clp < 100) {
      return json({ error: 'amount_clp debe ser número >= 100' }, 400)
    }

    // ── Verificar que el proveedor existe y está verificado ────────────────
    const admin = createClient(SB_URL, SB_SERVICE)
    const { data: provider, error: provErr } = await admin
      .from('providers')
      .select('id, name, verified, tier')
      .eq('id', provider_id)
      .single()

    if (provErr || !provider) return json({ error: 'Proveedor no encontrado' }, 404)
    if (!provider.verified)   return json({ error: 'Proveedor no verificado' }, 403)

    // ── Metadata para reconciliar en el webhook ────────────────────────────
    const metadata: Record<string, string> = {
      provider_id,
      buyer_user_id: user.id,
      source: 'soymanada',
    }
    if (booking_id) metadata.booking_id = String(booking_id)

    // ── Crear Checkout Session ─────────────────────────────────────────────
    // CLP es zero-decimal en Stripe: unit_amount = valor exacto en pesos
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency:     'clp',
          unit_amount:  amount_clp,
          product_data: {
            name:        service_description,
            description: `Servicio de ${provider.name} vía SoyManada`,
          },
        },
        quantity: 1,
      }],
      success_url:    `${BASE_URL}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:     `${BASE_URL}/proveedor/${provider_id}?pago=cancelado`,
      customer_email: user.email,
      metadata,
    })

    console.log(
      `[stripe-create-checkout] Session ${session.id}` +
      ` provider=${provider_id} buyer=${user.id} amount=${amount_clp} CLP`
    )

    return json({ url: session.url, session_id: session.id })

  } catch (err) {
    console.error('[stripe-create-checkout]', err)
    return json({ error: String(err) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
