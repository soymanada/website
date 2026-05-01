// supabase/functions/stripe-create-account-link/index.ts
// Crea (o recupera) una cuenta Stripe Express para un proveedor y genera
// un Account Link de onboarding alojado por Stripe.
//
// Body:  { provider_id }
// Resp:  { url, stripe_account_id }

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
    // ── Autenticación ──────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(SB_URL, SB_ANON, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    // ── Validar body ───────────────────────────────────────────────────────
    const body = await req.json()
    const { provider_id, return_url, refresh_url } = body
    if (!provider_id) return json({ error: 'Falta provider_id' }, 400)

    // ── Verificar que el proveedor existe y pertenece al usuario ──────────
    const admin = createClient(SB_URL, SB_SERVICE)
    const { data: provider, error: provErr } = await admin
      .from('providers')
      .select('id, name, user_id, stripe_account_id')
      .eq('id', provider_id)
      .single()

    if (provErr || !provider) return json({ error: 'Proveedor no encontrado' }, 404)
    if (provider.user_id !== user.id) return json({ error: 'Forbidden' }, 403)

    let stripeAccountId: string = provider.stripe_account_id ?? ''

    // ── Crear cuenta Stripe Express si no existe ───────────────────────────
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type:  'express',
        email: user.email,
        metadata: {
          provider_id,
          soymanada_user_id: user.id,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers:     { requested: true },
        },
      })

      stripeAccountId = account.id

      const { error: updateErr } = await admin
        .from('providers')
        .update({ stripe_account_id: stripeAccountId })
        .eq('id', provider_id)

      if (updateErr) {
        throw new Error(`No se pudo guardar stripe_account_id: ${updateErr.message}`)
      }

      console.log(
        `[stripe-create-account-link] Cuenta Express creada ${stripeAccountId}` +
        ` para provider ${provider_id}`
      )
    }

    // ── Generar Account Link de onboarding ─────────────────────────────────
    // return_url y refresh_url pueden venir del body (frontend) o se usan los defaults
    const resolvedReturnUrl  = return_url  ?? `${BASE_URL}/mi-perfil?stripe=return`
    const resolvedRefreshUrl = refresh_url ?? `${BASE_URL}/mi-perfil?stripe=refresh`

    const accountLink = await stripe.accountLinks.create({
      account:     stripeAccountId,
      refresh_url: resolvedRefreshUrl,
      return_url:  resolvedReturnUrl,
      type:        'account_onboarding',
    })

    console.log(
      `[stripe-create-account-link] AccountLink generado para ${stripeAccountId}`
    )

    return json({ url: accountLink.url, stripe_account_id: stripeAccountId })

  } catch (err) {
    console.error('[stripe-create-account-link]', err)
    return json({ error: String(err) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
