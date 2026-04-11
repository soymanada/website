// supabase/functions/notify-admin/index.ts
// Recibe notificaciones de formularios (feedback, sugerencias, solicitudes)
// y las reenvía por email vía Resend.
//
// Variables de entorno requeridas en Supabase → Project Settings → Edge Functions:
//   RESEND_API_KEY  → tu API key de resend.com
//   NOTIFY_TO       → manadasisoy@gmail.com
//   NOTIFY_FROM     → noreply@soymanada.com  (dominio verificado en Resend)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_KEY  = Deno.env.get('RESEND_API_KEY') ?? ''
const NOTIFY_TO   = Deno.env.get('NOTIFY_TO')      ?? 'manadasisoy@gmail.com'
const NOTIFY_FROM = Deno.env.get('NOTIFY_FROM')     ?? 'SoyManada <noreply@soymanada.com>'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, payload } = await req.json()

    let subject = ''
    let html    = ''

    if (type === 'feedback') {
      const typeLabels: Record<string, string> = {
        idea:   '💡 Idea o sugerencia',
        bug:    '🐛 Algo no funciona',
        praise: '🌟 Felicitación',
        other:  '💬 Otro',
      }
      subject = `[SoyManada] Nuevo feedback — ${typeLabels[payload.type] ?? payload.type}`
      html = `
        <h2>Nuevo comentario en SoyManada</h2>
        <p><strong>Tipo:</strong> ${typeLabels[payload.type] ?? payload.type}</p>
        <p><strong>Mensaje:</strong></p>
        <blockquote>${payload.message}</blockquote>
        <p><strong>Email de contacto:</strong> ${payload.email ?? '(no proporcionado)'}</p>
      `
    } else if (type === 'suggestion') {
      subject = `[SoyManada] Nueva sugerencia de categoría`
      html = `
        <h2>Sugerencia de categoría</h2>
        <p><strong>Nombre:</strong> ${payload.name ?? '-'}</p>
        <p><strong>Rol:</strong> ${payload.role ?? '-'}</p>
        <p><strong>Ciudad:</strong> ${payload.city ?? '-'}</p>
        <p><strong>Sugerencia:</strong></p>
        <blockquote>${payload.message}</blockquote>
        <p><strong>Email:</strong> ${payload.email ?? '(no proporcionado)'}</p>
      `
    } else if (type === 'service_request') {
      subject = `[SoyManada] Nueva solicitud de servicio`
      html = `
        <h2>Solicitud de servicio</h2>
        <p><strong>Categoría:</strong> ${payload.category ?? 'Sin especificar'}</p>
        <p><strong>Ciudad:</strong> ${payload.city ?? '-'}</p>
        <p><strong>Descripción:</strong></p>
        <blockquote>${payload.description}</blockquote>
        <p><strong>Email:</strong> ${payload.email ?? '(no proporcionado)'}</p>
      `
    } else {
      return new Response(JSON.stringify({ error: 'unknown type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    NOTIFY_FROM,
        to:      [NOTIFY_TO],
        subject,
        html,
      }),
    })

    const resBody = await res.json()

    return new Response(JSON.stringify({ ok: res.ok, resend: resBody }), {
      status: res.ok ? 200 : 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
