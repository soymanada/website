// src/components/BookingCalendar.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useAvailableSlots, createBooking } from '../hooks/useBookings'
import './BookingCalendar.css'

const fmtDate = (date) =>
  date.toLocaleDateString('es-CL', { weekday: 'short', month: 'short', day: 'numeric' })

const fmtTime = (date) =>
  date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })

const fmtDateKey = (dk) =>
  new Date(dk + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'short', month: 'short', day: 'numeric' })

export default function BookingCalendar({ providerId, userId, providerName }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const migrantName = user?.user_metadata?.full_name ?? user?.email ?? null
  const { byDate, hasAvailability, loading } = useAvailableSlots(providerId)

  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [notes,        setNotes]        = useState('')
  const [status,       setStatus]       = useState('idle') // idle | submitting | success | error
  const [errorMsg,     setErrorMsg]     = useState('')

  if (loading) return (
    <div className="bcal bcal--loading" aria-label="Cargando calendario">
      <div className="bcal__spinner" />
    </div>
  )

  if (!hasAvailability) return null

  const dates = Object.keys(byDate).sort()

  const handleDateClick = (dk) => { setSelectedDate(dk); setSelectedSlot(null) }
  const handleSlotClick = (slot) => { setSelectedSlot(slot); setStatus('idle') }

  const handleBook = async () => {
    if (!selectedSlot || !userId) return
    setStatus('submitting')
    const { error } = await createBooking({
      providerId,
      userId,
      start: selectedSlot.start,
      end:   selectedSlot.end,
      notes,
      providerName,
      migrantName,
    })
    if (error) {
      const isOverlap = error.code === '23P01' || error.message?.includes('overlap') || error.message?.includes('exclusion')
      setErrorMsg(isOverlap ? t('booking.error_overlap') : t('booking.error_generic'))
      setStatus('error')
    } else {
      setStatus('success')
    }
  }

  if (status === 'success') return (
    <div className="bcal bcal--success">
      <span className="bcal__success-icon">✅</span>
      <div>
        <strong className="t-sm">{t('booking.success_title')}</strong>
        <p className="t-xs bcal__success-sub">{t('booking.success_sub', { name: providerName })}</p>
      </div>
    </div>
  )

  return (
    <section className="bcal">
      <h3 className="bcal__title">{t('booking.title')}</h3>

      {dates.length === 0 ? (
        <p className="t-sm bcal__empty">{t('booking.no_slots')}</p>
      ) : (
        <>
          <div className="bcal__dates" role="list">
            {dates.map(dk => (
              <button
                key={dk}
                role="listitem"
                className={`bcal__date-btn${selectedDate === dk ? ' bcal__date-btn--active' : ''}`}
                onClick={() => handleDateClick(dk)}
              >
                {fmtDateKey(dk)}
              </button>
            ))}
          </div>

          {selectedDate && (
            <div className="bcal__slots">
              {byDate[selectedDate].map((slot, i) => (
                <button
                  key={i}
                  className={`bcal__slot${selectedSlot === slot ? ' bcal__slot--active' : ''}`}
                  onClick={() => handleSlotClick(slot)}
                >
                  {fmtTime(slot.start)}
                </button>
              ))}
            </div>
          )}

          {selectedSlot && (
            <div className="bcal__form">
              <p className="bcal__selected-info t-sm">
                <strong>
                  {fmtDate(selectedSlot.start)} · {fmtTime(selectedSlot.start)}–{fmtTime(selectedSlot.end)}
                </strong>
              </p>

              {!userId ? (
                <p className="t-xs bcal__auth-notice">{t('booking.login_notice')}</p>
              ) : (
                <>
                  <textarea
                    className="bcal__notes"
                    placeholder={t('booking.notes_placeholder')}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                  />
                  {status === 'error' && (
                    <p className="t-xs bcal__error">{errorMsg}</p>
                  )}
                  <button
                    className="btn btn-primary bcal__confirm"
                    onClick={handleBook}
                    disabled={status === 'submitting'}
                  >
                    <span>{status === 'submitting' ? t('booking.sending') : t('booking.confirm')}</span>
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}
