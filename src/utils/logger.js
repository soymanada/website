/**
 * logger.js — SoyManada error logging utility
 *
 * Capa 1: Sentry captura crashes automáticamente (ver main.jsx)
 * Capa 2: Este logger captura errores silenciosos de Supabase,
 *         warnings y eventos de negocio que Sentry no atrapa solo.
 *
 * Uso:
 *   import { logger } from '../utils/logger'
 *   logger.error('ProviderDashboard/fetchProviders', error, { userId })
 *   logger.warn('AuthBanner', 'Token expirado', { route })
 *   logger.info('CategoryGrid', 'Categorías cargadas')
 */

let Sentry = null

async function getSentry() {
  if (!Sentry) {
    try {
      Sentry = await import('@sentry/react')
    } catch {
      Sentry = null
    }
  }
  return Sentry
}

const isDev = import.meta.env.DEV
const hasDSN = Boolean(import.meta.env.VITE_SENTRY_DSN)

export const logger = {
  /**
   * Error crítico — consola en dev, Sentry en producción
   * Usar cuando: query Supabase falla, auth error, datos corruptos
   *
   * @param {string} context  - Nombre del componente/función (ej: 'ProviderDashboard/save')
   * @param {Error|unknown} error - El error capturado
   * @param {object} extra   - Datos adicionales (userId, route, payload, etc.)
   */
  async error(context, error, extra = {}) {
    const timestamp = new Date().toISOString()

    if (isDev) {
      console.group(`🔴 [ERROR] ${context} — ${timestamp}`)
      console.error(error)
      if (Object.keys(extra).length) console.table(extra)
      console.groupEnd()
    }

    if (hasDSN) {
      const sentry = await getSentry()
      if (sentry) {
        sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
          tags: { context },
          extra: { ...extra, timestamp },
        })
      }
    }
  },

  /**
   * Warning — dato inesperado pero la app no rompe
   * Usar cuando: respuesta vacía inesperada, campo faltante, fallback activado
   *
   * @param {string} context
   * @param {string} message
   * @param {object} extra
   */
  async warn(context, message, extra = {}) {
    const timestamp = new Date().toISOString()

    if (isDev) {
      console.group(`🟡 [WARN] ${context} — ${timestamp}`)
      console.warn(message)
      if (Object.keys(extra).length) console.table(extra)
      console.groupEnd()
    }

    if (hasDSN) {
      const sentry = await getSentry()
      if (sentry) {
        sentry.captureMessage(message, {
          level: 'warning',
          tags: { context },
          extra: { ...extra, timestamp },
        })
      }
    }
  },

  /**
   * Info — solo visible en desarrollo, ignorado en producción
   * Usar para: confirmar flujos exitosos, datos cargados, navegación
   *
   * @param {string} context
   * @param {string} message
   * @param {*} data - Opcional: objeto, array, string para inspeccionar
   */
  info(context, message, data = null) {
    if (!isDev) return
    const timestamp = new Date().toISOString()
    if (data !== null) {
      console.group(`🔵 [INFO] ${context} — ${timestamp}`)
      console.info(message)
      console.log(data)
      console.groupEnd()
    } else {
      console.info(`🔵 [INFO] ${context} — ${message}`)
    }
  },
}

/**
 * Atajo para errores de Supabase — detecta el patrón { data, error }
 * y loggea solo si hay error.
 *
 * Uso:
 *   const { data, error } = await supabase.from('providers').select('*')
 *   logSupabase('ProviderDashboard/fetchProviders', { data, error }, { userId })
 *
 * @param {string} context
 * @param {{ error: unknown }} result - Resultado de query Supabase
 * @param {object} extra
 * @returns {boolean} true si hubo error
 */
export function logSupabase(context, { error }, extra = {}) {
  if (!error) return false
  logger.error(context, error, extra)
  return true
}
