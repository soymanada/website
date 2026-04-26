// src/hooks/useReviews.js — fetch y submit de evaluaciones
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const MIN_REVIEWS = 3  // mínimo para mostrar el rating en la card

// ── Rating agregado de un proveedor ──────────────────────────────
export function useProviderRating(providerId) {
  const [state, setState] = useState({ avg: null, count: 0, visible: false, sub: {}, recommendPct: null, loading: true })

  useEffect(() => {
    if (!providerId) return
    supabase
      .from('reviews')
      .select('rating, rating_speed, rating_reliability, rating_clarity, rating_value')
      .eq('provider_id', providerId)
      .then(({ data }) => {
        if (!data?.length) {
          setState({ avg: null, count: 0, visible: false, sub: {}, recommendPct: null, loading: false })
          return
        }
        const avg = data.reduce((s, r) => s + r.rating, 0) / data.length

        const avgField = (field) => {
          const vals = data.filter(r => r[field] != null).map(r => r[field])
          if (vals.length < MIN_REVIEWS) return null
          return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length * 10) / 10
        }

        const recommendPct = Math.round(
          data.filter(r => r.rating >= 4).length / data.length * 100
        )

        setState({
          avg:     Math.round(avg * 10) / 10,
          count:   data.length,
          visible: data.length >= MIN_REVIEWS,
          sub: {
            speed:       avgField('rating_speed'),
            reliability: avgField('rating_reliability'),
            clarity:     avgField('rating_clarity'),
            value:       avgField('rating_value'),
          },
          recommendPct,
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

// ── Reacciones de huella por reseña ──────────────────────────────
export function useReviewReactions(reviewId, userId) {
  const [count,      setCount]      = useState(0)
  const [hasReacted, setHasReacted] = useState(false)
  const [busy,       setBusy]       = useState(false)

  useEffect(() => {
    if (!reviewId) return
    supabase
      .from('review_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', reviewId)
      .then(({ count: cnt }) => setCount(cnt ?? 0))

    if (userId) {
      supabase
        .from('review_reactions')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .maybeSingle()
        .then(({ data }) => setHasReacted(!!data))
    }
  }, [reviewId, userId])

  const toggle = useCallback(async () => {
    if (!userId || busy) return
    setBusy(true)
    if (hasReacted) {
      await supabase.from('review_reactions')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', userId)
      setHasReacted(false)
      setCount(c => Math.max(0, c - 1))
    } else {
      await supabase.from('review_reactions')
        .insert({ review_id: reviewId, user_id: userId })
      setHasReacted(true)
      setCount(c => c + 1)
    }
    setBusy(false)
  }, [reviewId, userId, hasReacted, busy])

  return { count, hasReacted, toggle }
}

// ── Submit / upsert de una review ────────────────────────────────
export async function submitReview({
  providerId, userId, rating, comment,
  ratingSpeed, ratingReliability, ratingClarity, ratingValue,
  verified = false,
}) {
  const { error } = await supabase.from('reviews').upsert(
    {
      provider_id:         providerId,
      user_id:             userId,
      rating,
      comment:             comment?.trim() || null,
      rating_speed:        ratingSpeed       || null,
      rating_reliability:  ratingReliability || null,
      rating_clarity:      ratingClarity     || null,
      rating_value:        ratingValue       || null,
      verified,
    },
    { onConflict: 'user_id,provider_id' }
  )
  return { error }
}

// ── Respuesta del proveedor a una reseña ─────────────────────────
export async function submitProviderReply(reviewId, reply) {
  const { error } = await supabase.from('reviews').update({
    provider_reply:    reply.trim(),
    provider_reply_at: new Date().toISOString(),
  }).eq('id', reviewId)
  return { error }
}
