// src/hooks/useReviews.js — fetch y submit de evaluaciones
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const MIN_REVIEWS = 3  // mínimo para mostrar el rating en la card

// ── Rating agregado de un proveedor ──────────────────────────────
export function useProviderRating(providerId) {
  const [state, setState] = useState({ avg: null, count: 0, loading: true })

  useEffect(() => {
    if (!providerId) return
    supabase
      .from('reviews')
      .select('rating')
      .eq('provider_id', providerId)
      .eq('status', 'published')
      .then(({ data }) => {
        if (!data?.length) {
          setState({ avg: null, count: 0, loading: false })
          return
        }
        const avg = data.reduce((s, r) => s + r.rating, 0) / data.length
        setState({
          avg:     Math.round(avg * 10) / 10,
          count:   data.length,
          visible: data.length >= MIN_REVIEWS,
          loading: false,
        })
      })
  }, [providerId])

  return state
}

// ── Review del usuario autenticado para un proveedor ─────────────
export function useUserReview(providerId, userId) {
  const [review,  setReview]  = useState(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(() => {
    if (!userId || !providerId) { setLoading(false); return }
    supabase
      .from('reviews')
      .select('*')
      .eq('provider_id', providerId)
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => { setReview(data); setLoading(false) })
  }, [providerId, userId])

  useEffect(() => { reload() }, [reload])

  return { review, loading, reload }
}

// ── Submit / upsert de una review ────────────────────────────────
export async function submitReview({ providerId, userId, rating, comment, ratingComm, ratingQual, ratingPrice }) {
  const { error } = await supabase.from('reviews').upsert(
    {
      provider_id:  providerId,
      user_id:      userId,
      rating,
      comment:      comment?.trim() || null,
      rating_comm:  ratingComm  || null,
      rating_qual:  ratingQual  || null,
      rating_price: ratingPrice || null,
      status:       'published',
    },
    { onConflict: 'user_id,provider_id' }
  )
  return { error }
}
