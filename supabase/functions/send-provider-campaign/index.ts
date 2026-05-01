// send-provider-campaign
// Envía email a todos los proveedores activos (o a uno de prueba).
// Uso:
//   Test:  POST con body { "test_email": "proveedormanada@gmail.com" }
//   Todos: POST con body { "send_all": true }
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

    // Fetch active providers linked to a real user account
    const { data: providers, error: provErr } = await admin
      .from('providers')
      .select('id, name, slug, user_id')
      .eq('active', true)
      .not('user_id', 'is', null)
      .not('slug', 'is', null)

    if (provErr) throw provErr

    const results: { name: string; email: string; status: string; id?: string }[] = []

    for (const prov of providers ?? []) {
      // Get email from auth.users via admin
      const { data: { user }, error: userErr } = await admin.auth.admin.getUserById(prov.user_id)
      if (userErr || !user?.email) continue

      const recipientEmail = test_email ?? user.email

      // In test mode: only send to the provider whose auth email matches test_email
      if (test_email && user.email.toLowerCase() !== test_email.toLowerCase()) continue

      const profileUrl = `${SITE_URL}/proveedor/${prov.slug}`
      const firstName  = prov.name.split(/\s+/)[0]

      const { ok, id, message } = await sendEmail({
        to:          recipientEmail,
        provName:    firstName,
        profileUrl,
      })

      results.push({ name: prov.name, email: recipientEmail, status: ok ? 'sent' : `error: ${message}`, id })

      // Test mode: stop after first match
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

async function sendEmail({ to, provName, profileUrl }: {
  to: string
  provName: string
  profileUrl: string
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
      subject: `${provName}, tu perfil en SoyManada está activo — compártelo 🎉`,
      html:    buildEmail({ provName, profileUrl }),
    }),
  })
  const data = await res.json()
  return { ok: res.ok, id: data.id, message: data.message }
}

function buildEmail({ provName, profileUrl }: { provName: string; profileUrl: string }) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

  <!-- Header -->
  <tr><td style="background:#2d5a27;border-radius:10px 10px 0 0;padding:28px 36px;text-align:center">
    <div style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px">SoyManada</div>
    <div style="font-size:13px;color:#b8d4a8;margin-top:4px">Directorio para la comunidad migrante en Canadá</div>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#ffffff;padding:36px;border:1px solid #e5e5e5;border-top:none">

    <p style="font-size:18px;font-weight:700;color:#2d5a27;margin:0 0 16px">
      Hola ${provName} 👋
    </p>

    <p style="font-size:15px;line-height:1.75;color:#333;margin:0 0 20px">
      Tu perfil en SoyManada está <strong>activo y visible</strong> para cientos de migrantes latinoamericanos que buscan servicios de confianza en Canadá. Gracias por ser parte de esta comunidad desde el comienzo.
    </p>

    <!-- Review link box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6faf5;border:1.5px solid #2d5a27;border-radius:8px;margin:24px 0">
    <tr><td style="padding:24px;text-align:center">
      <div style="font-size:13px;font-weight:600;color:#555;margin-bottom:8px">🔗 Tu link de evaluaciones</div>
      <div style="font-size:12px;color:#888;margin-bottom:18px;word-break:break-all">${profileUrl}</div>
      <a href="${profileUrl}" style="background:#2d5a27;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block">
        Ver mi perfil →
      </a>
      <div style="font-size:12px;color:#888;margin-top:14px;line-height:1.6">
        Comparte este link con tus clientes por <strong>WhatsApp</strong>, redes sociales o email.<br>
        Desde ahí pueden dejarte una reseña directamente en tu perfil.
      </div>
    </td></tr>
    </table>

    <!-- Benefits -->
    <p style="font-size:15px;font-weight:700;color:#2d5a27;margin:28px 0 12px">
      🎁 Lo que tienes con SoyManada este año
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${[
        ['✅', 'Perfil verificado con badge de confianza para tus clientes'],
        ['💬', 'Mensajería directa: migrantes pueden escribirte desde tu perfil'],
        ['📊', 'Métricas de visitas y contactos en tu panel'],
        ['📅', 'Sistema de reservas (ya disponible para planes activos)'],
        ['🚀', 'Acceso anticipado a nuevas funciones antes que nadie'],
        ['🤝', 'Comunidad exclusiva de proveedores verificados de confianza'],
      ].map(([icon, text]) => `
      <tr><td style="padding:6px 0;font-size:14px;color:#444;line-height:1.5">
        <span style="margin-right:8px">${icon}</span>${text}
      </td></tr>`).join('')}
    </table>

    <!-- Feedback box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0">
    <tr><td style="background:#fff8e1;border-left:4px solid #f9a825;border-radius:0 6px 6px 0;padding:18px 20px">
      <div style="font-size:14px;font-weight:700;color:#5d4037;margin-bottom:8px">💬 Queremos escucharte</div>
      <p style="font-size:14px;line-height:1.75;color:#555;margin:0">
        Estamos en etapa piloto y <strong>tu opinión vale más que cualquier otra cosa</strong>.
        Si encuentras algo que no funciona, si tienes una propuesta, o simplemente quieres
        decirnos algo — responde este email directamente. Cada mensaje que recibamos en este
        período nos ayuda a mejorar para toda la comunidad.
      </p>
    </td></tr>
    </table>

    <p style="font-size:13px;line-height:1.7;color:#777;margin:0">
      Gracias por confiar en SoyManada.<br>
      — El equipo de SoyManada
    </p>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f5f5f5;border-radius:0 0 10px 10px;padding:18px 36px;text-align:center">
    <p style="margin:0;font-size:11px;color:#999;line-height:1.6">
      Recibiste este email porque eres proveedor verificado en SoyManada.<br>
      <a href="${profileUrl}" style="color:#2d5a27;text-decoration:none">Ver tu perfil</a>
      &nbsp;·&nbsp;
      <a href="mailto:hola@soymanada.com" style="color:#2d5a27;text-decoration:none">Contactar al equipo</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}
