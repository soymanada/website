import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM       = Deno.env.get('NOTIFY_FROM') ?? 'SoyManada <noreply@soymanada.com>'
const SITE_URL   = Deno.env.get('SITE_URL')    ?? 'https://soymanada.com'

const subjects: Record<string, Record<string, string>> = {
  es: { subject: '¡Tu perfil en SoyManada ya está activo!' },
  en: { subject: 'Your SoyManada profile is now live!' },
  fr: { subject: 'Votre profil SoyManada est maintenant actif !' },
}

const html = (lang: string, name: string, business: string) => {
  if (lang === 'en') return `
    <p>Hi ${name},</p>
    <p>Your profile <strong>${business}</strong> has been approved and is now listed in the SoyManada directory.</p>
    <p>Manage your profile at <a href="${SITE_URL}/mi-perfil">${SITE_URL}/mi-perfil</a></p>
    <p>— The SoyManada team</p>
  `
  if (lang === 'fr') return `
    <p>Bonjour ${name},</p>
    <p>Votre profil <strong>${business}</strong> a été approuvé et figure désormais dans le répertoire SoyManada.</p>
    <p>Gérez votre profil sur <a href="${SITE_URL}/mi-perfil">${SITE_URL}/mi-perfil</a></p>
    <p>— L'équipe SoyManada</p>
  `
  return `
    <p>Hola ${name},</p>
    <p>Tu perfil <strong>${business}</strong> fue aprobado y ya aparece en el directorio de SoyManada.</p>
    <p>Para gestionar tu perfil ingresa a <a href="${SITE_URL}/mi-perfil">${SITE_URL}/mi-perfil</a></p>
    <p>— El equipo de SoyManada</p>
  `
}

serve(async (req) => {
  try {
    const { contact_email, business_name, contact_name, lang = 'es' } = await req.json()
    const { subject } = subjects[lang] ?? subjects['es']

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: contact_email,
        subject,
        html: html(lang, contact_name, business_name),
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
