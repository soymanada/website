// send-provider-campaign
// Uso:
//   Test:  POST { "test_email": "proveedormanada@gmail.com" }
//   Todos: POST { "send_all": true }
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const NOTIFY_FROM    = Deno.env.get('NOTIFY_FROM')    ?? 'SoyManada <hola@soymanada.com>'
const SITE_URL       = Deno.env.get('SITE_URL')       ?? 'https://soymanada.com'
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')   ?? ''
const SERVICE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}))
    const { test_email, send_all } = body

    if (!test_email && !send_all) {
      return new Response(
        JSON.stringify({ error: 'Pasa test_email o send_all:true' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    const { data: providers, error: provErr } = await admin
      .from('providers')
      .select('id, name, slug, user_id')
      .eq('active', true)
      .not('user_id', 'is', null)
      .not('slug', 'is', null)

    if (provErr) throw provErr

    const results: { name: string; email: string; status: string; id?: string }[] = []

    for (const prov of providers ?? []) {
      const { data: { user }, error: userErr } = await admin.auth.admin.getUserById(prov.user_id)
      if (userErr || !user?.email) continue

      const recipientEmail = test_email ?? user.email

      if (test_email && user.email.toLowerCase() !== test_email.toLowerCase()) continue

      // Fetch pilot invite token (no is_active filter — any existing record counts)
      const { data: invite } = await admin
        .from('pilot_invites')
        .select('token')
        .eq('provider_id', prov.id)
        .maybeSingle()

      // Count reviews already received
      const { count: usedCount } = await admin
        .from('pilot_opinions')
        .select('id', { count: 'exact', head: true })
        .eq('provider_id', prov.id)

      const opinarUrl  = invite?.token ? `${SITE_URL}/opinar?token=${invite.token}` : null
      const remaining  = Math.max(0, 10 - (usedCount ?? 0))
      const profileUrl = `${SITE_URL}/proveedor/${prov.slug}`
      const firstName  = prov.name.split(/\s+/)[0]

      const { ok, id, message } = await sendEmail({
        to: recipientEmail,
        provName: firstName,
        profileUrl,
        opinarUrl,
        remaining,
      })

      results.push({ name: prov.name, email: recipientEmail, status: ok ? 'sent' : `error: ${message}`, id })

      if (test_email) break
    }

    return new Response(JSON.stringify({ ok: true, sent: results.length, results }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[send-provider-campaign]', err)
    return new Response(String(err), { status: 500 })
  }
})

async function sendEmail({ to, provName, profileUrl, opinarUrl, remaining }: {
  to: string
  provName: string
  profileUrl: string
  opinarUrl: string | null
  remaining: number
}) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from:    NOTIFY_FROM,
      to:      [to],
      subject: `${provName}, tu perfil en SoyManada está activo 🐾 compártelo con tus clientes`,
      html:    buildEmail({ provName, profileUrl, opinarUrl, remaining }),
    }),
  })
  const data = await res.json()
  return { ok: res.ok, id: data.id, message: data.message }
}

