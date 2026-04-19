import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_KEY  = Deno.env.get('RESEND_API_KEY')!
const ADMIN_EMAIL = Deno.env.get('NOTIFY_TO')   ?? 'admin@soymanada.com'
const FROM        = Deno.env.get('NOTIFY_FROM') ?? 'SoyManada Notificaciones <noreply@soymanada.com>'
const SITE_URL    = Deno.env.get('SITE_URL')    ?? 'https://soymanada.com'

type EventType = 'community_photo' | 'provider_application' | 'new_review'

interface Payload {
  type: EventType
  id: string
  [key: string]: unknown
}

function buildEmail(payload: Payload): { subject: string; html: string } {
  const adminUrl = `${SITE_URL}/admin`

  switch (payload.type) {
    case 'community_photo':
      return {
        subject: '📸 Nueva foto comunitaria pendiente de revisión',
        html: `
          <p>Se subió una nueva foto comunitaria y está esperando aprobación.</p>
          <p><strong>ID:</strong> ${payload.id}</p>
          ${payload.caption ? `<p><strong>Descripción:</strong> ${payload.caption}</p>` : ''}
          <p><a href="${adminUrl}">Revisar en el panel de admin →</a></p>
        `,
      }

    case 'provider_application':
      return {
        subject: '📋 Nueva solicitud de proveedor',
        html: `
          <p>Un nuevo proveedor solicitó unirse a SoyManada.</p>
          <p><strong>Negocio:</strong> ${payload.business_name ?? '—'}</p>
          <p><strong>Contacto:</strong> ${payload.contact_name ?? '—'}</p>
          <p><strong>Email:</strong> ${payload.contact_email ?? '—'}</p>
          <p><a href="${adminUrl}">Revisar solicitud →</a></p>
        `,
      }

    case 'new_review':
      return {
        subject: '⭐ Nueva reseña publicada',
        html: `
          <p>Se publicó una nueva reseña en SoyManada.</p>
          <p><strong>Proveedor ID:</strong> ${payload.provider_id ?? '—'}</p>
          <p><strong>Puntuación:</strong> ${payload.rating ?? '—'}/5</p>
          <p><a href="${adminUrl}">Ver en el panel →</a></p>
        `,
      }

    default:
      return {
        subject: '🔔 Nueva notificación en SoyManada',
        html: `<pre>${JSON.stringify(payload, null, 2)}</pre>`,
      }
  }
}

serve(async (req) => {
  try {
    const payload: Payload = await req.json()
    const { subject, html } = buildEmail(payload)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: ADMIN_EMAIL, subject, html })
    })

    const data = await res.json()
    return new Response(JSON.stringify({ ok: res.ok, data }), {
      status: res.ok ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
