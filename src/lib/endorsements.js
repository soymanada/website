import { supabase } from './supabase'

const MAX_ENDORSEMENTS = 5

// Obtener endorsements visibles de un proveedor (para la tarjeta/perfil)
export async function getEndorsementsForProvider(toProviderId) {
  const { data, error } = await supabase
    .from('provider_endorsement_display')
    .select('*')
    .eq('to_provider_id', toProviderId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// Obtener mis endorsements emitidos (para el dashboard)
export async function getMyEndorsements(fromProviderId) {
  const { data, error } = await supabase
    .from('provider_endorsements')
    .select(`
      id, message, active, created_at,
      to_provider:to_provider_id (id, name, category_slug, avatar_url, slug, active, verified)
    `)
    .eq('from_provider_id', fromProviderId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// Endorsar a un proveedor existente
export async function endorseExistingProvider(fromProviderId, toProviderId, message) {
  const { data, error } = await supabase
    .from('provider_endorsements')
    .insert({ from_provider_id: fromProviderId, to_provider_id: toProviderId, message })
    .select()
    .single()
  if (error) throw error
  return data
}

// Recomendar proveedor nuevo (llama a la RPC)
export async function recommendNewProvider({ fromProviderId, name, categorySlug, service, contactWhatsapp, contactInstagram, message }) {
  const { data, error } = await supabase.rpc('recommend_new_provider', {
    p_from_provider_id:  fromProviderId,
    p_name:              name,
    p_category_slug:     categorySlug,
    p_service:           service,
    p_contact_whatsapp:  contactWhatsapp || null,
    p_contact_instagram: contactInstagram || null,
    p_message:           message,
  })
  if (error) throw error
  return data // nuevo provider_id
}

// Desactivar un endorsement emitido
export async function deactivateEndorsement(endorsementId) {
  const { error } = await supabase
    .from('provider_endorsements')
    .update({ active: false })
    .eq('id', endorsementId)
  if (error) throw error
}

export { MAX_ENDORSEMENTS }
