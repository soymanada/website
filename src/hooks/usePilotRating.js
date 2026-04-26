// src/hooks/usePilotRating.js
// Rating agregado desde pilot_opinions (sistema definitivo de huellas)
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePilotRating(providerId) {
  const [state, setState] = useState({ avg: null, count: 0, loading: true })

  useEffect(() => {
    if (!providerId) { setState({ avg: null, count: 0, loading: false }); return }

    supabase
      .from('pilot_opinions')
      .select('rating')
      .eq('provider_id', providerId)
      .then(({ data }) => {
        const ops        = data ?? []
        const withRating = ops.filter(o => o.rating)
        const avg        = withRating.length
          ? Math.round(withRating.reduce((s, o) => s + o.rating, 0) / withRating.length * 10) / 10
          : null
        setState({ avg, count: ops.length, loading: false })
      })
  }, [providerId])

  return state
}
