// supabase/functions/mp-webhook/index.ts
// Recibe notificaciones de pago de MercadoPago y actualiza providers.
//
// MP_WEBHOOK_URL debe apuntar a esta función en los secrets de Supabase.
// MercadoPago envía: POST { type: 'payment', data: { id: '123' } }

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')           ?? ''
const SB_URL          = Deno.env.get('SUPABASE_URL')              ?? ''
const SB_SERVICE      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// Mapeo plan_code → tier en providers
const PLAN_TO_TIER: Record<string, string> = {
  activo: 'activo',
  silver: 'activo',
  pro:    'pro',
  gold:   'pro',
}

serve(async (req) => {
  try {
    const body = await req.json()

    // MP envía distintos tipos de notificaciones; solo procesar payments
    if (body.type !== 'payment' || !body.data?.id) {
      return new Response('ok', { status: 200 })
    }

    const paymentId = body.data.id

    // Obtener detalle del pago desde la API de MP
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
    })

    if (!mpRes.ok) {
      console.error('[mp-webhook] error fetching payment', paymentId)
      return new Response('mp_error', { status: 502 })
    }

    const payment = await mpRes.json()

    // Solo procesar pagos aprobados
    if (payment.status !== 'approved') {
      console.log('[mp-webhook] payment not approved:', payment.status)
      return new Response('ok', { status: 200 })
    }

    // external_reference = "user_id:plan_code"
    const ref = payment.external_reference ?? ''
    const [userId, planCode] = ref.split(':')

    if (!userId || !planCode) {
      console.error('[mp-webhook] bad external_reference:', ref)
      return new Response('bad_ref', { status: 400 })
    }

    const admin = createClient(SB_URL, SB_SERVICE)

    if (planCode === 'whatsapp_addon') {
      // Activar add-on WhatsApp
      const { error } = await admin
        .from('providers')
        .update({ whatsapp_addon: true })
        .eq('user_id', userId)

      if (error) {
        console.error('[mp-webhook] update whatsapp_addon error:', error)
        return new Response('db_error', { status: 500 })
      }

      console.log('[mp-webhook] whatsapp_addon activated for', userId)
    } else {
      const newTier = PLAN_TO_TIER[planCode]
      if (!newTier) {
        console.error('[mp-webhook] unknown plan_code:', planCode)
        return new Response('unknown_plan', { status: 400 })
      }

      // Actualizar tier del proveedor
      const { error } = await admin
        .from('providers')
        .update({ tier: newTier })
        .eq('user_id', userId)

      if (error) {
        console.error('[mp-webhook] update tier error:', error)
        return new Response('db_error', { status: 500 })
      }

      console.log(`[mp-webhook] tier updated to ${newTier} for`, userId)
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('[mp-webhook]', err)
    return new Response(String(err), { status: 500 })
  }
})
