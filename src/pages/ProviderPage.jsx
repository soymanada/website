// src/pages/ProviderPage.jsx
import { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { resolveProvider } from '../utils/providerI18n'
import { normalizeProvider } from '../utils/providerNormalize'
import { trackEvent, Events } from '../utils/analytics'
import { buildUtmUrl }        from '../utils/utm'
import VerificationBadge from '../components/VerificationBadge'
import PawRating from '../components/PawRating'
import MessageModal    from '../components/MessageModal'
import BookingCalendar from '../components/BookingCalendar'
import Interstitial    from '../components/Interstitial'
import './ProviderPage.css'

const COUNTRY_ISO = {
  'Alemania': 'de', 'Australia': 'au', 'Austria': 'at', 'Canadá': 'ca',
  'Chile': 'cl', 'Dinamarca': 'dk', 'España': 'es', 'Francia': 'fr',
  'Hungría': 'hu', 'Luxemburgo': 'lu', 'Nueva Zelanda': 'nz', 'Polonia': 'pl',
  'Portugal': 'pt', 'Corea del Sur': 'kr', 'Irlanda': 'ie', 'Islandia': 'is',
  'Japón': 'jp', 'República Checa': 'cz', 'Suecia': 'se',
}

// ── Sub-categorías de opinión ─────────────────────────────────────
const PAW_CATEGORIES = [
  { key: 'rating',       label: 'General' },
  { key: 'rating_comm',  label: 'Comunicación' },
  { key: 'rating_qual',  label: 'Calidad' },
  { key: 'rating_price', label: 'Precio' },
]

function PilotPaws({ value }) {
  if (!value) return <span style={{ color: 'var(--text-200)', fontSize: '0.75rem' }}>—</span>
  return (
    <span style={{ letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ opacity: n <= value ? 1 : 0.15, fontSize: 13 }}>🐾</span>
      ))}
    </span>
  )
}

