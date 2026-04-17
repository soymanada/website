// src/pages/ProviderPage.jsx
import { useEffect, useState } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { resolveProvider } from '../utils/providerI18n'
import { normalizeProvider } from '../utils/providerNormalize'
import {
  useProviderRating,
  useUserReview,
  useReviewReactions,
  submitProviderReply,
} from '../hooks/useReviews'
import { useVerifiedInteraction } from '../hooks/useVerifiedInteraction'
import { trackEvent, Events } from '../utils/analytics'
import VerificationBadge from '../components/VerificationBadge'
import PawRating from '../components/PawRating'
import ReviewModal      from '../components/ReviewModal'
import MessageModal     from '../components/MessageModal'
import BookingCalendar  from '../components/BookingCalendar'
import Interstitial from '../components/Interstitial'
import './ProviderPage.css'

const COUNTRY_ISO = {
  'Alemania': 'de', 'Australia': 'au', 'Austria': 'at', 'Canadá': 'ca',
  'Chile': 'cl', 'Dinamarca': 'dk', 'España': 'es', 'Francia': 'fr',
  'Hungría': 'hu', 'Luxemburgo': 'lu', 'Nueva Zelanda': 'nz', 'Polonia': 'pl',
  'Portugal': 'pt', 'Corea del Sur': 'kr', 'Irlanda': 'ie', 'Islandia': 'is',
  'Japón': 'jp', 'República Checa': 'cz', 'Suecia': 'se',
}

// ── Rating bars (Componente 2) ────────────────────────────────────
function RatingBars({ sub, recommendPct }) {
  const { t } = useTranslation()
  const rows = [
    ['speed',       t('reviews.speed_label')],
    ['reliability', t('reviews.reliability_label')],
    ['clarity',     t('reviews.clarity_label')],
    ['value',       t('reviews.value_label')],
  ].filter(([key]) => sub[key] != null)

  if (!rows.length && recommendPct == null) return null

  return (
    <div className="ppage__rating-bars">
      {rows.map(([key, label]) => (
        <div key={key} className="ppage__bar-row">
          <span className="ppage__bar-label t-xs">{label}</span>
          <div className="ppage__bar-track">
            <div className="ppage__bar-fill" style={{ width: `${(sub[key] / 5) * 100}%` }} />
          </div>
          <span className="ppage__bar-val t-xs">{sub[key].toFixed(1)}</span>
        </div>
      ))}
      {recommendPct != null && (
        <p className="ppage__recommend t-sm">
          {t('reviews.recommend_pct', { pct: recommendPct })}
        </p>
      )}
    </div>
  )
}

