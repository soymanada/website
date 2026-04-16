// supabase/functions/notify-admin/index.ts
// Sends an email to the admin when a feedback, suggestion, service_request,
// or provider_suggestion is submitted.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  try {
    const RESEND_KEY = Deno.env.get('RESEND_API_KEY')
    const TO         = Deno.env.get('NOTIFY_TO')
    const FROM       = Deno.env.get('NOTIFY_FROM') ?? 'notificaciones@soymanada.com'

    if (!RESEND_KEY || !TO) {
      // Silent no-op if env vars are not configured — callers use fire-and-forget
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const { type, payload } = await req.json()

    let subject = ''
    let html    = ''

    if (type === 'feedback') {
      const typeLabels: Record<string, string> = {
        idea: 'Idea', bug: 'Bug', praise: 'Elogio', other: 'Otro',
      }
      subject = `[SoyManada] Nuevo feedback — ${typeLabels[payload.type] ?? payload.type}`
      html = `
        <p><strong>Tipo:</strong> ${typeLabels[payload.type] ?? payload.type}</p>
        <p><strong>Mensaje:</strong> ${payload.message}</p>
        ${payload.email ? `<p><strong>Email:</strong> ${payload.email}</p>` : ''}
      `
    } else if (type === 'suggestion') {
      subject = '[SoyManada] Nueva sugerencia de categoría'
      html = `
        <p><strong>Rol:</strong> ${payload.role ?? '—'}</p>
        <p><strong>Nombre:</strong> ${payload.name ?? '—'}</p>
        <p><strong>Ciudad:</strong> ${payload.city ?? '—'}</p>
        <p><strong>Mensaje:</strong> ${payload.message}</p>
        ${payload.email ? `<p><strong>Email:</strong> ${payload.email}</p>` : ''}
      `
    } else if (type === 'service_request') {
      subject = '[SoyManada] Nueva solicitud de servicio'
      html = `
        <p><strong>Categoría:</strong> ${payload.category ?? '—'}</p>
        <p><strong>Descripción:</strong> ${payload.description}</p>
        <p><strong>Ciudad:</strong> ${payload.city ?? '—'}</p>
        ${payload.email ? `<p><strong>Email:</strong> ${payload.email}</p>` : ''}
      `
    } else if (type === 'provider_suggestion') {
      subject = `[SoyManada] Sugerencia de proveedor — ${payload.suggested_name}`
      html = `
        <h3>Proveedor sugerido</h3>
        <p><strong>Nombre:</strong> ${payload.suggested_name}</p>
        <p><strong>Categoría:</strong> ${payload.category ?? '—'}</p>
        <p><strong>Ciudad:</strong> ${payload.city ?? '—'}</p>
        <p><strong>Descripción:</strong> ${payload.description ?? '—'}</p>
        <p><strong>Contacto:</strong> ${payload.contact ?? '—'}</p>
        <h3>Quien sugiere</h3>
        <p><strong>Nombre:</strong> ${payload.suggester_name ?? '—'}</p>
        <p><strong>Email:</strong> ${payload.suggester_email ?? '—'}</p>
      `
    } else {
      return new Response(JSON.stringify({ error: 'unknown type' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to: TO, subject, html }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[notify-admin] Resend error:', err)
      return new Response(JSON.stringify({ error: 'resend_error' }), {
        status: 500,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('[notify-admin] Unexpected error:', e)
    return new Response(JSON.stringify({ error: 'internal' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
