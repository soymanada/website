import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const NOTIFY_FROM    = Deno.env.get('NOTIFY_FROM')    ?? 'SoyManada <noreply@soymanada.com>'
const SITE_URL       = Deno.env.get('SITE_URL')       ?? 'https://soymanada.com'
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')   ?? ''
const SERVICE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

serve(async (req) => {
  try {
    const payload = await req.json()

    // ── Accept both field-name conventions ────────────────────────
    // Frontend sends: { to_provider_id, body_preview }
    // Legacy callers:  { provider_id,    message_preview, migrant_name }
    const provider_id     = payload.to_provider_id ?? payload.provider_id
    const message_preview = payload.body_preview   ?? payload.message_preview ?? ''
    let   migrant_name    = payload.migrant_name   ?? ''

    if (!provider_id) {
      return new Response(JSON.stringify({ error: 'missing provider_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    // ── Resolve migrant name from JWT when not provided ───────────
    if (!migrant_name) {
      const authHeader = req.headers.get('Authorization') ?? ''
      const token      = authHeader.replace('Bearer ', '').trim()
      if (token) {
        const { data: authData } = await admin.auth.getUser(token)
        const u = authData?.user
        migrant_name =
          u?.user_metadata?.full_name ??
          u?.user_metadata?.name      ??
          u?.email                    ??
          'Un migrante'
      } else {
        migrant_name = 'Un migrante'
      }
    }

    // ── Fetch provider preferences and linked user_id ─────────────
    const { data: provider, error: provErr } = await admin
      .from('providers')
      .select('name, notif_new_message, user_id')
      .eq('id', provider_id)
      .single()

    if (provErr || !provider) {
      console.warn('[notify-new-message] provider not found:', provider_id, provErr?.message)
      return new Response(JSON.stringify({ skipped: true, reason: 'provider_not_found' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!provider.user_id || provider.notif_new_message === false) {
      return new Response(JSON.stringify({ skipped: true, reason: 'notifications_off' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // ── Look up provider email ────────────────────────────────────
    const { data: { user: providerUser } } = await admin.auth.admin.getUserById(provider.user_id)
    const providerEmail = providerUser?.email
    if (!providerEmail) {
      console.warn('[notify-new-message] no email for user_id:', provider.user_id)
      return new Response(JSON.stringify({ skipped: true, reason: 'no_email' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const preview   = message_preview.slice(0, 200)
    const dashboard = `${SITE_URL}/mi-perfil`

    const html = `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#333">
  <h2 style="color:#2d5a27;margin-bottom:4px">Nuevo mensaje de ${migrant_name}</h2>
  <p style="color:#555">
    <strong>${migrant_name}</strong> te escribió por primera vez en SoyManada:
  </p>
  <blockquote style="border-left:3px solid #2d5a27;margin:16px 0;padding:10px 16px;background:#f6faf5;color:#444;font-style:italic">
    ${preview}${preview.length >= 200 ? '…' : ''}
  </blockquote>
  <p>
    <a href="${dashboard}"
       style="background:#2d5a27;color:#fff;padding:11px 22px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600">
      Responder →
    </a>
  </p>
  <p style="color:#aaa;font-size:12px;margin-top:24px">
    Puedes desactivar estas notificaciones en tu panel → pestaña Mensajes → Preferencias de notificación.
  </p>
</div>`

    if (!RESEND_API_KEY) {
      console.error('[notify-new-message] RESEND_API_KEY not set')
      return new Response(JSON.stringify({ error: 'no_resend_key' }), { status: 500 })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:    NOTIFY_FROM,
        to:      [providerEmail],
        subject: `${migrant_name} te escribió en SoyManada`,
        html,
      }),
    })

    const result = await res.json()

    if (!res.ok) {
      console.error('[notify-new-message] Resend error:', JSON.stringify(result))
      return new Response(JSON.stringify({ error: 'resend_failed', detail: result }), { status: 502 })
    }

    console.log('[notify-new-message] sent to', providerEmail, '| resend id:', result?.id)
    return new Response(JSON.stringify({ ok: true, resend_id: result?.id }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[notify-new-message] unhandled:', err)
    return new Response(String(err), { status: 500 })
  }
})
