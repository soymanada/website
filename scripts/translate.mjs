// scripts/translate.mjs
// Genera en/ y fr-CA/ a partir de es/translation.json usando Anthropic API
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root      = resolve(__dirname, '..')
const esPath    = resolve(root, 'public/locales/es/translation.json')
const esJson    = readFileSync(esPath, 'utf-8')

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
if (!ANTHROPIC_KEY) { console.error('Falta ANTHROPIC_API_KEY'); process.exit(1) }

async function translate(targetLang, systemPrompt) {
  console.log(`\nTraduciendo → ${targetLang}…`)
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-opus-4-5',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Translate all string values in this JSON. Keep all keys exactly as-is. Preserve any {{variable}} placeholders exactly. Return only valid JSON, no markdown fences.\n\n${esJson}`
      }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }

  const data  = await res.json()
  const text  = data.content[0].text.trim()

  // Parsear para validar JSON válido
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    // Intentar extraer JSON si viene con texto extra
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Respuesta no contiene JSON válido')
    parsed = JSON.parse(match[0])
  }

  // Agregar marca de revisión
  parsed._status = 'AUTO_TRANSLATED_NEEDS_REVIEW'
  parsed._source_lang = 'es'

  // Validar que no se perdieron variables {{}}
  const esVars   = [...esJson.matchAll(/\{\{[^}]+\}\}/g)].map(m => m[0])
  const outStr   = JSON.stringify(parsed)
  const missing  = esVars.filter(v => !outStr.includes(v))
  if (missing.length) {
    console.warn(`⚠️  Variables posiblemente perdidas en ${targetLang}: ${[...new Set(missing)].join(', ')}`)
  }

  return parsed
}

const SYSTEM_EN = `You are a professional translator. Translate the JSON values from Spanish to English.
Context: This is a directory of verified service providers for Spanish-speaking migrants moving to Canada.
Tone: warm, direct, community-oriented. Keep it natural and friendly.
Rules:
- Preserve all JSON keys exactly as-is
- Preserve all {{variable}} placeholders unchanged
- Return only valid JSON, no markdown`

const SYSTEM_FR = `You are a professional translator. Translate the JSON values from Spanish to Canadian French (fr-CA).
Context: This is a directory of verified service providers for migrants moving to Canada.
Tone: warm, direct. Use Quebec French conventions where applicable.
Rules:
- Preserve all JSON keys exactly as-is
- Preserve all {{variable}} placeholders unchanged
- Return only valid JSON, no markdown`

try {
  const en   = await translate('en',    SYSTEM_EN)
  const frCA = await translate('fr-CA', SYSTEM_FR)

  writeFileSync(resolve(root, 'public/locales/en/translation.json'),    JSON.stringify(en,   null, 2), 'utf-8')
  writeFileSync(resolve(root, 'public/locales/fr-CA/translation.json'), JSON.stringify(frCA, null, 2), 'utf-8')

  console.log('\n✅ Traducciones generadas:')
  console.log('   public/locales/en/translation.json')
  console.log('   public/locales/fr-CA/translation.json')
  console.log('\n⚠️  Ambos archivos tienen _status: AUTO_TRANSLATED_NEEDS_REVIEW')
  console.log('   Revisa manualmente cualquier string con {{ antes del deploy.')
} catch (err) {
  console.error('Error:', err.message)
  process.exit(1)
}
