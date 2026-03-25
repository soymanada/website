// src/utils/providerI18n.js
// Helper para leer los campos traducidos de un proveedor según el idioma activo.
// El backend guarda: description, description_en, description_fr
// (idem para service_en, service_fr, name_en, name_fr)
// Si el campo traducido no existe, cae al español como fallback.

/**
 * Devuelve el valor del campo del proveedor en el idioma activo.
 * @param {object} provider  — objeto proveedor de Supabase
 * @param {string} field     — nombre base del campo (ej: 'description', 'service', 'name')
 * @param {string} lang      — idioma activo de i18n (ej: 'es', 'en', 'fr-CA')
 * @returns {string}
 */
export function providerField(provider, field, lang) {
  if (!provider) return ''
  if (!lang || lang === 'es') return provider[field] ?? ''

  const suffix = lang.startsWith('fr') ? '_fr' : '_en'
  return provider[`${field}${suffix}`] || provider[field] || ''
}

/**
 * Hook-friendly: devuelve un objeto con los campos traducidos del proveedor.
 * Uso: const p = resolveProvider(provider, i18n.language)
 */
export function resolveProvider(provider, lang) {
  if (!provider) return provider
  return {
    ...provider,
    name:        providerField(provider, 'name',        lang),
    service:     providerField(provider, 'service',     lang),
    description: providerField(provider, 'description', lang),
  }
}