function buildEmail({ provName, profileUrl, opinarUrl, remaining }: {
  provName: string
  profileUrl: string
  opinarUrl: string | null
  remaining: number
}) {
  const pawBar = '🐾🐾🐾🐾🐾'
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0eeff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0eeff;padding:32px 16px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

  <!-- Header morado -->
  <tr><td style="background:#4338ca;border-radius:10px 10px 0 0;padding:28px 36px;text-align:center">
    <div style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px">SoyManada</div>
    <div style="font-size:12px;color:#c7d2fe;margin-top:6px;letter-spacing:0.5px">${pawBar}</div>
    <div style="font-size:13px;color:#c7d2fe;margin-top:6px">Directorio verificado para la comunidad migrante en Canadá</div>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#ffffff;padding:36px;border:1px solid #e5e5e5;border-top:none">

    <p style="font-size:18px;font-weight:700;color:#4338ca;margin:0 0 14px">
      Hola ${provName} 👋
    </p>

    <p style="font-size:15px;line-height:1.75;color:#333;margin:0 0 24px">
      Tu perfil en SoyManada está <strong>activo y visible</strong> para cientos de migrantes
      latinoamericanos que buscan servicios de confianza en Canadá.
      Gracias por ser parte de esta comunidad desde el comienzo. 🐾
    </p>

    <!-- Links de evaluación -->
    <p style="font-size:16px;font-weight:700;color:#4338ca;margin:0 0 6px">🔗 Tus links para recibir evaluaciones</p>
    <p style="font-size:14px;line-height:1.7;color:#555;margin:0 0 18px">
      Tienes <strong>dos canales</strong> para que tus clientes te evalúen —
      uno para clientes externos sin cuenta, y otro para quienes ya están en SoyManada:
    </p>

    <!-- Cuadro azul: link externo opinar?token= -->
    ${opinarUrl ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef6ff;border:1.5px solid #4338ca;border-radius:8px;margin:0 0 20px">
    <tr><td style="padding:22px 24px">
      <div style="font-size:14px;font-weight:700;color:#312e81;margin-bottom:8px">📬 Link exclusivo para clientes externos</div>
      <p style="font-size:13px;line-height:1.75;color:#444;margin:0 0 12px">
        Este link permite que tus clientes actuales te evalúen
        <strong>sin necesidad de registrarse</strong> en SoyManada.
        Tienes <strong style="color:#4338ca">${remaining} cupo${remaining !== 1 ? 's' : ''} disponible${remaining !== 1 ? 's' : ''}</strong>
        de 10 en total — úsalos con tus mejores clientes. 🐾
      </p>
      <div style="background:#fff;border:1px solid #c7d2fe;border-radius:6px;padding:10px 14px;font-size:12px;color:#4338ca;word-break:break-all;margin-bottom:16px;font-weight:600">
        ${opinarUrl}
      </div>
      <a href="${opinarUrl}" style="background:#4338ca;color:#fff;padding:11px 24px;border-radius:6px;text-decoration:none;font-weight:700;font-size:13px;display:inline-block">
        🐾 Compartir link de evaluación
      </a>
    </td></tr>
    </table>` : `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;margin:0 0 20px">
    <tr><td style="padding:16px 20px">
      <p style="margin:0;font-size:13px;color:#856404">
        ⚠️ Tu link de evaluaciones aún no está activado. Escríbenos a hola@soymanada.com para activarlo.
      </p>
    </td></tr>
    </table>`}

    <!-- Link perfil SoyManada -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5ff;border:1px solid #c7d2fe;border-radius:8px;margin:0 0 24px">
    <tr><td style="padding:16px 20px">
      <div style="font-size:13px;font-weight:700;color:#4338ca;margin-bottom:6px">🐾 Tu perfil público (para usuarios registrados en SoyManada)</div>
      <a href="${profileUrl}" style="font-size:13px;color:#4338ca;word-break:break-all">${profileUrl}</a>
      <p style="margin:8px 0 0;font-size:12px;color:#6b7280">
        Los migrantes ya registrados pueden evaluarte directamente desde aquí.
        Compártelo también en redes sociales.
      </p>
    </td></tr>
    </table>

    <!-- Ejemplo perfil Francisco Aleuy -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border:1px solid #e0e0e0;border-radius:8px;margin:0 0 28px">
    <tr><td style="padding:16px 20px">
      <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#333">👀 ¿Cómo se verá tu perfil?</p>
      <p style="margin:0;font-size:14px;line-height:1.75;color:#555">
        Creamos un perfil de ejemplo en la categoría <strong>Seguros</strong> — el de
        <a href="${SITE_URL}/proveedor/francisco-aleuy" style="color:#4338ca;font-weight:600;text-decoration:none">Francisco Aleuy</a> —
        para que veas exactamente cómo lucirá tu perfil cuando un migrante lo encuentre:
        foto, descripción, contacto y sección de reseñas. 🐾
      </p>
    </td></tr>
    </table>

    <!-- Beneficios -->
    <p style="font-size:15px;font-weight:700;color:#4338ca;margin:0 0 12px">
      🎁 Lo que tienes con SoyManada este año
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
      ${[
        ['🐾', 'Perfil verificado con badge de confianza para tus clientes'],
        ['💬', 'Mensajería directa: migrantes pueden escribirte desde tu perfil'],
        ['📊', 'Métricas de visitas y contactos en tu panel'],
        ['📅', 'Sistema de reservas (disponible para planes activos)'],
        ['🚀', 'Acceso anticipado a nuevas funciones antes que nadie'],
        ['🤝', 'Comunidad exclusiva de proveedores verificados de confianza'],
      ].map(([icon, text]) => `
      <tr><td style="padding:7px 0;font-size:14px;color:#444;line-height:1.5;border-bottom:1px solid #f3f4f6">
        <span style="margin-right:10px">${icon}</span>${text}
      </td></tr>`).join('')}
    </table>

    <!-- Feedback -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 28px">
    <tr><td style="background:#fff8e1;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:20px 22px">
      <div style="font-size:14px;font-weight:700;color:#92400e;margin-bottom:10px">💬 Queremos escucharte — en serio</div>
      <p style="font-size:14px;line-height:1.75;color:#555;margin:0 0 10px">
        Estamos en etapa piloto y <strong>es probable que encuentres cosas que no funcionan como deberían</strong>.
        Eso es exactamente por lo que estamos aquí. Si algo falla, si tienes una idea o simplemente quieres
        decirnos algo:
      </p>
      <ul style="margin:0;padding-left:18px;font-size:14px;line-height:2.1;color:#555">
        <li>Reporta errores que encuentres 🐾</li>
        <li>Sugiere funciones que necesitas</li>
        <li>Propón mejoras a tu perfil o al directorio</li>
        <li>Cuéntanos cómo te está yendo con tus clientes migrantes</li>
      </ul>
      <p style="font-size:14px;line-height:1.75;color:#555;margin:12px 0 0">
        <strong>Responde este email directamente</strong> — llega al equipo y lo leeremos.
      </p>
    </td></tr>
    </table>

    <p style="font-size:13px;line-height:1.8;color:#777;margin:0">
      Gracias por confiar en SoyManada. 🐾<br>
      — El equipo de SoyManada
    </p>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#ede9fe;border-radius:0 0 10px 10px;padding:18px 36px;text-align:center">
    <p style="margin:0;font-size:11px;color:#6b7280;line-height:1.8">
      ${pawBar}<br>
      Recibiste este email porque eres proveedor verificado en SoyManada.<br>
      <a href="${profileUrl}" style="color:#4338ca;text-decoration:none">Ver tu perfil</a>
      &nbsp;·&nbsp;
      <a href="mailto:hola@soymanada.com" style="color:#4338ca;text-decoration:none">Contactar al equipo</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}
