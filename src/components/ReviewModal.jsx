// src/components/ReviewModal.jsx — modal para dejar una evaluación
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import PawRating from './PawRating'
import { submitReview } from '../hooks/useReviews'
import './ReviewModal.css'

const SUB_FIELDS = [
  { key: 'speed',       labelKey: 'reviews.speed_label' },
  { key: 'reliability', labelKey: 'reviews.reliability_label' },
  { key: 'clarity',     labelKey: 'reviews.clarity_label' },
  { key: 'value',       labelKey: 'reviews.value_label' },
]

const EMPTY_SUB = { speed: 0, reliability: 0, clarity: 0, value: 0 }

export default function ReviewModal({ provider, userId, existingReview, verified, onClose, onSuccess }) {
  const { t } = useTranslation()
  const [rating,  setRating]  = useState(existingReview?.rating  ?? 0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState(existingReview?.comment ?? '')
  const [sub,     setSub]     = useState({
    speed:       existingReview?.rating_speed        ?? 0,
    reliability: existingReview?.rating_reliability  ?? 0,
    clarity:     existingReview?.rating_clarity      ?? 0,
    value:       existingReview?.rating_value        ?? 0,
  })
  const [subHov, setSubHov] = useState(EMPTY_SUB)
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  // Cerrar con Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const setSR  = (key, val) => setSub(prev => ({ ...prev, [key]: val }))
  const setHov = (key, val) => setSubHov(prev => ({ ...prev, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) return
    setStatus('loading')
    const { error } = await submitReview({
      providerId:        provider.id,
      userId,
      rating,
      comment,
      ratingSpeed:       sub.speed       || null,
      ratingReliability: sub.reliability || null,
      ratingClarity:     sub.clarity     || null,
      ratingValue:       sub.value       || null,
      verified:          !!verified,
    })
    if (error) { setStatus('error'); return }
    setStatus('success')
    setTimeout(() => { onSuccess?.(); onClose() }, 1400)
  }

  return (
    <div className="rmodal__overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rmodal" role="dialog" aria-modal="true">
        <button className="rmodal__close" onClick={onClose} aria-label={t('reviews.close')}>✕</button>

        <div className="rmodal__header">
          <div className="rmodal__provider-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" width="20" height="20" aria-hidden="true">
              <ellipse cx="16" cy="25" rx="8" ry="5.5"/>
              <ellipse cx="4.5" cy="15" rx="3.2" ry="4" transform="rotate(-25,4.5,15)"/>
              <ellipse cx="11" cy="8" rx="3.2" ry="4" transform="rotate(-10,11,8)"/>
              <ellipse cx="21" cy="8" rx="3.2" ry="4" transform="rotate(10,21,8)"/>
              <ellipse cx="27.5" cy="15" rx="3.2" ry="4" transform="rotate(25,27.5,15)"/>
            </svg>
          </div>
          <div>
            <h2 className="rmodal__title">{t('reviews.modal_title')}</h2>
            <p className="rmodal__provider-name t-sm">{provider.name}</p>
            {verified && (
              <span className="rmodal__verified-badge">
                ✓ {t('reviews.verified_client')}
              </span>
            )}
          </div>
        </div>

        {status === 'success' ? (
          <div className="rmodal__success">
            <span className="rmodal__success-icon">🐾</span>
            <p className="t-lg">{t('reviews.success')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rmodal__form">
            {/* Puntuación general — requerida */}
            <div className="rmodal__field">
              <label className="rmodal__label">{t('reviews.rating_label')}</label>
              <PawRating
                rating={hovered || rating}
                size="md"
                interactive
                hovered={hovered || rating}
                onSelect={setRating}
                onHover={setHovered}
                onLeave={() => setHovered(0)}
              />
              {!rating && <span className="rmodal__hint t-xs">{t('reviews.rating_hint')}</span>}
            </div>

            {/* Sub-categorías — opcionales */}
            <div className="rmodal__field">
              <div className="rmodal__sub-header">
                <span className="rmodal__label">{t('reviews.subcategories_hint')}</span>
              </div>
              <div className="rmodal__sub-list">
                {SUB_FIELDS.map(({ key, labelKey }) => (
                  <div key={key} className="rmodal__sub-row">
                    <span className="rmodal__sub-label t-xs">{t(labelKey)}</span>
                    <PawRating
                      rating={subHov[key] || sub[key]}
                      size="sm"
                      interactive
                      hovered={subHov[key] || sub[key]}
                      onSelect={(n) => setSR(key, n)}
                      onHover={(n)  => setHov(key, n)}
                      onLeave={() => setHov(key, 0)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Comentario */}
            <div className="rmodal__field">
              <label className="rmodal__label" htmlFor="review-comment">
                {t('reviews.comment_label')}
              </label>
              <textarea
                id="review-comment"
                className="rmodal__textarea"
                placeholder={t('reviews.comment_placeholder')}
                value={comment}
                onChange={e => setComment(e.target.value)}
                maxLength={300}
                rows={3}
              />
              <span className="rmodal__char-count t-xs">{comment.length}/300</span>
            </div>

            {status === 'error' && (
              <p className="rmodal__error t-sm">{t('reviews.error')}</p>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={!rating || status === 'loading'}
            >
              <span>{status === 'loading' ? t('reviews.submitting') : t('reviews.submit')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
