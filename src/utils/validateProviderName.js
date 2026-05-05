// src/utils/validateProviderName.js

export const GENERIC_NAME_WORDS = [
  'traducciones','traduccion','traducción','servicios','servicio',
  'certificadas','certificado','certificada','asesoría','asesoria',
  'consultoría','consultoria','consultora','seguros','tramites',
  'tramitación','tramitacion','contabilidad','taxes','impuestos',
  'alojamiento','arriendo','habitacion','habitación','trabajo','empleo',
  'idiomas','clases','ingles','inglés','español','espanol','frances',
  'francés','banca','banco','remesas','bienestar','salud','mental',
  'visa','visas','migracion','migración','immigration','translations',
  'certified','services','accounting','housing','rental','insurance',
  'professional','profesional','independiente','freelance',
]

// Insultos y palabras inapropiadas (es/en)
const PROFANITY_WORDS = [
  // Español
  'puta','puto','mierda','coño','cono','pendejo','pendeja','culero','culo',
  'polla','verga','chinga','chingada','chingado','cabron','cabrona','marica',
  'maricon','maricón','joder','hostia','gilipollas','subnormal','idiota',
  'imbecil','imbécil','estupido','estúpido','estupida','retrasado','retrasada',
  'hdp','hijodeputa','hijaputa','weon','weona','hueon','chucha','conchetumare',
  'culiao','culiao','aweonao','forro','pelotudo','boludo','carajo','cojonudo',
  'hijueputa','gonorrea','malparido','malparida','piroba','zorra','perra',
  'bastardo','bastarda','desgraciado','inutil','inútil',
  // English
  'fuck','shit','bitch','asshole','bastard','cunt','dick','cock','pussy',
  'faggot','nigger','nigga','whore','slut','retard','moron','idiot',
  'dumbass','motherfucker','motherfucking','bullshit','crap','damn','hell',
]

function normalize(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/**
 * Devuelve true si el nombre parece genérico (describe servicio, no persona/marca)
 */
export function isGenericProviderName(name) {
  if (!name || name.trim().length < 3) return false
  const words = normalize(name)
    .split(/[\s\/\-_,]+/)
    .filter(w => w.length > 2)
  if (words.length === 0) return false
  const bannedCount = words.filter(w =>
    GENERIC_NAME_WORDS.some(b => w.includes(b))
  ).length
  return bannedCount >= 2 || (bannedCount / words.length) >= 0.5
}

/**
 * Devuelve true si el nombre contiene insultos o lenguaje inapropiado
 */
export function hasProfanity(name) {
  if (!name || name.trim().length < 2) return false
  const normalized = normalize(name)
  return PROFANITY_WORDS.some(word => {
    // Busca la palabra como token completo o dentro de otra palabra
    const regex = new RegExp(`(^|[\\s\\-_,/])${word}($|[\\s\\-_,/])`, 'i')
    return regex.test(normalized) || normalized.includes(word)
  })
}
