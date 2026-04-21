import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const NOTIFY_FROM    = Deno.env.get('NOTIFY_FROM')    ?? 'SoyManada <noreply@soymanada.com>'
const SITE_URL       = Deno.env.get('SITE_URL')       ?? 'https://soymanada.github.io/website'
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')   ?? ''
const SERVICE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
}

const BRAND = '#7B4DC8'

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago',
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  try {
    const body = await req.json()
    const {
      event = 'created',
      booking_id, provider_id, provider_name,
      migrant_id, migrant_name, start_at, notes,
      call_link: bodyCallLink,
    } = body

    if (!booking_id || !provider_id || !migrant_id) {
      return new Response(
        JSON.stringify({ error: 'missing required fields' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    const { data: provider, error: pErr } = await admin
      .from('providers')
      .select('name, user_id, slug, calendar_link')
      .eq('id', provider_id)
      .single()

    if (pErr || !provider?.user_id) {
      console.error('[notify-booking] provider fetch error:', pErr)
      return new Response(
        JSON.stringify({ error: 'provider not found' }),
        { status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user: providerUser } } = await admin.auth.admin.getUserById(provider.user_id)
    const { data: { user: migrantUser  } } = await admin.auth.admin.getUserById(migrant_id)

    const providerEmail        = providerUser?.email
    const migrantEmail         = migrantUser?.email
    const resolvedProviderName = provider_name || provider.name || 'el proveedor'
    const resolvedMigrantName  = migrant_name  || migrantUser?.user_metadata?.full_name || 'un migrante'
    const dateStr              = start_at ? fmtDate(start_at) : 'fecha por confirmar'
    const dashboardUrl         = `${SITE_URL}/mi-perfil?tab=reservas`
    const providerProfileUrl   = `${SITE_URL}/proveedor/${provider.slug}`

    const results: Record<string, unknown> = { event }

    // ── EVENTO: confirmed → email de confirmación al migrante ──────
    if (event === 'confirmed') {
      if (migrantEmail) {
        const callLink: string | null = bodyCallLink ?? null

        const callSection = callLink
          ? `<p style="margin:16px 0">
               📹 <strong>Link de la llamada:</strong>
               <a href="${callLink}" style="color:#7B4DC8">${callLink}</a>
             </p>`
          : `<p style="color:#999;font-size:13px;margin:16px 0">
               El proveedor no configuró un link de llamada. Coordina por mensaje en SoyManada.
             </p>`

        const html = `
<div style="font-family:sans-serif;max-width:540px;margin:0 auto;color:#1a1a1a">
  <div style="background:${BRAND};padding:24px 28px;border-radius:10px 10px 0 0">
    <h1 style="color:#fff;margin:0;font-size:20px">✅ Tu cita fue confirmada</h1>
  </div>
  <div style="background:#faf8f4;padding:28px;border-radius:0 0 10px 10px;border:1px solid #e5e0d8">
    <p style="margin:0 0 16px">Hola <strong>${resolvedMigrantName}</strong>,</p>
    <p style="margin:0 0 16px">Tu cita con <strong>${resolvedProviderName}</strong> ya fue confirmada en SoyManada. 🎉</p>
    <div style="background:#fff;border:1px solid #e5e0d8;border-radius:8px;padding:16px 20px;margin:0 0 20px">
      <p style="margin:0 0 8px;color:#555;font-size:14px">📅 <strong>Fecha confirmada</strong></p>
      <p style="margin:0;font-size:16px;font-weight:600;color:${BRAND}">${dateStr}</p>
      ${notes ? `<p style="margin:12px 0 0;color:#555;font-size:14px">💬 <em>"${notes}"</em></p>` : ''}
    </div>
    ${callSection}
    ${callLink ? `<a href="${callLink}"
       style="background:${BRAND};color:#fff;padding:12px 24px;border-radius:7px;text-decoration:none;display:inline-block;font-weight:700;font-size:15px">
      Entrar a la cita →
    </a>` : ''}
    <p style="color:#aaa;font-size:12px;margin-top:28px">SoyManada · Directorio verificado para la Manada</p>
  </div>
</div>`
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({
            from:    NOTIFY_FROM,
            to:      [migrantEmail],
            subject: `Tu cita con ${resolvedProviderName} fue confirmada – SoyManada`,
            html,
          }),
        })
        results.migrant = await r.json()
      } else {
        results.migrant = { skipped: true, reason: 'no migrant email' }
      }

      return new Response(
        JSON.stringify({ ok: true, results }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // ── EVENTO: created (default) → email al proveedor + al migrante ──
    if (providerEmail) {
      const htmlProvider = `
<div style="font-family:sans-serif;max-width:540px;margin:0 auto;color:#1a1a1a">
  <div style="background:${BRAND};padding:24px 28px;border-radius:10px 10px 0 0">
    <h1 style="color:#fff;margin:0;font-size:20px">📅 Nueva reserva de cita</h1>
  </div>
  <div style="background:#faf8f4;padding:28px;border-radius:0 0 10px 10px;border:1px solid #e5e0d8">
    <p style="margin:0 0 16px">Hola <strong>${resolvedProviderName}</strong>,</p>
    <p style="margin:0 0 16px"><strong>${resolvedMigrantName}</strong> ha solicitado una cita contigo en SoyManada.</p>
    <div style="background:#fff;border:1px solid #e5e0d8;border-radius:8px;padding:16px 20px;margin:0 0 20px">
      <p style="margin:0 0 8px;color:#555;font-size:14px">📅 <strong>Fecha solicitada</strong></p>
      <p style="margin:0;font-size:16px;font-weight:600;color:${BRAND}">${dateStr}</p>
      ${notes ? `<p style="margin:12px 0 0;color:#555;font-size:14px">💬 <em>"${notes}"</em></p>` : ''}
    </div>
    <a href="${dashboardUrl}"
       style="background:${BRAND};color:#fff;padding:12px 24px;border-radius:7px;text-decoration:none;display:inline-block;font-weight:700;font-size:15px">
      Gestionar reserva →
    </a>
    <p style="color:#aaa;font-size:12px;margin-top:28px">SoyManada · Directorio verificado para la Manada</p>
  </div>
</div>`
      const r1 = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from:    NOTIFY_FROM,
          to:      [providerEmail],
          subject: `Nueva reserva de ${resolvedMigrantName} – SoyManada`,
          html:    htmlProvider,
        }),
      })
      results.provider = await r1.json()
    } else {
      results.provider = { skipped: true, reason: 'no provider email' }
    }

    if (migrantEmail) {
      const htmlMigrant = `
<div style="font-family:sans-serif;max-width:540px;margin:0 auto;color:#1a1a1a">
  <div style="background:${BRAND};padding:24px 28px;border-radius:10px 10px 0 0">
    <h1 style="color:#fff;margin:0;font-size:20px">✅ Solicitud de cita enviada</h1>
  </div>
  <div style="background:#faf8f4;padding:28px;border-radius:0 0 10px 10px;border:1px solid #e5e0d8">
    <p style="margin:0 0 16px">Hola <strong>${resolvedMigrantName}</strong>,</p>
    <p style="margin:0 0 16px">Tu solicitud de cita con <strong>${resolvedProviderName}</strong> fue enviada correctamente. Te avisaremos cuando el proveedor la confirme.</p>
    <div style="background:#fff;border:1px solid #e5e0d8;border-radius:8px;padding:16px 20px;margin:0 0 20px">
      <p style="margin:0 0 8px;color:#555;font-size:14px">📅 <strong>Fecha solicitada</strong></p>
      <p style="margin:0;font-size:16px;font-weight:600;color:${BRAND}">${dateStr}</p>
      ${notes ? `<p style="margin:12px 0 0;color:#555;font-size:14px">💬 <em>"${notes}"</em></p>` : ''}
    </div>
    <p style="margin:0 0 20px;color:#555;font-size:14px">Una vez confirmada, recibirás otro email con el link de la reunión.</p>
    <a href="${providerProfileUrl}"
       style="background:${BRAND};color:#fff;padding:12px 24px;border-radius:7px;text-decoration:none;display:inline-block;font-weight:700;font-size:15px">
      Ver perfil de ${resolvedProviderName} →
    </a>
    <p style="color:#aaa;font-size:12px;margin-top:28px">SoyManada · Sin estafas, sin nada raro</p>
  </div>
</div>`
      const r2 = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from:    NOTIFY_FROM,
          to:      [migrantEmail],
          subject: `Cita solicitada con ${resolvedProviderName} – SoyManada`,
          html:    htmlMigrant,
        }),
      })
      results.migrant = await r2.json()
    } else {
      results.migrant = { skipped: true, reason: 'no migrant email' }
    }

    return new Response(
      JSON.stringify({ ok: true, results }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[notify-booking]', err)
    return new Response(String(err), { status: 500, headers: CORS_HEADERS })
  }
})
