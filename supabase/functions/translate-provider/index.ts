// supabase/functions/translate-provider/index.ts
// Edge Function — se dispara via webhook cuando se INSERT o UPDATE un proveedor.
// Traduce automáticamente service y description al inglés y francés usando DeepL.
// Requiere: DEEPL_API_KEY en los secrets de Supabase.

import { serve }        from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DEEPL_KEY          = Deno.env.get('DEEPL_API_KEY')!
const SUPABASE_URL        = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Campos que se traducen. Formato: [campo_base, sufijo_en, sufijo_fr]
const FIELDS = ['service', 'description'] as const

async function deepl(text: string, target: 'EN-US' | 'FR'): Promise<string> {
  if (!text?.trim()) return ''
  const res = await fetch('https://api-free.deepl.com/v2/translate', {
    method:  'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ text: [text], source_lang: 'ES', target_lang: target }),
  })
  if (!res.ok) {
    console.error(`DeepL error ${res.status}:`, await res.text())
    return text // fallback: devuelve original si falla
  }
  const data = await res.json()
  return data.translations?.[0]?.text ?? text
}

serve(async (req) => {
  try {
    const payload = await req.json()
    const record  = payload.record as Record<string, string | null>

    if (!record?.id) {
      return new Response('Missing record.id', { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const updates: Record<string, string> = {}

    for (const field of FIELDS) {
      const base = record[field]
      if (!base) continue

      // Solo traduce si el campo traducido está vacío/nulo
      if (!record[`${field}_en`]) {
        updates[`${field}_en`] = await deepl(base, 'EN-US')
      }
      if (!record[`${field}_fr`]) {
        updates[`${field}_fr`] = await deepl(base, 'FR')
      }
    }

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ skipped: true, reason: 'all translations present' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { error } = await supabase
      .from('providers')
      .update(updates)
      .eq('id', record.id)

    if (error) throw error

    console.log(`[translate-provider] provider ${record.id} — updated:`, Object.keys(updates))
    return new Response(JSON.stringify({ ok: true, updated: Object.keys(updates) }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('[translate-provider] error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
