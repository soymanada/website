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
const SLOT_OPTIONS = [30, 60, 90]
const DEFAULT_ROW  = { enabled: false, start: '09:00', end: '17:00', slot: 60 }

export default function AvailabilityEditor({ providerId }) {
  const { availability, loading } = useAvailability(providerId)
  const [schedule, setSchedule] = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [err,      setErr]      = useState(null)

  // Initialize once data arrives
  useEffect(() => {
    if (!loading) {
      const s = {}
      DAYS.forEach(d => {
        const a = availability.find(x => x.day_of_week === d.value)
        s[d.value] = a
          ? { enabled: true, start: a.start_time.slice(0, 5), end: a.end_time.slice(0, 5), slot: a.slot_minutes }
          : { ...DEFAULT_ROW }
      })
      setSchedule(s)
    }
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (dow, key, val) =>
    setSchedule(prev => ({ ...prev, [dow]: { ...prev[dow], [key]: val } }))

  const handleSave = async () => {
    setSaving(true); setErr(null)
    const slots = Object.entries(schedule)
      .filter(([, v]) => v.enabled)
      .map(([dow, v]) => ({
        day_of_week:  Number(dow),
        start_time:   v.start,
        end_time:     v.end,
        slot_minutes: v.slot,
        timezone:     Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Toronto',
      }))
    const { error } = await saveAvailability(providerId, slots)
    setSaving(false)
    if (error) setErr('Error al guardar. Intenta de nuevo.')
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  if (loading || !schedule) {
    return <p className="t-xs" style={{ color: 'var(--text-300)' }}>Cargando disponibilidad…</p>
  }

  return (
    <div className="avail">
      <p className="t-xs avail__hint">
        Activa los días y define el rango horario. Los migrantes verán los slots disponibles en tu perfil y podrán reservar directamente.
      </p>

      <div className="avail__grid">
        {DAYS.map(day => {
          const row = schedule[day.value]
          return (
            <div key={day.value} className={`avail__row${row.enabled ? '' : ' avail__row--off'}`}>
              <label className="avail__toggle">
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={e => set(day.value, 'enabled', e.target.checked)}
                />
                <span className="avail__day">{day.label}</span>
              </label>

              {row.enabled ? (
                <div className="avail__times">
                  <input type="time" className="avail__time" value={row.start}
                    onChange={e => set(day.value, 'start', e.target.value)} />
                  <span className="avail__dash">–</span>
                  <input type="time" className="avail__time" value={row.end}
                    onChange={e => set(day.value, 'end', e.target.value)} />
                  <select className="avail__dur" value={row.slot}
                    onChange={e => set(day.value, 'slot', Number(e.target.value))}>
                    {SLOT_OPTIONS.map(o => (
                      <option key={o} value={o}>{o} min</option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="avail__off t-xs">No disponible</span>
              )}
            </div>
          )
        })}
      </div>

      {err && <p className="t-xs" style={{ color: 'var(--error, #e53e3e)', marginTop: 8 }}>{err}</p>}

      <button
        className="btn btn-primary avail__save"
        onClick={handleSave}
        disabled={saving}
      >
        <span>{saving ? 'Guardando…' : saved ? '✓ Disponibilidad guardada' : 'Guardar disponibilidad'}</span>
      </button>
    </div>
  )
}
