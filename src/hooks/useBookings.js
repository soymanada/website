// src/hooks/useBookings.js
import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'

// ── Provider: load / save availability ───────────────────────────
export function useAvailability(providerId) {
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!providerId) { setLoading(false); return }
    try {
      const { data, error } = await supabase
        .from('provider_availability')
        .select('*')
        .eq('provider_id', providerId)
        .eq('active', true)
      if (error) console.warn('[useAvailability]', error.message)
      setAvailability(Array.isArray(data) ? data : [])
    } catch (e) {
      console.warn('[useAvailability] unexpected error:', e)
      setAvailability([])
    }
    setLoading(false)
  }, [providerId])

  useEffect(() => { load() }, [load])
  return { availability, loading, reload: load }
}

export async function saveAvailability(providerId, slots) {
  await supabase.from('provider_availability').delete().eq('provider_id', providerId)
  if (!slots.length) return { error: null }
  const { error } = await supabase.from('provider_availability').insert(
    slots.map(s => ({ ...s, provider_id: providerId }))
  )
  return { error }
}

// ── Timezone-aware date builder ───────────────────────────────────
const pad2 = n => String(n).padStart(2, '0')

// Returns a Date whose UTC value represents HH:MM on dateStr (YYYY-MM-DD) in the given tz
function makeTZDate(dateStr, h, m, tz) {
  const local = new Date(`${dateStr}T${pad2(h)}:${pad2(m)}:00`)
  const inTZ  = new Date(local.toLocaleString('en-US', { timeZone: tz }))
  return new Date(local.getTime() + (local.getTime() - inTZ.getTime()))
}

// ── Generate free slots for next N days ──────────────────────────
export function generateSlots(availability, takenBookings, daysAhead = 14) {
  const slots = []
  const now   = new Date()
  const tz    = availability[0]?.timezone || 'UTC'

  for (let d = 1; d <= daysAhead; d++) {
    const probe   = new Date(now.getTime() + d * 24 * 3600 * 1000)
    // Date string (YYYY-MM-DD) in provider's timezone — 'sv' locale gives ISO format
    const dateStr = new Intl.DateTimeFormat('sv', { timeZone: tz }).format(probe)
    // Day-of-week in provider's timezone
    const dow     = new Date(new Date(probe).toLocaleString('en-US', { timeZone: tz })).getDay()

    const dayAvail = availability.filter(a => a.day_of_week === dow)

    for (const avail of dayAvail) {
      const [sh, sm] = avail.start_at.slice(0, 5).split(':').map(Number)
      const [eh, em] = avail.end_at.slice(0, 5).split(':').map(Number)
      const startM = sh * 60 + sm
      const endM   = eh * 60 + em
      const dur    = avail.slot_minutes

      for (let m = startM; m + dur <= endM; m += dur) {
        const slotStart = makeTZDate(dateStr, Math.floor(m / 60), m % 60, tz)
        const slotEnd   = new Date(slotStart.getTime() + dur * 60000)

        if (slotStart <= now) continue

        const taken = takenBookings.some(b => {
          const bs = new Date(b.start_at)
          const be = new Date(b.end_at)
          return b.status !== 'cancelled' && bs < slotEnd && be > slotStart
        })

        if (!taken) slots.push({ start: slotStart, end: slotEnd })
      }
    }
  }
  return slots
}

// ── Public: existing bookings to exclude from slots ───────────────
export function useProviderBookings(providerId) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!providerId) { setLoading(false); return }
    const from = new Date().toISOString()
    const to   = new Date(Date.now() + 16 * 24 * 3600 * 1000).toISOString()
    supabase.from('bookings')
      .select('start_at,end_at,status')
      .eq('provider_id', providerId)
      .gte('start_at', from)
      .lte('start_at', to)
      .then(({ data }) => { setBookings(data ?? []); setLoading(false) })
  }, [providerId])

  return { bookings, loading }
}

// ── Migrant: create a booking ─────────────────────────────────────
export async function createBooking({ providerId, userId, start, end, notes }) {
  const { data, error } = await supabase.from('bookings').insert({
    provider_id: providerId,
    user_id:     userId,
    start_at:    start.toISOString(),
    end_at:      end.toISOString(),
    notes:       notes || null,
    status:      'pending',
  }).select().single()

  if (error) {
    // Exclusion constraint (GIST overlap) → código 23P01
    const isOverlap = error.code === '23P01' || error.message?.includes('overlap') || error.message?.includes('exclusion')
    return {
      data: null,
      error: {
        ...error,
        userMessage: isOverlap
          ? 'Este horario ya ha sido reservado por otra persona. Por favor, elige uno diferente.'
          : 'Error al crear la reserva. Intenta de nuevo.',
      },
    }
  }
  return { data, error: null }
}

// ── Dashboard: all bookings for a provider ────────────────────────
export function useDashboardBookings(providerId) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!providerId) { setLoading(false); return }
    const { data } = await supabase.from('bookings')
      .select('*')
      .eq('provider_id', providerId)
      .order('start_at', { ascending: true })
    setBookings(data ?? [])
    setLoading(false)
  }, [providerId])

  useEffect(() => { load() }, [load])
  return { bookings, loading, reload: load }
}

export async function updateBookingStatus(bookingId, status) {
  const { error } = await supabase.from('bookings')
    .update({ status })
    .eq('id', bookingId)
  return { error }
}

// ── Derived slots hook (memoized) ─────────────────────────────────
export function useAvailableSlots(providerId) {
  const { availability, loading: la } = useAvailability(providerId)
  const { bookings,     loading: lb } = useProviderBookings(providerId)

  const slots = useMemo(() => {
    if (la || lb) return []
    return generateSlots(availability, bookings)
  }, [availability, bookings, la, lb])

  const byDate = useMemo(() => {
    const map = {}
    for (const s of slots) {
      const key = s.start.toISOString().split('T')[0]
      if (!map[key]) map[key] = []
      map[key].push(s)
    }
    return map
  }, [slots])

  return { slots, byDate, hasAvailability: availability.length > 0, loading: la || lb }
}
