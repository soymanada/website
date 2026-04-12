// supabase/functions/send-review-request/index.ts
// Envía un email al migrante después de una atención (reserva completada)
// pidiendo que evalúe al proveedor.
//
// Variables requeridas en Supabase → Edge Functions → Secrets:
//   RESEND_API_KEY           → API key de resend.com
//   SUPABASE_URL             → URL de tu proyecto Supabase (ya disponible por defecto)
//   SUPABASE_SERVICE_ROLE_KEY → Service role key (para leer auth.users)
//   NOTIFY_FROM              → ej. "SoyManada <noreply@soymanada.com>"
//   SITE_URL                 → "https://soymanada.com"

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_KEY    = Deno.env.get('RESEND_API_KEY')           ?? ''
const NOTIFY_FROM   = Deno.env.get('NOTIFY_FROM')              ?? 'SoyManada <noreply@soymanada.com>'
const SITE_URL      = Deno.env.get('SITE_URL')                 ?? 'https://soymanada.com'
const SB_URL        = Deno.env.get('SUPABASE_URL')             ?? ''
const SB_SERVICE    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const adminClient = createClient(SB_URL, SB_SERVICE)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const {
      migrant_id,      // UUID del migrante
      provider_name,   // Nombre del proveedor
      provider_slug,   // Slug para el link de reseña
      booking_date,    // Fecha de la cita (string legible)
    } = await req.json()

    if (!migrant_id || !provider_name || !provider_slug) {
      return new Response(JSON.stringify({ error: 'missing fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Obtener email del migrante usando service role key
    const { data: userData, error: userErr } = await adminClient.auth.admin.getUserById(migrant_id)
    if (userErr || !userData?.user?.email) {
      return new Response(JSON.stringify({ error: 'user not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const migrantEmail = userData.user.email
    const migrantName  = userData.user.user_metadata?.full_name
                      ?? userData.user.user_metadata?.name
                      ?? 'migrante'

    const reviewUrl = `${SITE_URL}/proveedor/${provider_slug}`

    const html = buildEmail({ migrantName, providerName: provider_name, reviewUrl, bookingDate: booking_date })

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    NOTIFY_FROM,
        to:      [migrantEmail],
        subject: `¿Cómo te fue con ${provider_name}? Cuéntanos 🐾`,
        html,
      }),
    })

    const body = await res.json()
    return new Response(JSON.stringify({ ok: res.ok, resend: body }), {
      status: res.ok ? 200 : 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// ── Email template ─────────────────────────────────────────────────
function buildEmail({ migrantName, providerName, reviewUrl, bookingDate }: {
  migrantName: string
  providerName: string
  reviewUrl: string
  bookingDate?: string
}) {
  const dateLine = bookingDate ? `<p style="margin:0 0 8px;font-size:14px;color:#5A4877;">📅 ${bookingDate}</p>` : ''

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(79,70,229,0.10);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:26px;">🐾</p>
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">SoyManada</h1>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">La comunidad migrante de Canadá</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 28px;">
            <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#120826;line-height:1.3;">
              ¿Cómo te fue con <span style="color:#4f46e5;">${providerName}</span>?
            </h2>
            <p style="margin:0 0 20px;font-size:15px;color:#5A4877;line-height:1.6;">
              Hola ${migrantName}, tuviste una atención con <strong>${providerName}</strong>${bookingDate ? ' el ' + bookingDate : ''}.
              Tu opinión ayuda a otros migrantes a elegir bien.
            </p>
            ${dateLine}

            <!-- Paw rating (decorativo) -->
            <div style="text-align:center;margin:24px 0 28px;font-size:28px;letter-spacing:6px;">
              🐾🐾🐾🐾🐾
            </div>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${reviewUrl}" target="_blank"
                   style="display:inline-block;background:#4f46e5;color:#ffffff;font-size:15px;font-weight:700;
                          text-decoration:none;padding:14px 36px;border-radius:100px;
                          letter-spacing:0.2px;">
                  Dejar mi evaluación →
                </a>
              </td></tr>
            </table>

            <p style="margin:24px 0 0;font-size:13px;color:#9B8CB5;text-align:center;line-height:1.6;">
              Solo toma 30 segundos · Anónimo si lo prefieres
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f3ff;padding:20px 40px;text-align:center;border-top:1px solid #ede9fe;">
            <p style="margin:0;font-size:12px;color:#9B8CB5;line-height:1.6;">
              Recibiste este email porque usaste SoyManada.<br>
              <a href="${reviewUrl}" style="color:#4f46e5;text-decoration:none;">soymanada.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
