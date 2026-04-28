// src/utils/utm.js
// Construye una URL con parámetros UTM para compartir desde el sitio.
//
// Uso:
//   buildUtmUrl('/proveedor/maria-garcia', { source: 'whatsapp', medium: 'share', campaign: 'provider_share' })
//   → 'https://soymanada.com/proveedor/maria-garcia?utm_source=whatsapp&utm_medium=share&utm_campaign=provider_share'

const BASE_URL = import.meta.env.VITE_SITE_URL ?? 'https://soymanada.com'

/**
 * @param {string} path  - Ruta relativa, ej. '/proveedor/mi-proveedor'
 * @param {{ source: string, medium: string, campaign: string, content?: string }} utm
 * @returns {string} URL absoluta con UTMs
 */
export function buildUtmUrl(path, { source, medium, campaign, content } = {}) {
  const url = new URL(path, BASE_URL)
  if (source)   url.searchParams.set('utm_source',   source)
  if (medium)   url.searchParams.set('utm_medium',   medium)
  if (campaign) url.searchParams.set('utm_campaign', campaign)
  if (content)  url.searchParams.set('utm_content',  content)
  return url.toString()
}
