import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM       = 'SoyManada <hola@soymanada.com>'

serve(async (req) => {
  const { contact_email, business_name, contact_name } = await req.json()

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: FROM,
      to: contact_email,
      subject: '¡Tu perfil en SoyManada ya está activo!',
      html: `
        <p>Hola ${contact_name},</p>
        <p>Tu perfil <strong>${business_name}</strong> fue aprobado y ya aparece en el directorio de SoyManada.</p>
        <p>Para gestionar tu perfil ingresa a <a href="https://soymanada.com/mi-perfil">soymanada.com/mi-perfil</a></p>
        <p>— El equipo de SoyManada</p>
      `
    })
  })

  return new Response(JSON.stringify({ ok: res.ok }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
