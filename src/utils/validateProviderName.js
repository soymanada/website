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

/**
 * Devuelve true si el nombre parece genérico (describe servicio, no persona)
 */
export function isGenericProviderName(name) {
  if (!name || name.trim().length < 3) return false
  const words = name.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accents
    .split(/[\s\/\-_,]+/)
    .filter(w => w.length > 2)
  if (words.length === 0) return false
  const bannedCount = words.filter(w =>
    GENERIC_NAME_WORDS.some(b => w.includes(b))
  ).length
  return bannedCount >= 2 || (bannedCount / words.length) >= 0.5
}