// onStats: callback({ avg, count }) para alimentar el hero
function OpinionsList({ providerId, onStats }) {
  const [opinions, setOpinions] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    supabase
      .from('pilot_opinions')
      .select('id, author_name, text, rating, rating_comm, rating_qual, rating_price, created_at')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const ops = data ?? []
        setOpinions(ops)
        setLoading(false)

        // Calcular avg y notificar al padre para el PawRating del hero
        const withRating = ops.filter(o => o.rating)
        if (withRating.length > 0) {
          const avg = Math.round(
            withRating.reduce((s, o) => s + o.rating, 0) / withRating.length * 10
          ) / 10
          onStats?.({ avg, count: ops.length })
        } else {
          onStats?.({ avg: null, count: ops.length })
        }
      })
  }, [providerId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || opinions.length === 0) return null

  const withRating  = opinions.filter(o => o.rating)
  const avgGeneral  = withRating.length
    ? (withRating.reduce((s, o) => s + o.rating, 0) / withRating.length).toFixed(1)
    : null

  return (
    <section className="ppage__reviews">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
        <h2 className="ppage__section-title" style={{ margin: 0 }}>
          Experiencias de clientes
        </h2>
        {avgGeneral && (
          <span style={{ fontSize: '0.8rem', color: 'var(--iris-600)', fontWeight: 700 }}>
            🐾 {avgGeneral} · {opinions.length} {opinions.length === 1 ? 'opinión' : 'opiniones'}
          </span>
        )}
      </div>

      <div className="ppage__reviews-list">
        {opinions.map(op => {
          const cats = PAW_CATEGORIES.filter(c => op[c.key])
          return (
            <div key={op.id} className="ppage__review">
              {cats.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '4px 16px',
                  marginBottom: 10,
                }}>
                  {cats.map(c => (
                    <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-400)', minWidth: 76 }}>
                        {c.label}
                      </span>
                      <PilotPaws value={op[c.key]} />
                    </div>
                  ))}
                </div>
              )}

              {op.text && (
                <p className="ppage__review-comment t-sm">"{op.text}"</p>
              )}

              <div className="ppage__review-header" style={{ marginTop: 6 }}>
                {op.author_name && (
                  <span className="ppage__review-author">
                    {op.author_name}
                  </span>
                )}
                <span className="ppage__review-date">
                  {new Date(op.created_at).toLocaleDateString('es-CL')}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ── Página principal ──────────────────────────────────────────────
export default function ProviderPage() {
  const { slug }     = useParams()
  const { user }     = useAuth()
  const { t, i18n } = useTranslation()
  const location     = useLocation()

  const [rawProvider,    setRawProvider]    = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [notFound,       setNotFound]       = useState(false)
  const [showMsg,        setShowMsg]        = useState(false)
  const [isConnecting,   setIsConnecting]   = useState(false)
  const [targetPlatform, setTargetPlatform] = useState('')
  const [opinionStats,   setOpinionStats]   = useState({ avg: null, count: 0 })
  const [shareCopied,    setShareCopied]    = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError,   setPaymentError]   = useState(null)

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

  // Dynamic meta title + OG tags
  useEffect(() => {
    if (!provider?.name) return
    const title = `${provider.name} | SoyManada`
    const description = provider.service
      ? t('provider.og_description', { service: provider.service })
      : t('provider.og_description_empty')
    const url   = window.location.href
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
  }, [provider?.name, provider?.service, provider?.avatar_url]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleContact = (platform, url) => {
    trackEvent(Events.CONTACT_PROVIDER, {
      provider_name:     provider?.name,
      provider_category: rawProvider?.categorySlug,
      contact_type:      'external_link',
    })
    setTargetPlatform(platform === 'whatsapp' ? 'WhatsApp' : 'Instagram')
    setIsConnecting(true)
    setTimeout(() => { window.open(url, '_blank', 'noopener,noreferrer'); setIsConnecting(false) }, 1500)
  }

  const handleShare = async () => {
    const shareUrl = buildUtmUrl(`/proveedor/${slug}`, {
      source:   'share',
      medium:   'referral',
      campaign: 'provider_share',
    })
    trackEvent('share_provider', {
      provider_name:     provider?.name,
      provider_category: rawProvider?.categorySlug,
      share_url:         shareUrl,
    })
    if (navigator.share) {
      try {
        await navigator.share({
          title: provider?.name,
          text:  provider?.service ?? t('provider_page.share_text_fallback'),
          url:   shareUrl,
        })
      } catch (_) { /* usuario canceló */ }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2500)
    }
  }

  const handlePayment = async () => {
    setPaymentError(null)
    setPaymentLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('mercadopago-create-payment', {
        body: {
          provider_id:  providerId,
          amount_clp:   rawProvider.service_amount_clp,
          description:  rawProvider.service_description,
          redirect_url: window.location.href,
        },
      })
      if (error?.message?.includes('FORBIDDEN_TIER') || data?.error === 'FORBIDDEN_TIER') {
        setPaymentError('Esta función está disponible solo para proveedores Wolf. Actualiza tu plan en tu panel de cuenta.')
        return
      }
      if (error || !data?.init_point) {
        setPaymentError('No pudimos iniciar el pago en este momento. Inténtalo de nuevo en unos minutos.')
        return
      }
      window.location.href = data.init_point
    } catch {
      setPaymentError('No pudimos iniciar el pago en este momento. Inténtalo de nuevo en unos minutos.')
    } finally {
      setPaymentLoading(false)
    }
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
                  {opinionStats.avg && (
                    <PawRating rating={opinionStats.avg} count={opinionStats.count} size="md" />
                  )}
                  {verified && <VerificationBadge variant="pill" theme="light" />}
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

              {['cob', 'wolf'].includes(rawProvider?.tier) && (
                <BookingCalendar
                  providerId={providerId}
                  userId={user?.id}
                  providerName={name}
                />
              )}

              <OpinionsList
                providerId={providerId}
                onStats={setOpinionStats}
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
                      <button className="ppage__btn ppage__btn--msg" onClick={() => setShowMsg(true)}>
                        {t('messaging.cta')}
                      </button>

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

              {/* ── Cobro gestionado ── */}
              {rawProvider?.tier === 'wolf' && rawProvider?.service_amount_clp > 0 && rawProvider?.service_description && (
                <div className="ppage__payment-card">
                  <div className="ppage__payment-info">
                    <span className="t-xs" style={{ color: 'var(--text-300)' }}>Servicio</span>
                    <strong className="t-sm">{rawProvider.service_description}</strong>
                    <span className="ppage__payment-price">
                      ${rawProvider.service_amount_clp.toLocaleString('es-CL')} CLP
                    </span>
                  </div>
                  {user ? (
                    <>
                      <button
                        className="ppage__btn ppage__btn--pay"
                        onClick={handlePayment}
                        disabled={paymentLoading}
                      >
                        {paymentLoading ? 'Redirigiendo…' : '💳 Pagar este servicio'}
                      </button>
                      {paymentError && (
                        <p className="t-xs ppage__payment-error">{paymentError}</p>
                      )}
                    </>
                  ) : (
                    <Link
                      to="/login"
                      state={{ from: location }}
                      className="ppage__btn ppage__btn--pay"
                    >
                      Ingresar para pagar
                    </Link>
                  )}
                </div>
              )}

              {/* ── Compartir ── */}
              <button className="ppage__share-btn" onClick={handleShare}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                {shareCopied ? t('provider_page.share_copied') : t('provider_page.share_profile')}
              </button>
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}