// ── Tarjeta de reseña individual (Componentes 3 + 4) ─────────────
function ReviewCard({ review, user, canReply, onReviewUpdate }) {
  const { t }        = useTranslation()
  const navigate     = useNavigate()
  const { count, hasReacted, toggle } = useReviewReactions(review.id, user?.id)
  const [replyText,  setReplyText]  = useState(review.provider_reply ?? '')
  const [submitting, setSubmitting] = useState(false)
  // Track if the reply was just submitted in this session
  const [localReply, setLocalReply] = useState(review.provider_reply ?? null)

  const handlePaw = () => {
    if (!user) { navigate('/login'); return }
    toggle()
  }

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return
    setSubmitting(true)
    const { error } = await submitProviderReply(review.id, replyText)
    if (!error) {
      setLocalReply(replyText.trim())
      onReviewUpdate?.()
    }
    setSubmitting(false)
  }

  return (
    <div className="ppage__review">
      <div className="ppage__review-header">
        <span className="ppage__review-stars">
          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
        </span>
        {review.verified && (
          <span className="ppage__verified-badge">
            ✓ {t('reviews.verified_badge')}
          </span>
        )}
        <span className="ppage__review-date">
          {new Date(review.created_at).toLocaleDateString('es-CL')}
        </span>
      </div>

      {review.comment && (
        <p className="ppage__review-comment t-sm">"{review.comment}"</p>
      )}

      {/* Componente 3 — reacción de huella */}
      <button
        className={`ppage__reaction${hasReacted ? ' ppage__reaction--active' : ''}`}
        onClick={handlePaw}
        title={t('reviews.reaction_tooltip')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" width="14" height="14" aria-hidden="true">
          <ellipse cx="16" cy="25" rx="8" ry="5.5"/>
          <ellipse cx="4.5" cy="15" rx="3.2" ry="4" transform="rotate(-25,4.5,15)"/>
          <ellipse cx="11" cy="8" rx="3.2" ry="4" transform="rotate(-10,11,8)"/>
          <ellipse cx="21" cy="8" rx="3.2" ry="4" transform="rotate(10,21,8)"/>
          <ellipse cx="27.5" cy="15" rx="3.2" ry="4" transform="rotate(25,27.5,15)"/>
        </svg>
        <span>{count > 0 ? count : ''}</span>
      </button>

      {/* Componente 4 — respuesta del proveedor (si existe) */}
      {localReply && (
        <div className="ppage__provider-reply">
          <span className="ppage__reply-badge t-xs">{t('reviews.provider_reply_badge')}</span>
          <p className="ppage__reply-text t-sm">{localReply}</p>
        </div>
      )}

      {/* Componente 4 — textarea de respuesta para proveedor elegible */}
      {canReply && !localReply && (
        <div className="ppage__reply-form">
          <textarea
            className="ppage__reply-textarea"
            placeholder={t('reviews.provider_reply_placeholder')}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            rows={2}
            maxLength={500}
          />
          <button
            className="ppage__reply-submit"
            onClick={handleReplySubmit}
            disabled={!replyText.trim() || submitting}
          >
            {submitting
              ? t('reviews.provider_reply_publishing')
              : t('reviews.provider_reply_submit')}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Lista de reseñas ──────────────────────────────────────────────
function ReviewsList({ providerId, user, userReview, canReply, hasInteraction, onReviewClick, onMessageClick }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  const load = () => {
    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, provider_reply, provider_reply_at, verified')
      .eq('provider_id', providerId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setReviews(data ?? []); setLoading(false) })
  }

  useEffect(() => { load() }, [providerId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return null

  if (reviews.length >= 3) {
    return (
      <section className="ppage__reviews">
        <h2 className="ppage__section-title">{t('provider_page.reviews_title')}</h2>
        <div className="ppage__reviews-list">
          {reviews.map(r => (
            <ReviewCard
              key={r.id}
              review={r}
              user={user}
              canReply={canReply}
              onReviewUpdate={load}
            />
          ))}
        </div>
      </section>
    )
  }

  // < 3 reviews
  return (
    <section className="ppage__reviews ppage__reviews--empty">
      <h2 className="ppage__section-title">{t('provider_page.reviews_title')}</h2>
      <p className="ppage__reviews-notice t-sm">{t('provider_page.reviews_min_notice')}</p>
      {user && !userReview && hasInteraction && (
        <button className="ppage__reviews-cta" onClick={onReviewClick}>
          {t('provider_page.reviews_be_first')}
        </button>
      )}
      {user && !userReview && !hasInteraction && (
        <div className="ppage__review-gate">
          <p className="ppage__review-gate-hint t-xs">{t('reviews.gate_hint')}</p>
          <button className="ppage__reviews-cta ppage__reviews-cta--muted" onClick={onMessageClick}>
            {t('reviews.gate_cta')}
          </button>
        </div>
      )}
    </section>
  )
}

// ── Página principal ──────────────────────────────────────────────
export default function ProviderPage() {
  const { slug }     = useParams()
  const { user }     = useAuth()
  const { t, i18n } = useTranslation()
  const location     = useLocation()

  const [rawProvider, setRawProvider] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)
  const [showReview,  setShowReview]  = useState(false)
  const [showMsg,     setShowMsg]     = useState(false)
  const [isConnecting,   setIsConnecting]   = useState(false)
  const [targetPlatform, setTargetPlatform] = useState('')

  useEffect(() => {
    supabase
      .from('providers')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true)
        else setRawProvider(normalizeProvider(data))
        setLoading(false)
      })
  }, [slug])

  const provider   = rawProvider ? resolveProvider(rawProvider, i18n.language) : null
  const providerId = rawProvider?.id ?? null

  const { avg, count, visible: ratingVisible, sub, recommendPct } = useProviderRating(providerId)
  const { review: userReview, reload: reloadReview } = useUserReview(providerId, user?.id)
  const { hasInteraction } = useVerifiedInteraction(providerId, user?.id)

  // Provider can reply if they own this page and have tier silver or gold
  const canReply = !!(
    user?.id &&
    rawProvider?.user_id === user.id &&
    ['silver', 'gold'].includes(rawProvider?.tier)
  )

  // Dynamic meta title + OG tags
  useEffect(() => {
    if (!provider?.name) return
    const title = `${provider.name} | SoyManada`
    const description = provider.service
      ? t('provider.og_description', { service: provider.service })
      : t('provider.og_description_empty')
    const url  = window.location.href
    const image = provider.avatar_url || 'https://soymanada.com/og-image.png'

    document.title = title

    const setMeta = (sel, val) => {
      let el = document.querySelector(sel)
      if (!el) { el = document.createElement('meta'); document.head.appendChild(el) }
      el.setAttribute(sel.includes('name=') ? 'name' : 'property', sel.match(/["']([^"']+)["']/)[1])
      el.setAttribute('content', val)
    }

    setMeta('[property="og:title"]',       title)
    setMeta('[property="og:description"]', description)
    setMeta('[property="og:url"]',         url)
    setMeta('[property="og:image"]',       image)
    setMeta('[property="og:type"]',        'profile')
    setMeta('[name="description"]',        description)

    return () => {
      document.title = 'SoyManada – Directorio para la comunidad migrante'
      const defaults = {
        '[property="og:title"]':       'SoyManada – Directorio para la comunidad migrante',
        '[property="og:description"]': 'Encuentra proveedores verificados de seguros, migración, traducciones, banca y más.',
        '[property="og:url"]':         'https://soymanada.com/',
        '[property="og:image"]':       'https://soymanada.com/og-image.png',
        '[property="og:type"]':        'website',
        '[name="description"]':        'SoyManada – El directorio de confianza para la comunidad migrante. Conecta con servicios verificados.',
      }
      Object.entries(defaults).forEach(([sel, val]) => {
        const el = document.querySelector(sel)
        if (el) el.setAttribute('content', val)
      })
    }
  }, [provider?.name, provider?.service, provider?.avatar_url])

  const handleContact = (platform, url) => {
    trackEvent(Events.CLICK_WHATSAPP, { proveedor_id: providerId, proveedor_nombre: provider?.name, plataforma: platform })
    setTargetPlatform(platform === 'whatsapp' ? 'WhatsApp' : 'Instagram')
    setIsConnecting(true)
    setTimeout(() => { window.open(url, '_blank', 'noopener,noreferrer'); setIsConnecting(false) }, 1500)
  }

  if (loading) return <main className="ppage ppage--loading"><p>{t('provider_page.loading')}</p></main>
  if (notFound) return (
    <main className="ppage ppage--notfound">
      <h1>{t('provider_page.not_found_title')}</h1>
      <Link to="/proveedores" className="btn btn-primary"><span>{t('provider_page.not_found_cta')}</span></Link>
    </main>
  )

  const { name, service, description, countries, languages, verified, contact, avatar_url, benefit } = provider

  return (
    <>
      {isConnecting && <Interstitial providerName={name} platform={targetPlatform} />}
      {showReview && (
        <ReviewModal
          provider={{ id: providerId, name }}
          userId={user?.id}
          existingReview={userReview}
          verified={hasInteraction}
          onClose={() => setShowReview(false)}
          onSuccess={reloadReview}
        />
      )}

      {showMsg && (
        <MessageModal
          providerId={providerId}
          providerName={provider?.name}
          userId={user?.id}
          onClose={() => setShowMsg(false)}
        />
      )}

      <main className="ppage">
        <div className="container">
          <nav className="ppage__breadcrumb">
            <Link to="/proveedores">{t('provider_page.back')}</Link>
          </nav>

          <div className="ppage__layout">
            {/* ── Columna principal ── */}
            <div className="ppage__main">
              <div className="ppage__hero">
                {avatar_url
                  ? <img src={avatar_url} alt={name} className="ppage__avatar" />
                  : <div className="ppage__avatar ppage__avatar--placeholder">{name?.[0]?.toUpperCase()}</div>
                }
                <div className="ppage__hero-info">
                  <h1 className="ppage__name d-lg">{name}</h1>
                  <p className="ppage__service t-md">{service}</p>
                  {ratingVisible && <PawRating rating={avg} count={count} size="md" />}
                  {verified && <VerificationBadge variant="pill" theme="dark" />}
                </div>
              </div>

              {/* Componente 2 — barras por categoría */}
              {ratingVisible && sub && (
                <RatingBars sub={sub} recommendPct={recommendPct} />
              )}

              {description && (
                <section className="ppage__section">
                  <h2 className="ppage__section-title">{t('provider_page.about_service')}</h2>
                  <p className="ppage__desc t-md">{description}</p>
                </section>
              )}

              {benefit && (
                <div className="ppage__benefit">
                  <span>🎁</span>
                  <span><strong>{t('provider_page.exclusive_benefit')}</strong> {benefit}</span>
                </div>
              )}

              {['silver', 'gold'].includes(rawProvider?.tier) && (
                <BookingCalendar
                  providerId={providerId}
                  userId={user?.id}
                  providerName={name}
                />
              )}

              <ReviewsList
                providerId={providerId}
                user={user}
                userReview={userReview}
                canReply={canReply}
                hasInteraction={hasInteraction}
                onReviewClick={() => setShowReview(true)}
                onMessageClick={() => setShowMsg(true)}
              />
            </div>

            {/* ── Sidebar de contacto ── */}
            <aside className="ppage__sidebar">
              <div className="ppage__contact-card">
                {countries?.length > 0 && (
                  <div className="ppage__meta-row">
                    <span className="ppage__meta-label">{t('provider_page.operates_in')}</span>
                    <div className="ppage__flags">
                      {countries.filter(c => COUNTRY_ISO[c]).map(c => (
                        <span key={c} className={`fi fi-${COUNTRY_ISO[c]} ppage__flag`} title={c} />
                      ))}
                      {countries.filter(c => !COUNTRY_ISO[c]).map(c => (
                        <span key={c} className="ppage__country-tag">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {languages?.length > 0 && (
                  <div className="ppage__meta-row">
                    <span className="ppage__meta-label">{t('provider_page.languages')}</span>
                    <span className="t-sm">{languages.join(' · ')}</span>
                  </div>
                )}

                <div className="ppage__contact-actions">
                  {user ? (
                    <>
                      {/* Primary CTA: internal messaging — always visible */}
                      <button className="ppage__btn ppage__btn--msg"
                        onClick={() => setShowMsg(true)}>
                        {t('messaging.cta')}
                      </button>

                      {/* WhatsApp — visible for non-bronze; explicit false hides it */}
                      {contact?.whatsapp &&
                        rawProvider?.tier !== 'bronze' &&
                        (rawProvider?.show_whatsapp ?? true) && (
                          <button className="ppage__btn ppage__btn--wa"
                            onClick={() => handleContact('whatsapp', `https://wa.me/${contact.whatsapp}`)}>
                            {t('provider_card.contact_whatsapp')}
                          </button>
                        )}

                      {contact?.instagram && (
                        <button className="ppage__btn ppage__btn--ig"
                          onClick={() => handleContact('instagram', `https://instagram.com/${contact.instagram}`)}>
                          {t('provider_card.contact_instagram')}
                        </button>
                      )}
                      {contact?.website && (
                        <a className="ppage__btn ppage__btn--web"
                          href={contact.website} target="_blank" rel="noopener noreferrer">
                          {t('provider_page.website')}
                        </a>
                      )}

                      {userReview ? (
                        <div className="ppage__your-review">
                          <p className="ppage__your-review-title t-xs">{t('provider_page.your_review_title')}</p>
                          <span className="ppage__review-stars">
                            {'★'.repeat(userReview.rating)}{'☆'.repeat(5 - userReview.rating)}
                          </span>
                          {userReview.comment && (
                            <p className="ppage__your-review-comment t-xs">"{userReview.comment}"</p>
                          )}
                        </div>
                      ) : hasInteraction ? (
                        <button className="ppage__rate-btn" onClick={() => setShowReview(true)}>
                          {t('reviews.rate_cta')}
                        </button>
                      ) : (
                        <div className="ppage__review-gate">
                          <p className="ppage__review-gate-hint t-xs">{t('reviews.gate_hint')}</p>
                          <button className="ppage__rate-btn ppage__rate-btn--muted"
                            onClick={() => setShowMsg(true)}>
                            {t('reviews.gate_cta')}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="ppage__gate">
                      <p className="t-sm">{t('provider_card.gate_text')}</p>
                      <Link to="/login" state={{ from: location }} className="ppage__btn ppage__btn--gate">
                        {t('provider_card.gate_cta')}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}
