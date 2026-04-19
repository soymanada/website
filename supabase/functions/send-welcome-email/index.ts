// supabase/functions/send-welcome-email/index.ts
// Sent to the provider after admin approves their application.
//
// Required secrets (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY  → API key from resend.com
//   NOTIFY_FROM     → e.g. "SoyManada <noreply@soymanada.com>"
//   SITE_URL        → "https://soymanada.com"

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })

  try {
    const RESEND_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
    const FROM       = Deno.env.get('NOTIFY_FROM')    ?? 'SoyManada <noreply@soymanada.com>'
    const SITE_URL   = Deno.env.get('SITE_URL')       ?? 'https://soymanada.com'

    if (!RESEND_KEY) {
      console.warn('[send-welcome-email] RESEND_API_KEY not set — skipping')
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const { contact_email, business_name, contact_name } = await req.json()

    if (!contact_email || !business_name) {
      return new Response(JSON.stringify({ error: 'missing fields' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const dashboardUrl = `${SITE_URL}/mi-perfil`
    const name = contact_name ?? business_name

    const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(79,70,229,0.10);">

        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:26px;">🐾</p>
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">SoyManada</h1>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">La comunidad migrante de Canadá</p>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 40px 28px;">
            <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#120826;">
              ¡Tu perfil fue aprobado, ${name}! 🎉
            </h2>
            <p style="margin:0 0 20px;font-size:15px;color:#5A4877;line-height:1.6;">
              <strong>${business_name}</strong> ya forma parte de SoyManada.
              Puedes acceder a tu panel de proveedor para completar tu perfil,
              activar tu período gratuito Gold y empezar a recibir clientes.
            </p>

            <div style="background:#f5f3ff;border:1.5px solid #ede9fe;border-radius:12px;padding:16px 20px;margin:0 0 24px;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#4f46e5;text-transform:uppercase;letter-spacing:0.06em;">
                🚀 Early Bird — 3 meses Gold GRATIS
              </p>
              <p style="margin:0;font-size:14px;color:#5A4877;line-height:1.5;">
                Activa tu período gratuito desde tu panel antes del 30 de junio.
              </p>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${dashboardUrl}" target="_blank"
                   style="display:inline-block;background:#4f46e5;color:#ffffff;font-size:15px;font-weight:700;
                          text-decoration:none;padding:14px 36px;border-radius:100px;">
                  Ir a mi panel →
                </a>
              </td></tr>
            </table>

            <p style="margin:24px 0 0;font-size:13px;color:#9B8CB5;text-align:center;line-height:1.6;">
              Si tienes preguntas, responde este email o escríbenos por WhatsApp.
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#f5f3ff;padding:20px 40px;text-align:center;border-top:1px solid #ede9fe;">
            <p style="margin:0;font-size:12px;color:#9B8CB5;line-height:1.6;">
              SoyManada · Directorio para migrantes en Canadá<br>
              <a href="${SITE_URL}" style="color:#4f46e5;text-decoration:none;">soymanada.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    FROM,
        to:      [contact_email],
        subject: `¡Tu perfil en SoyManada fue aprobado, ${name}! 🐾`,
        html,
      }),
    })

    const body = await res.json()
    if (!res.ok) {
      console.error('[send-welcome-email] Resend error:', body)
      return new Response(JSON.stringify({ error: 'resend_error', detail: body }), {
        status: 502, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('[send-welcome-email] Unexpected error:', e)
    return new Response(JSON.stringify({ error: 'internal' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
