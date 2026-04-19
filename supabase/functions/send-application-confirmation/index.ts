import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM       = Deno.env.get('NOTIFY_FROM') ?? 'SoyManada <noreply@soymanada.com>'
const SITE_URL   = Deno.env.get('SITE_URL')    ?? 'https://soymanada.com'

const content: Record<string, { subject: string; body: (name: string, business: string) => string }> = {
  es: {
    subject: 'Recibimos tu solicitud en SoyManada',
    body: (name, business) => `
      <p>Hola ${name},</p>
      <p>Recibimos la solicitud de <strong>${business}</strong> para unirse al directorio de SoyManada.</p>
      <p>Revisaremos tu perfil en los próximos días y te avisaremos por este medio cuando esté aprobado.</p>
      <p>— El equipo de SoyManada</p>
    `,
  },
  en: {
    subject: 'We received your SoyManada application',
    body: (name, business) => `
      <p>Hi ${name},</p>
      <p>We received the application for <strong>${business}</strong> to join the SoyManada directory.</p>
      <p>We'll review your profile in the coming days and notify you here once it's approved.</p>
      <p>— The SoyManada team</p>
    `,
  },
  fr: {
    subject: 'Nous avons reçu votre demande SoyManada',
    body: (name, business) => `
      <p>Bonjour ${name},</p>
      <p>Nous avons reçu la demande de <strong>${business}</strong> pour rejoindre le répertoire SoyManada.</p>
      <p>Nous examinerons votre profil dans les prochains jours et vous informerons ici une fois approuvé.</p>
      <p>— L'équipe SoyManada</p>
    `,
  },
}

serve(async (req) => {
  try {
    const { contact_email, business_name, contact_name, lang = 'es' } = await req.json()
    const { subject, body } = content[lang] ?? content['es']

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: contact_email,
        subject,
        html: body(contact_name, business_name),
      })
    })

    return new Response(JSON.stringify({ ok: res.ok }), {
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
