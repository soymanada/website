// src/lib/auditLog.js
// Registra acciones admin en public.audit_logs — silent fail (nunca rompe el flujo principal)

import { supabase } from './supabase'

/**
 * @param {object} opts
 * @param {string} opts.action         'approve_provider' | 'reject_provider' | 'change_role' | 'invite_user' | 'create_provider' | 'edit_provider' | 'verify_provider' | 'toggle_active' | 'approve_photo' | 'reject_photo'
 * @param {string} [opts.targetType]   'provider' | 'user' | 'submission' | 'photo'
 * @param {string} [opts.targetId]
 * @param {string} [opts.targetName]
 * @param {object} [opts.payload]
 * @param {'ok'|'error'} [opts.result]
 * @param {string} [opts.errorMessage]
 */
export async function logAudit({
  action,
  targetType = null,
  targetId   = null,
  targetName = null,
  payload    = null,
  result     = 'ok',
  errorMessage = null,
}) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from('audit_logs').insert({
      admin_email:   session.user.email,
      action,
      target_type:   targetType,
      target_id:     targetId   ? String(targetId) : null,
      target_name:   targetName ?? null,
      payload:       payload    ?? null,
      result,
      error_message: errorMessage ?? null,
    })
  } catch (_) {
    // silencioso — el log nunca interrumpe la acción principal
  }
}
