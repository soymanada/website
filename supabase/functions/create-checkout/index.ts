// supabase/functions/create-checkout/index.ts
// Crea una preferencia de pago en MercadoPago y retorna la URL de checkout.
//
// Body: { plan_code: 'activo' | 'pro' | 'whatsapp_addon', user_id: string }
// Responde: { url: string, preference_id: string }

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')        ?? ''
const MP_SUCCESS_URL  = Deno.env.get('MP_SUCCESS_URL')         ?? ''
const MP_FAILURE_URL  = Deno.env.get('MP_FAILURE_URL')         ?? ''
const MP_PENDING_URL  = Deno.env.get('MP_PENDING_URL')         ?? ''
const MP_WEBHOOK_URL  = Deno.env.get('MP_WEBHOOK_URL')         ?? ''
const SB_URL          = Deno.env.get('SUPABASE_URL')           ?? ''
const SB_SERVICE      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
}

// Precios en CLP
const PLANS: Record<string, { title: string; price: number }> = {
  activo:         { title: 'Plan Activo – SoyManada',       price: 4990  },
  pro:            { title: 'Plan Pro – SoyManada',          price: 9990  },
  whatsapp_addon: { title: 'Add-on WhatsApp – SoyManada',   price: 2000  },
  // nombres canónicos nuevos
  cob:            { title: 'Plan Cob – SoyManada',          price: 4990  },
  wolf:           { title: 'Plan Wolf – SoyManada',         price: 9990  },
  // aliases legacy (por si algún link antiguo los usa)
  silver:         { title: 'Plan Cob – SoyManada',          price: 4990  },
  gold:           { title: 'Plan Wolf – SoyManada',         price: 9990  },
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  try {
    const { plan_code, user_id } = await req.json()

    if (!plan_code || !user_id) {
      return json({ error: 'missing plan_code or user_id' }, 400)
    }

    const plan = PLANS[plan_code]
    if (!plan) {
      return json({ error: `unknown plan_code: ${plan_code}` }, 400)
    }

    // Validar que whatsapp_addon solo esté disponible para tier=pro
    if (plan_code === 'whatsapp_addon') {
      const admin = createClient(SB_URL, SB_SERVICE)
      const { data: prov } = await admin
        .from('providers')
        .select('tier')
        .eq('user_id', user_id)
        .single()

      if (!prov || prov.tier !== 'pro') {
        return json({ error: 'whatsapp_addon requires tier=pro' }, 403)
      }
    }

    // Crear preferencia en MercadoPago
    const preference = {
      items: [{
        title:      plan.title,
        quantity:   1,
        currency_id: 'CLP',
        unit_price: plan.price,
      }],
      back_urls: {
        success: MP_SUCCESS_URL,
        failure: MP_FAILURE_URL,
        pending: MP_PENDING_URL,
      },
      auto_return:        'approved',
      external_reference: `${user_id}:${plan_code}`,
      notification_url:   MP_WEBHOOK_URL,
      statement_descriptor: 'SOYMANADA',
    }

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    })

    if (!mpRes.ok) {
      const err = await mpRes.text()
      console.error('[create-checkout] MP error:', err)
      return json({ error: 'MercadoPago error', detail: err }, 502)
    }

    const { id, init_point } = await mpRes.json()

    return json({ url: init_point, preference_id: id })
  } catch (err) {
    console.error('[create-checkout]', err)
    return json({ error: String(err) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
