import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ ok: false, error: 'No autorizado' }), {
        status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Verificar que el caller es admin
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser()
    if (userErr || !user) {
      return new Response(JSON.stringify({ ok: false, error: 'No autorizado' }), {
        status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ ok: false, error: 'Acceso denegado' }), {
        status: 403, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const { email, role = 'migrant', tier = 'bronze' } = await req.json()
    if (!email) {
      return new Response(JSON.stringify({ ok: false, error: 'Email requerido' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const { data: invited, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)
    if (inviteErr) {
      return new Response(JSON.stringify({ ok: false, error: inviteErr.message }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // Upsert perfil con rol y tier
    if (invited?.user?.id) {
      await supabaseAdmin.from('profiles').upsert({
        id:   invited.user.id,
        role,
        tier,
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
