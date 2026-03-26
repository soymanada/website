// src/components/ProviderCard.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { resolveProvider } from '../utils/providerI18n'
import { trackEvent, Events } from '../utils/analytics'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import VerificationBadge from './VerificationBadge'
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
  const { user }     = useAuth()
  const { t, i18n }  = useTranslation()
  // Resuelve campos traducidos según idioma activo
  const provider = resolveProvider(rawProvider, i18n.language)
  const { id, name, service, description, countries, verified, contact, testimonial, benefit } = provider
  const location     = useLocation()
  const [isConnecting, setIsConnecting] = useState(false)
  const [targetPlatform, setTargetPlatform] = useState('')
  const viewTracked  = useRef(false)

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

  return (
    <>
      {isConnecting && <Interstitial providerName={name} platform={targetPlatform} />}
      <article className="pcard">
        <div className="pcard__accent" aria-hidden="true" />
        {verified && <VerificationBadge variant="pill" theme="light" />}
        <div className="pcard__header">
          <div className="pcard__avatar">
            <svg className="pcard__avatar-paw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
              <ellipse cx="16" cy="25" rx="8" ry="5.5"/>
              <ellipse cx="4.5" cy="15" rx="3.2" ry="4" transform="rotate(-25, 4.5, 15)"/>
              <ellipse cx="11" cy="8" rx="3.2" ry="4" transform="rotate(-10, 11, 8)"/>
              <ellipse cx="21" cy="8" rx="3.2" ry="4" transform="rotate(10, 21, 8)"/>
              <ellipse cx="27.5" cy="15" rx="3.2" ry="4" transform="rotate(25, 27.5, 15)"/>
            </svg>
            <span className="pcard__avatar-initial">{name.charAt(0)}</span>
          </div>
          <div className="pcard__meta">
            <h3 className="pcard__name">{name}</h3>
            <p className="pcard__service t-sm">{service}</p>
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
        {testimonial && (
          <div className="pcard__testimonial">
            <div className="testimonial__bubble">
              <p className="t-xs">"{testimonial.text}"</p>
              <span className="testimonial__author">— {testimonial.author}</span>
            </div>
          </div>
        )}
        {user ? (
          <div className="pcard__actions">
            {contact.whatsapp && (
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
