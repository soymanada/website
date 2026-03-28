// src/pages/ProviderPage.jsx
import { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { resolveProvider } from '../utils/providerI18n'
import { useProviderRating, useUserReview } from '../hooks/useReviews'
import { trackEvent, Events } from '../utils/analytics'
import VerificationBadge from '../components/VerificationBadge'
import PawRating from '../components/PawRating'
import ReviewModal from '../components/ReviewModal'
import Interstitial from '../components/Interstitial'
import './ProviderPage.css'

const COUNTRY_ISO = {
  'Alemania': 'de', 'Australia': 'au', 'Austria': 'at', 'Canadá': 'ca',
  'Chile': 'cl', 'Dinamarca': 'dk', 'España': 'es', 'Francia': 'fr',
  'Hungría': 'hu', 'Luxemburgo': 'lu', 'Nueva Zelanda': 'nz', 'Polonia': 'pl',
  'Portugal': 'pt', 'Corea del Sur': 'kr', 'Irlanda': 'ie', 'Islandia': 'is',
  'Japón': 'jp', 'República Checa': 'cz', 'Suecia': 'se',
}

function ReviewsList({ providerId, user, userReview, onReviewClick }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    supabase
      .from('reviews')
      .select('rating, comment, created_at')
      .eq('provider_id', providerId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setReviews(data ?? []); setLoading(false) })
  }, [providerId])

  if (loading) return null

  if (reviews.length >= 3) {
    return (
      <section className="ppage__reviews">
        <h2 className="ppage__section-title">{t('provider_page.reviews_title')}</h2>
        <div className="ppage__reviews-list">
          {reviews.map((r, i) => (
            <div key={i} className="ppage__review">
              <div className="ppage__review-header">
                <span className="ppage__review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <span className="ppage__review-date">{new Date(r.created_at).toLocaleDateString('es-CL')}</span>
              </div>
              {r.comment && <p className="ppage__review-comment t-sm">"{r.comment}"</p>}
            </div>
          ))}
        </div>
      </section>
    )
  }

  // < 3 reviews: show notice + CTA if logged in and hasn't reviewed yet
  return (
    <section className="ppage__reviews ppage__reviews--empty">
      <h2 className="ppage__section-title">{t('provider_page.reviews_title')}</h2>
      <p className="ppage__reviews-notice t-sm">{t('provider_page.reviews_min_notice')}</p>
      {user && !userReview && (
        <button className="ppage__reviews-cta" onClick={onReviewClick}>
          {t('provider_page.reviews_be_first')}
        </button>
      )}
    </section>
  )
}

export default function ProviderPage() {
  const { slug }       = useParams()
  const { user }       = useAuth()
  const { t, i18n }   = useTranslation()
  const location       = useLocation()

  const [rawProvider, setRawProvider] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)
  const [showReview,  setShowReview]  = useState(false)
  const [isConnecting,   setIsConnecting]   = useState(false)
  const [targetPlatform, setTargetPlatform] = useState('')

  useEffect(() => {
    supabase
      .from('providers')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setNotFound(true)
        else setRawProvider(data)
        setLoading(false)
      })
  }, [slug])

  const provider   = rawProvider ? resolveProvider(rawProvider, i18n.language) : null
  const providerId = rawProvider?.id ?? null
  const { avg, count, visible: ratingVisible } = useProviderRating(providerId)
  const { review: userReview, reload: reloadReview } = useUserReview(providerId, user?.id)

  // Dynamic meta title
  useEffect(() => {
    if (provider?.name) {
      document.title = t('provider_page.meta_title', { name: provider.name })
    }
    return () => { document.title = 'SoyManada' }
  }, [provider?.name, t])

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
          onClose={() => setShowReview(false)}
          onSuccess={reloadReview}
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

              <ReviewsList
                providerId={providerId}
                user={user}
                userReview={userReview}
                onReviewClick={() => setShowReview(true)}
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
                      {contact?.whatsapp && (
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

                      {/* Review button — shows user's existing review if already rated */}
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
                      ) : (
                        <button className="ppage__rate-btn" onClick={() => setShowReview(true)}>
                          {t('reviews.rate_cta')}
                        </button>
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
