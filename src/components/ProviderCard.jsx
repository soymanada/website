// src/components/ProviderCard.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { resolveProvider } from '../utils/providerI18n'
import { trackEvent, Events } from '../utils/analytics'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useProviderRating, useUserReview } from '../hooks/useReviews'
import { useVerifiedInteraction } from '../hooks/useVerifiedInteraction'
import VerificationBadge from './VerificationBadge'
import PawRating from './PawRating'
import ReviewModal from './ReviewModal'
import MessageModal from './MessageModal'
import BookingCalendar from './BookingCalendar'
import Interstitial from './Interstitial'
import './ProviderCard.css'

const insertEvent = (provider_id, event_type) => {
  if (!provider_id) return
  supabase.from('events').insert({ provider_id, event_type }).then()
}

const COUNTRY_ISO = {
  'Alemania': 'de', 'Australia': 'au', 'Austria': 'at', 'Canadá': 'ca',
  'Chile': 'cl', 'Dinamarca': 'dk', 'España': 'es', 'Francia': 'fr',
  'Hungría': 'hu', 'Luxemburgo': 'lu', 'Nueva Zelanda': 'nz', 'Polonia': 'pl',
  'Portugal': 'pt', 'Corea del Sur': 'kr', 'Irlanda': 'ie', 'Islandia': 'is',
  'Japón': 'jp', 'República Checa': 'cz', 'Suecia': 'se',
}

