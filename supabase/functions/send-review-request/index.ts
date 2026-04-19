import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_KEY    = Deno.env.get('RESEND_API_KEY')!
const FROM          = Deno.env.get('NOTIFY_FROM')             ?? 'SoyManada <noreply@soymanada.com>'
const SITE_URL      = Deno.env.get('SITE_URL')                ?? 'https://soymanada.com'
const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const content: Record<string, { subject: string; body: (provider: string, link: string) => string }> = {
  es: {
    subject: '¿Cómo fue tu experiencia con este proveedor?',
    body: (provider, link) => `
      <p>Hola,</p>
      <p>Tuviste contacto con <strong>${provider}</strong> a través de SoyManada.</p>
      <p>¿Podés dejarnos una reseña? Solo toma un minuto y ayuda a otros migrantes.</p>
      <p><a href="${link}">Dejar mi reseña →</a></p>
      <p>— El equipo de SoyManada</p>
    `,
  },
  en: {
    subject: 'How was your experience with this provider?',
    body: (provider, link) => `
      <p>Hi,</p>
      <p>You connected with <strong>${provider}</strong> through SoyManada.</p>
      <p>Could you leave a review? It only takes a minute and helps other migrants.</p>
      <p><a href="${link}">Leave my review →</a></p>
      <p>— The SoyManada team</p>
    `,
  },
  fr: {
    subject: 'Comment s\'est passée votre expérience avec ce prestataire ?',
    body: (provider, link) => `
      <p>Bonjour,</p>
      <p>Vous avez été en contact avec <strong>${provider}</strong> via SoyManada.</p>
      <p>Pourriez-vous laisser un avis ? Cela ne prend qu'une minute et aide d'autres migrants.</p>
      <p><a href="${link}">Laisser mon avis →</a></p>
      <p>— L'équipe SoyManada</p>
    `,
  },
}

serve(async (req) => {
  try {
    const { user_id, provider_id, provider_name, lang = 'es' } = await req.json()

    // Obtener email del usuario via service role
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user_id}`, {
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
      }
    })
    const userData = await userRes.json()
    const user_email = userData?.email
    if (!user_email) throw new Error('User email not found')

    const reviewLink = `${SITE_URL}/proveedor/${provider_id}#reviews`
    const { subject, body } = content[lang] ?? content['es']

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: user_email,
        subject,
        html: body(provider_name, reviewLink),
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
