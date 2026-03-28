// src/hooks/useBookings.js
import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'

// ── Provider: load / save availability ───────────────────────────
export function useAvailability(providerId) {
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!providerId) { setLoading(false); return }
    const { data } = await supabase
      .from('provider_availability')
      .select('*')
      .eq('provider_id', providerId)
      .eq('active', true)
    setAvailability(data ?? [])
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

// ── Generate free slots for next N days ──────────────────────────
export function generateSlots(availability, takenBookings, daysAhead = 14) {
  const slots = []
  const now = new Date()

  for (let d = 1; d <= daysAhead; d++) {
    const date = new Date()
    date.setDate(now.getDate() + d)
    date.setHours(0, 0, 0, 0)

    const dow = date.getDay()
    const dayAvail = availability.filter(a => a.day_of_week === dow)

    for (const avail of dayAvail) {
      const [sh, sm] = avail.start_time.slice(0, 5).split(':').map(Number)
      const [eh, em] = avail.end_time.slice(0, 5).split(':').map(Number)
      const startM = sh * 60 + sm
      const endM   = eh * 60 + em
      const dur    = avail.slot_minutes

      for (let m = startM; m + dur <= endM; m += dur) {
        const slotStart = new Date(date)
        slotStart.setHours(Math.floor(m / 60), m % 60, 0, 0)
        const slotEnd = new Date(slotStart)
        slotEnd.setMinutes(slotEnd.getMinutes() + dur)

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
  return { data, error }
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