export default function ProviderCard({ provider: rawProvider }) {
  const { user, isProvider } = useAuth()
  const { t, i18n } = useTranslation()

  const rawContact = rawProvider.contact ?? {}
  const contact = {
    whatsapp:  rawContact.whatsapp  || rawProvider.contact_whatsapp  || null,
    instagram: rawContact.instagram || rawProvider.contact_instagram || null,
    website:   rawContact.website   || rawProvider.contact_website   || null,
    phone:     rawContact.phone     || null,
  }

  const provider    = resolveProvider(rawProvider, i18n.language)
  const { id, slug, name, service, description, countries, verified, testimonial, benefit, price_clp, price_cad, avatar_url, categorySlug } = provider
  const location    = useLocation()
  const isMigrantUser = !!user && !isProvider
  const providerTier = String(rawProvider?.tier || 'bronze').toLowerCase()
  const isBronzeProvider = providerTier === 'bronze'
  const isSegurosCategory = categorySlug === 'seguros' || location.pathname.startsWith('/categoria/seguros')
  const hideWhatsAppForMigrant = isMigrantUser && isSegurosCategory && isBronzeProvider

  const [isConnecting,   setIsConnecting]   = useState(false)
  const [targetPlatform, setTargetPlatform] = useState('')
  const [showReview,     setShowReview]     = useState(false)
  const [showMsg,        setShowMsg]        = useState(false)
  const [showBooking,    setShowBooking]    = useState(false)
  const viewTracked = useRef(false)

  const { avg, count, visible: ratingVisible } = useProviderRating(id)
  const { review: userReview, reload: reloadReview } = useUserReview(id, user?.id)
  const { hasInteraction } = useVerifiedInteraction(id, user?.id)

  useEffect(() => {
    if (!viewTracked.current && id) {
      viewTracked.current = true
      insertEvent(id, 'view')
    }
  }, [id])

  const handleContact = (platform, url) => {
    insertEvent(id, 'contact_click')
    trackEvent(Events.PROVEEDOR_VISITADO, { proveedor_id: id, proveedor_nombre: name })
    trackEvent(Events.CLICK_WHATSAPP, { proveedor_id: id, proveedor_nombre: name, plataforma: platform })
    setTargetPlatform(platform === 'whatsapp' ? 'WhatsApp' : 'Instagram')
    setIsConnecting(true)
    setTimeout(() => { window.open(url, '_blank', 'noopener,noreferrer'); setIsConnecting(false) }, 1500)
  }

  const handleBookingOpen = () => {
    insertEvent(id, 'booking_click')
    trackEvent(Events.PROVEEDOR_VISITADO, { proveedor_id: id, proveedor_nombre: name, plataforma: 'booking' })
    setShowBooking(true)
  }

  return (
    <>
      {isConnecting && <Interstitial providerName={name} platform={targetPlatform} />}
      {showReview && (
        <ReviewModal
          provider={{ id, name }}
          userId={user?.id}
          existingReview={userReview}
          verified={hasInteraction}
          onClose={() => setShowReview(false)}
          onSuccess={reloadReview}
        />
      )}
      {showMsg && (
        <MessageModal
          providerId={id}
          providerName={name}
          userId={user?.id}
          onClose={() => setShowMsg(false)}
        />
      )}

      {/* Modal de agendamiento */}
      {showBooking && (
        <div className="pcard__booking-overlay" role="dialog" aria-modal="true" aria-label={`Agendar llamada con ${name}`}>
          <div className="pcard__booking-modal">
            <button
              className="pcard__booking-close"
              onClick={() => setShowBooking(false)}
              aria-label="Cerrar"
            >
              ✕
            </button>
            <p className="pcard__booking-provider t-sm">
              <strong>{name}</strong>
            </p>
            <BookingCalendar
              providerId={id}
              userId={user?.id}
              providerName={name}
            />
          </div>
        </div>
      )}

      <article className="pcard">
        <div className="pcard__accent" aria-hidden="true" />
        <svg className="pcard__bg-paw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
          <ellipse cx="16" cy="25" rx="8" ry="5.5"/>
          <ellipse cx="4.5" cy="15" rx="3.2" ry="4" transform="rotate(-25, 4.5, 15)"/>
          <ellipse cx="11" cy="8" rx="3.2" ry="4" transform="rotate(-10, 11, 8)"/>
          <ellipse cx="21" cy="8" rx="3.2" ry="4" transform="rotate(10, 21, 8)"/>
          <ellipse cx="27.5" cy="15" rx="3.2" ry="4" transform="rotate(25, 27.5, 15)"/>
        </svg>
        {verified && <VerificationBadge variant="pill" theme="light" />}

        <div className="pcard__header">
          {avatar_url && (
            <img src={avatar_url} alt={name} className="pcard__avatar" />
          )}
          <div className="pcard__meta">
            <h3 className="pcard__name">{name}</h3>
            <p className="pcard__service t-sm">{service}</p>
            {ratingVisible && (
              <PawRating rating={avg} count={count} size="sm" />
            )}
          </div>
        </div>

        {benefit && (
          <div className="pcard__benefit">
            <span className="pcard__benefit-icon">🎁</span>
            <span className="t-xs"><strong>{t('provider_card.exclusive_benefit')}</strong> {benefit}</span>
          </div>
        )}

        {countries?.length > 0 && (
          <div className="pcard__countries">
            {countries.filter(c => COUNTRY_ISO[c]).map(c => (
              <span key={c} className={`fi fi-${COUNTRY_ISO[c]} pcard__flag`} title={c} />
            ))}
          </div>
        )}

        <p className="pcard__desc t-sm">{description}</p>

        {(price_clp || price_cad) && (
          <div className="pcard__prices">
            {price_clp && (
              <span className="pcard__price">
                <span className="pcard__price-label">CLP</span>
                <span className="pcard__price-value">${Number(price_clp).toLocaleString('es-CL')}</span>
              </span>
            )}
            {price_cad && (
              <span className="pcard__price">
                <span className="pcard__price-label">CAD</span>
                <span className="pcard__price-value">${Number(price_cad).toLocaleString('en-CA')}</span>
              </span>
            )}
          </div>
        )}

        {testimonial && (
          <div className="pcard__testimonial">
            <div className="testimonial__bubble">
              <p className="t-xs">"{testimonial.text}"</p>
              <span className="testimonial__author">— {testimonial.author}</span>
            </div>
          </div>
        )}

        <Link to={`/proveedor/${slug}`} className="pcard__profile-link">
          {categorySlug === 'remesas'
            ? t('provider_card.profile_link_remesas')
            : t('provider_card.profile_link')}
        </Link>

        {user ? (
          <>
            <div className="pcard__actions">
              <button className="pcard__btn pcard__btn--msg" onClick={() => setShowMsg(true)}>
                {t('messaging.cta')}
              </button>
              {contact.whatsapp && !hideWhatsAppForMigrant && (
                <button className="pcard__btn pcard__btn--wa"
                  onClick={() => handleContact('whatsapp', `https://wa.me/${contact.whatsapp}`)}>
                  {t('provider_card.contact_whatsapp')}
                </button>
              )}
              {contact.phone && (
                <a className="pcard__btn pcard__btn--phone" href={`tel:+${contact.phone}`}
                  onClick={() => trackEvent(Events.PROVEEDOR_VISITADO, { proveedor_id: id, proveedor_nombre: name, plataforma: 'phone' })}>
                  {t('provider_card.contact_phone')}
                </a>
              )}
              {contact.instagram && (
                <button className="pcard__btn pcard__btn--ig"
                  onClick={() => handleContact('instagram', `https://instagram.com/${contact.instagram}`)}>
                  {t('provider_card.contact_instagram')}
                </button>
              )}
            </div>

            {/* Botón Agendar llamada — solo si el proveedor tiene availability */}
            <BookingCalendarTrigger
              providerId={id}
              onOpen={handleBookingOpen}
              t={t}
            />

            {userReview ? (
              <button className="pcard__rate-btn pcard__rate-btn--done" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" width="12" height="12" aria-hidden="true">
                  <ellipse cx="16" cy="25" rx="8" ry="5.5"/>
                  <ellipse cx="4.5" cy="15" rx="3.2" ry="4" transform="rotate(-25,4.5,15)"/>
                  <ellipse cx="11" cy="8" rx="3.2" ry="4" transform="rotate(-10,11,8)"/>
                  <ellipse cx="21" cy="8" rx="3.2" ry="4" transform="rotate(10,21,8)"/>
                  <ellipse cx="27.5" cy="15" rx="3.2" ry="4" transform="rotate(25,27.5,15)"/>
                </svg>
                {t('reviews.already_rated')}
              </button>
            ) : hasInteraction ? (
              <button className="pcard__rate-btn" onClick={() => setShowReview(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" width="12" height="12" aria-hidden="true">
                  <ellipse cx="16" cy="25" rx="8" ry="5.5"/>
                  <ellipse cx="4.5" cy="15" rx="3.2" ry="4" transform="rotate(-25,4.5,15)"/>
                  <ellipse cx="11" cy="8" rx="3.2" ry="4" transform="rotate(-10,11,8)"/>
                  <ellipse cx="21" cy="8" rx="3.2" ry="4" transform="rotate(10,21,8)"/>
                  <ellipse cx="27.5" cy="15" rx="3.2" ry="4" transform="rotate(25,27.5,15)"/>
                </svg>
                {t('reviews.rate_cta')}
              </button>
            ) : (
              <button className="pcard__rate-btn pcard__rate-btn--gate" onClick={() => setShowMsg(true)}>
                {t('reviews.gate_hint_short')}
              </button>
            )}
          </>
        ) : (
          <div className="pcard__gate">
            <p className="pcard__gate-text t-xs">{t('provider_card.gate_text')}</p>
            <Link to="/login" state={{ from: location }} className="pcard__gate-btn"
              onClick={() => trackEvent(Events.GATE_CLICK, { proveedor_id: id, proveedor_nombre: name, categoria: provider.categorySlug })}>
              {t('provider_card.gate_cta')}
            </Link>
          </div>
        )}
      </article>
    </>
  )
}

// Sub-componente: solo renderiza el botón si el proveedor tiene availability activa
import { useAvailableSlots } from '../hooks/useBookings'

function BookingCalendarTrigger({ providerId, onOpen, t }) {
  const { hasAvailability, loading } = useAvailableSlots(providerId)
  if (loading || !hasAvailability) return null
  return (
    <button className="pcard__btn pcard__btn--book" onClick={onOpen}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      {t('booking.cta', 'Agendar llamada')}
    </button>
  )
}
