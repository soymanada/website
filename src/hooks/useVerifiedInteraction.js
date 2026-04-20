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
      .from('conversations')
      .select('verified_interaction')
      .eq('provider_id', providerId)
      .eq('migrant_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        setHasInteraction(data?.verified_interaction === true)
        setLoading(false)
      })
  }, [providerId, userId])

  return { hasInteraction, loading }
}
