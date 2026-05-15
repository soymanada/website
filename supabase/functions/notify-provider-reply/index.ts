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
    const { conversation_id, body_preview = '' } = payload

    if (!conversation_id) {
      return new Response(JSON.stringify({ error: 'missing conversation_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    // Fetch conversation with provider name
    const { data: conv, error: convErr } = await admin
      .from('conversations')
      .select('migrant_id, provider_id, providers(name)')
      .eq('id', conversation_id)
      .single()

    if (convErr || !conv) {
      console.warn('[notify-provider-reply] conversation not found:', conversation_id)
      return new Response(JSON.stringify({ skipped: true, reason: 'conversation_not_found' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const providerName = (conv.providers as { name?: string } | null)?.name ?? 'Tu proveedor'

    // Look up migrant email
    const { data: { user: migrantUser } } = await admin.auth.admin.getUserById(conv.migrant_id)
    const migrantEmail = migrantUser?.email
    if (!migrantEmail) {
      console.warn('[notify-provider-reply] no email for migrant:', conv.migrant_id)
      return new Response(JSON.stringify({ skipped: true, reason: 'no_migrant_email' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const preview   = body_preview.slice(0, 200)
    const dashboard = `${SITE_URL}/cuenta`

    const html = `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#333">
  <h2 style="color:#5b3ca3;margin-bottom:4px">${providerName} te respondió</h2>
  <p style="color:#555">
    <strong>${providerName}</strong> te respondió en SoyManada:
  </p>
  <blockquote style="border-left:3px solid #5b3ca3;margin:16px 0;padding:10px 16px;background:#f5f3ff;color:#444;font-style:italic">
    ${preview}${preview.length >= 200 ? '…' : ''}
  </blockquote>
  <p>
    <a href="${dashboard}"
       style="background:#5b3ca3;color:#fff;padding:11px 22px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600">
      Ver respuesta →
    </a>
  </p>
</div>`

    if (!RESEND_API_KEY) {
      console.error('[notify-provider-reply] RESEND_API_KEY not set')
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
        to:      [migrantEmail],
        subject: `${providerName} te respondió en SoyManada`,
        html,
      }),
    })

    const result = await res.json()

    if (!res.ok) {
      console.error('[notify-provider-reply] Resend error:', JSON.stringify(result))
      return new Response(JSON.stringify({ error: 'resend_failed', detail: result }), { status: 502 })
    }

    console.log('[notify-provider-reply] sent to', migrantEmail, '| resend id:', result?.id)
    return new Response(JSON.stringify({ ok: true, resend_id: result?.id }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[notify-provider-reply] unhandled:', err)
    return new Response(String(err), { status: 500 })
  }
})
