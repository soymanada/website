// src/hooks/useVerifiedInteraction.js
// Returns whether the authenticated user has had a verified interaction
// with a given provider (i.e., the provider replied to their message).
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useVerifiedInteraction(providerId, userId) {
  const [hasInteraction, setHasInteraction] = useState(false)
  const [loading,        setLoading]        = useState(true)

  useEffect(() => {
    if (!providerId || !userId) { setLoading(false); return }
    supabase
      .from('verified_interactions')
      .select('id')
      .eq('provider_id', providerId)
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        setHasInteraction(!!data)
        setLoading(false)
      })
  }, [providerId, userId])

  return { hasInteraction, loading }
}
