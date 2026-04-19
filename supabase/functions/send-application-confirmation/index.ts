// supabase/functions/send-application-confirmation/index.ts
// Sent to the provider right after they submit their application.
// Language priority: Inglés → en | Español → es | Francés → fr | default → en
//
// Required secrets:
//   RESEND_API_KEY  NOTIFY_FROM  SITE_URL

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function detectLang(languages: string[]): 'en' | 'es' | 'fr' {
  if (languages?.includes('Inglés'))  return 'en'
  if (languages?.includes('Español')) return 'es'
  if (languages?.includes('Francés')) return 'fr'
  return 'en'
}

const COPY = {
  en: {
    subject: (name: string) => `We received your application, ${name}! 🐾`,
    heading: (name: string) => `We got it, ${name}!`,
    body: (biz: string) =>
      `Your application for <strong>${biz}</strong> is now under review. We typically respond within 1–2 business days.`,
    tip_heading: 'Important',
    tip_body: 'Make sure you have a SoyManada account registered with this email address. When your profile is approved, it will be automatically linked to your account.',
    register_cta: 'Create your account →',
    closing: 'Questions? Just reply to this email.',
    footer: 'SoyManada · Directory for migrants in Canada',
  },
  es: {
    subject: (name: string) => `¡Recibimos tu solicitud, ${name}! 🐾`,
    heading: (name: string) => `¡Ya la tenemos, ${name}!`,
    body: (biz: string) =>
      `Tu solicitud para <strong>${biz}</strong> está siendo revisada. Generalmente respondemos en 1–2 días hábiles.`,
    tip_heading: 'Importante',
    tip_body: 'Asegúrate de tener una cuenta en SoyManada registrada con este email. Cuando tu perfil sea aprobado, se vinculará automáticamente a tu cuenta.',
    register_cta: 'Crear mi cuenta →',
    closing: '¿Tienes preguntas? Responde este email.',
    footer: 'SoyManada · Directorio para migrantes en Canadá',
  },
  fr: {
    subject: (name: string) => `Nous avons reçu votre demande, ${name}! 🐾`,
    heading: (name: string) => `C'est reçu, ${name}!`,
    body: (biz: string) =>
      `Votre demande pour <strong>${biz}</strong> est en cours d'examen. Nous répondons généralement dans 1–2 jours ouvrables.`,
    tip_heading: 'Important',
    tip_body: 'Assurez-vous d\'avoir un compte SoyManada enregistré avec cet email. Lorsque votre profil sera approuvé, il sera automatiquement lié à votre compte.',
    register_cta: 'Créer mon compte →',
    closing: 'Des questions ? Répondez à cet email.',
    footer: 'SoyManada · Répertoire pour les migrants au Canada',
  },
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })

  try {
    const RESEND_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
    const FROM       = Deno.env.get('NOTIFY_FROM')    ?? 'SoyManada <noreply@soymanada.com>'
    const SITE_URL   = Deno.env.get('SITE_URL')       ?? 'https://soymanada.com'

    if (!RESEND_KEY) {
      console.warn('[send-application-confirmation] RESEND_API_KEY not set — skipping')
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const { contact_email, business_name, contact_name, languages } = await req.json()

    if (!contact_email || !business_name) {
      return new Response(JSON.stringify({ error: 'missing fields' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const lang = detectLang(languages ?? [])
    const c    = COPY[lang]
    const name = contact_name ?? business_name
    const registerUrl = `${SITE_URL}/login?mode=register`

    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(79,70,229,0.10);">

        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:26px;">🐾</p>
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">SoyManada</h1>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 40px 28px;">
            <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#120826;">${c.heading(name)}</h2>
            <p style="margin:0 0 24px;font-size:15px;color:#5A4877;line-height:1.6;">${c.body(business_name)}</p>

            <div style="background:#f5f3ff;border:1.5px solid #ede9fe;border-radius:12px;padding:16px 20px;margin:0 0 28px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#4f46e5;text-transform:uppercase;letter-spacing:0.06em;">
                ${c.tip_heading}
              </p>
              <p style="margin:0;font-size:14px;color:#5A4877;line-height:1.5;">${c.tip_body}</p>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${registerUrl}" target="_blank"
                   style="display:inline-block;background:#4f46e5;color:#ffffff;font-size:14px;font-weight:700;
                          text-decoration:none;padding:13px 32px;border-radius:100px;">
                  ${c.register_cta}
                </a>
              </td></tr>
            </table>

            <p style="margin:24px 0 0;font-size:13px;color:#9B8CB5;text-align:center;">${c.closing}</p>
          </td>
        </tr>

        <tr>
          <td style="background:#f5f3ff;padding:20px 40px;text-align:center;border-top:1px solid #ede9fe;">
            <p style="margin:0;font-size:12px;color:#9B8CB5;line-height:1.6;">
              ${c.footer}<br>
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
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [contact_email], subject: c.subject(name), html }),
    })

    const body = await res.json()
    if (!res.ok) {
      console.error('[send-application-confirmation] Resend error:', body)
      return new Response(JSON.stringify({ error: 'resend_error', detail: body }), {
        status: 502, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true, lang }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('[send-application-confirmation] Unexpected error:', e)
    return new Response(JSON.stringify({ error: 'internal' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
