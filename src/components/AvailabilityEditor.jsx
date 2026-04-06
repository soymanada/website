// src/components/AvailabilityEditor.jsx
import { useState, useEffect } from 'react'
import { useAvailability, saveAvailability } from '../hooks/useBookings'
import './AvailabilityEditor.css'

const DAYS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
]
const SLOT_OPTIONS  = [30, 60, 90]
const DEFAULT_RANGE = { start: '09:00', end: '17:00', slot: 60 }

// schedule shape: { [dow]: { enabled: bool, ranges: [{start, end, slot}] } }

export default function AvailabilityEditor({ providerId }) {
  const { availability, loading } = useAvailability(providerId)
  const [schedule, setSchedule] = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [err,      setErr]      = useState(null)

  // Initialize from DB once loaded
  useEffect(() => {
    if (loading) return
    const s = {}
    DAYS.forEach(d => {
      const rows = availability.filter(a => a.day_of_week === d.value)
      if (rows.length) {
        s[d.value] = {
          enabled: true,
          ranges: rows.map(r => ({
            start: r.start_at.slice(0, 5),
            end:   r.end_at.slice(0, 5),
            slot:  r.slot_minutes,
          })),
        }
      } else {
        s[d.value] = { enabled: false, ranges: [{ ...DEFAULT_RANGE }] }
      }
    })
    setSchedule(s)
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ──────────────────────────────────────────────────────
  const toggleDay = (dow, enabled) =>
    setSchedule(p => ({ ...p, [dow]: { ...p[dow], enabled } }))

  const updateRange = (dow, idx, key, val) =>
    setSchedule(p => {
      const ranges = p[dow].ranges.map((r, i) => i === idx ? { ...r, [key]: val } : r)
      return { ...p, [dow]: { ...p[dow], ranges } }
    })

  const addRange = (dow) =>
    setSchedule(p => ({
      ...p,
      [dow]: { ...p[dow], ranges: [...p[dow].ranges, { ...DEFAULT_RANGE }] },
    }))

  const removeRange = (dow, idx) =>
    setSchedule(p => {
      const ranges = p[dow].ranges.filter((_, i) => i !== idx)
      // Keep at least one range (but disable the day if user removes the last)
      if (ranges.length === 0) return { ...p, [dow]: { enabled: false, ranges: [{ ...DEFAULT_RANGE }] } }
      return { ...p, [dow]: { ...p[dow], ranges } }
    })

  // ── Save ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setErr(null)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Toronto'
    const slots = []
    Object.entries(schedule).forEach(([dow, day]) => {
      if (!day.enabled) return
      day.ranges.forEach(r => {
        slots.push({
          day_of_week:  Number(dow),
          start_at:   r.start,
          end_at:     r.end,
          slot_minutes: r.slot,
          timezone:     tz,
        })
      })
    })
    const { error } = await saveAvailability(providerId, slots)
    setSaving(false)
    if (error) setErr('Error al guardar. Intenta de nuevo.')
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  // ── Render ────────────────────────────────────────────────────────
  if (loading || !schedule) {
    return <p className="t-xs" style={{ color: 'var(--text-300)' }}>Cargando disponibilidad…</p>
  }

  return (
    <div className="avail">
      <p className="t-xs avail__hint">
        Activa días y define uno o varios bloques horarios. Puedes añadir rangos separados
        para el mismo día (p. ej. 8–10, 12–15, 17–19).
      </p>

      <div className="avail__grid">
        {DAYS.map(day => {
          const d = schedule[day.value]
          return (
            <div key={day.value} className={`avail__row${d.enabled ? '' : ' avail__row--off'}`}>
              {/* Day toggle */}
              <div className="avail__day-header">
                <label className="avail__toggle">
                  <input type="checkbox" checked={d.enabled}
                    onChange={e => toggleDay(day.value, e.target.checked)} />
                  <span className="avail__day">{day.label}</span>
                </label>
                {d.enabled && (
                  <button
                    type="button"
                    className="avail__add-range"
                    onClick={() => addRange(day.value)}
                    title="Añadir otro rango horario"
                  >
                    + rango
                  </button>
                )}
              </div>

              {/* Time ranges */}
              {d.enabled ? (
                <div className="avail__ranges">
                  {d.ranges.map((r, i) => (
                    <div key={i} className="avail__range">
                      <input type="time" className="avail__time" value={r.start}
                        onChange={e => updateRange(day.value, i, 'start', e.target.value)} />
                      <span className="avail__dash">–</span>
                      <input type="time" className="avail__time" value={r.end}
                        onChange={e => updateRange(day.value, i, 'end', e.target.value)} />
                      <select className="avail__dur" value={r.slot}
                        onChange={e => updateRange(day.value, i, 'slot', Number(e.target.value))}>
                        {SLOT_OPTIONS.map(o => (
                          <option key={o} value={o}>{o} min</option>
                        ))}
                      </select>
                      {d.ranges.length > 1 && (
                        <button type="button" className="avail__remove-range"
                          onClick={() => removeRange(day.value, i)}
                          title="Eliminar este rango">
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="avail__off t-xs">No disponible</span>
              )}
            </div>
          )
        })}
      </div>

      {err && <p className="t-xs" style={{ color: 'var(--error, #e53e3e)', marginTop: 8 }}>{err}</p>}

      <button className="btn btn-primary avail__save" onClick={handleSave} disabled={saving}>
        <span>{saving ? 'Guardando…' : saved ? '✓ Disponibilidad guardada' : 'Guardar disponibilidad'}</span>
      </button>
    </div>
  )
}
