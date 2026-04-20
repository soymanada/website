import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const NOTIFY_FROM    = Deno.env.get('NOTIFY_FROM')    ?? 'SoyManada <noreply@soymanada.com>'
const SITE_URL       = Deno.env.get('SITE_URL')       ?? 'https://soymanada.github.io/website'
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')   ?? ''
const SERVICE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

serve(async (req) => {
  try {
    const { provider_id, migrant_name, message_preview } = await req.json()

    if (!provider_id) {
      return new Response('missing provider_id', { status: 400 })
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    // Fetch provider notification preference and linked user
    const { data: provider } = await admin
      .from('providers')
      .select('name, notif_new_message, user_id')
      .eq('id', provider_id)
      .single()

    if (!provider?.user_id || !provider.notif_new_message) {
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Look up provider email in auth.users
    const { data: { user } } = await admin.auth.admin.getUserById(provider.user_id)
    const providerEmail = user?.email
    if (!providerEmail) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no email' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const preview   = (message_preview ?? '').slice(0, 200)
    const dashboard = `${SITE_URL}/mi-perfil`

    const html = `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#333">
  <h2 style="color:#2d5a27;margin-bottom:4px">Nuevo mensaje de ${migrant_name}</h2>
  <p style="color:#555">Tienes un nuevo mensaje de <strong>${migrant_name}</strong> en SoyManada:</p>
  <blockquote style="border-left:3px solid #2d5a27;margin:16px 0;padding:10px 16px;background:#f6faf5;color:#444;font-style:italic">
    ${preview}${preview.length >= 200 ? '…' : ''}
  </blockquote>
  <p>
    <a href="${dashboard}"
       style="background:#2d5a27;color:#fff;padding:11px 22px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600">
      Ver mensaje →
    </a>
  </p>
  <p style="color:#aaa;font-size:12px;margin-top:24px">
    Puedes desactivar estas notificaciones en tu panel → pestaña Mensajes → Preferencias de notificación.
  </p>
</div>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:    NOTIFY_FROM,
        to:      [providerEmail],
        subject: `Nuevo mensaje de ${migrant_name} – SoyManada`,
        html,
      }),
    })

    const result = await res.json()
    return new Response(JSON.stringify({ ok: true, resend: result }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[notify-new-message]', err)
    return new Response(String(err), { status: 500 })
  }
})
