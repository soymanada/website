// src/components/AvailabilityEditor.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAvailability, saveAvailability } from '../hooks/useBookings'
import './AvailabilityEditor.css'

const DAY_KEYS = [
  { value: 1, key: 'avail.days.mon' },
  { value: 2, key: 'avail.days.tue' },
  { value: 3, key: 'avail.days.wed' },
  { value: 4, key: 'avail.days.thu' },
  { value: 5, key: 'avail.days.fri' },
  { value: 6, key: 'avail.days.sat' },
  { value: 0, key: 'avail.days.sun' },
]
const SLOT_OPTIONS  = [30, 60, 90]
const DEFAULT_RANGE = { start: '09:00', end: '17:00', slot: 60 }

export default function AvailabilityEditor({ providerId }) {
  const { t } = useTranslation()
  const DAYS = DAY_KEYS.map(d => ({ value: d.value, label: t(d.key) }))
  const { availability, loading } = useAvailability(providerId)
  const [schedule, setSchedule] = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [err,      setErr]      = useState(null)

  useEffect(() => {
    if (loading) return
    try {
      const s = {}
      DAYS.forEach(d => {
        // DB columns are start_time / end_time (not start_at / end_at)
        const rows = availability.filter(
          a => a.day_of_week === d.value && a.start_time != null && a.end_time != null
        )
        if (rows.length) {
          s[d.value] = {
            enabled: true,
            ranges: rows.map(r => ({
              start: String(r.start_time).slice(0, 5),
              end:   String(r.end_time).slice(0, 5),
              slot:  r.slot_minutes ?? DEFAULT_RANGE.slot,
            })),
          }
        } else {
          s[d.value] = { enabled: false, ranges: [{ ...DEFAULT_RANGE }] }
        }
      })
      setSchedule(s)
    } catch (e) {
      console.warn('[AvailabilityEditor] error initializing schedule:', e)
      const empty = {}
      DAYS.forEach(d => { empty[d.value] = { enabled: false, ranges: [{ ...DEFAULT_RANGE }] } })
      setSchedule(empty)
    }
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

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
      if (ranges.length === 0) return { ...p, [dow]: { enabled: false, ranges: [{ ...DEFAULT_RANGE }] } }
      return { ...p, [dow]: { ...p[dow], ranges } }
    })

  const handleSave = async () => {
    setSaving(true); setErr(null)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Toronto'
    const slots = []
    Object.entries(schedule).forEach(([dow, day]) => {
      if (!day.enabled) return
      day.ranges.forEach(r => {
        slots.push({
          day_of_week:  Number(dow),
          start_at:     r.start,
          end_at:       r.end,
          slot_minutes: r.slot,
          timezone:     tz,
        })
      })
    })
    const { error } = await saveAvailability(providerId, slots)
    setSaving(false)
    if (error) setErr(t('avail.error_save'))
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  if (loading || !schedule) {
    return <p className="t-xs" style={{ color: 'var(--text-300)' }}>{t('avail.loading')}</p>
  }

  return (
    <div className="avail">
      <p className="t-xs avail__hint">
        {t('avail.hint')}
      </p>

      <div className="avail__grid">
        {DAYS.map(day => {
          const d = schedule[day.value]
          return (
            <div key={day.value} className={`avail__row${d.enabled ? '' : ' avail__row--off'}`}>
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
                    title={t('avail.add_range_title')}
                  >
                    {t('avail.add_range')}
                  </button>
                )}
              </div>

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
                          title={t('avail.remove_range')}>
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="avail__off t-xs">{t('avail.unavailable')}</span>
              )}
            </div>
          )
        })}
      </div>

      {err && <p className="t-xs" style={{ color: 'var(--error, #e53e3e)', marginTop: 8 }}>{err}</p>}

      <button className="btn btn-primary avail__save" onClick={handleSave} disabled={saving}>
        <span>{saving ? t('avail.saving') : saved ? t('avail.saved') : t('avail.save')}</span>
      </button>
    </div>
  )
}
