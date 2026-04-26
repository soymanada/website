// src/pages/PricingPage.jsx — Planes para proveedores
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { trackEvent, Events } from '../utils/analytics'
import './PricingPage.css'
// eslint-disable-next-line no-unused-vars
import { PROVIDER_PLANS } from '../config/providerPlans'

const CHECK = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="7" fill="var(--iris-100)"/>
    <path d="M5 8l2.5 2.5 4-4" stroke="var(--iris-600)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const FAQS = ['faq1', 'faq2', 'faq3', 'faq4']

export default function PricingPage() {
  const { t } = useTranslation()
  const [openFaq, setOpenFaq] = useState(null)

  useEffect(() => {
    document.title = 'Planes y precios | SoyManada'
    return () => { document.title = 'SoyManada – Directorio para la comunidad migrante' }
  }, [])

  const tiers = [
    {
      key: 'bronze',
      icon: '✨',
      price: t('pricing_page.free'),
      priceLocal: null,
      highlight: false,
      badge: null,
      ctaKey: 'cta_wonderer',
      ctaTo: '/registro-proveedores',
      features: [
        'feature_profile',
        'feature_1_cat',
        'feature_contact_gate',
        'feature_verified_criteria',
      ],
    },
    {
      key: 'silver',
      icon: '🐾',
      price: '$5 USD',
      priceLocal: '$4.990 CLP',
      highlight: true,
      badge: t('pricing_page.badge_popular'),
      ctaKey: 'cta_cub',
      ctaTo: '/registro-proveedores',
      features: [
        'feature_profile',
        'feature_2_cat',
        'feature_contact_gate',
        'feature_verified_auto',
        'feature_priority',
        'feature_analytics_basic',
        'feature_replies',
        'feature_calendar',
        'feature_support_email',
      ],
    },
    {
      key: 'gold',
      icon: '🐺',
      price: '$10 USD',
      priceLocal: '$9.990 CLP',
      highlight: false,
      badge: t('pricing_page.badge_premium'),
      ctaKey: 'cta_wolf',
      ctaTo: '/registro-proveedores',
      features: [
        'feature_profile',
        'feature_all_cat',
        'feature_contact_gate',
        'feature_verified_auto',
        'feature_top3',
        'feature_analytics_full',
        'feature_benefit',
        'feature_replies',
        'feature_calendar',
        'feature_tools_adv',
        'feature_support_priority',
      ],
    },
  ]

  return (
    <main className="pricing">

      {/* Hero */}
      <div className="pricing__hero">
        <div className="pricing__hero-orb" aria-hidden="true" />
        <div className="container">
          <div className="eyebrow anim-fade-up">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" width="13" height="13" aria-hidden="true">
              <polygon points="2,13 30,16 2,2"/>
              <polygon points="2,19 30,16 2,30"/>
            </svg>
            {t('pricing_page.eyebrow')}
          </div>
          <h1 className="d-2xl pricing__title anim-fade-up delay-1">
            {t('pricing_page.title')}<br />
            <em className="pricing__title-em">{t('pricing_page.title_em')}</em>
          </h1>
          <p className="t-lg pricing__sub anim-fade-up delay-2">{t('pricing_page.subtitle')}</p>
        </div>
      </div>

      {/* Tiers */}
      <section className="pricing__tiers section">
        <div className="container">
          <div className="pricing__grid">
            {tiers.map(tier => (
              <div
                key={tier.key}
                className={`ptier${tier.highlight ? ' ptier--highlight' : ''}`}
              >
                {tier.badge && (
                  <div className={`ptier__badge ptier__badge--${tier.key}`}>{tier.badge}</div>
                )}
                <div className="ptier__top">
                  <span className="ptier__icon">{tier.icon}</span>
                  <h2 className="ptier__name">{t(`pricing_page.${tier.key}_name`)}</h2>
                  <p className="ptier__desc t-sm">{t(`pricing_page.${tier.key}_desc`)}</p>
                </div>
                <div className="ptier__price-block">
                  <span className="ptier__price">{tier.price}</span>
                  {tier.price !== t('pricing_page.free') && (
                    <span className="ptier__period">{t('pricing_page.per_month')}</span>
                  )}
                  {tier.priceLocal && (
                    <span className="ptier__price-local">{tier.priceLocal} / mes (Chile)</span>
                  )}
                </div>
                <ul className="ptier__features">
                  {tier.features.map(f => (
                    <li key={f} className="ptier__feature">
                      {CHECK}
                      <span>{t(`pricing_page.${f}`)}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={tier.ctaTo}
                  className={`btn ${tier.highlight ? 'btn-primary' : 'btn-secondary'} btn-full ptier__cta`}
                  onClick={() => trackEvent(Events.CLICK_APPLY_PROVIDER, { from: `pricing_${tier.key}` })}
                >
                  <span>{t(`pricing_page.${tier.ctaKey}`)}</span>
                </Link>
              </div>
            ))}
          </div>

          <p className="pricing__note t-xs">{t('pricing_page.note')}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="pricing__faq section">
        <div className="container">
          <h2 className="d-lg pricing__faq-title">{t('pricing_page.faq_title')}</h2>
          <div className="pricing__faq-list">
            {FAQS.map(faq => (
              <div
                key={faq}
                className={`pfaq${openFaq === faq ? ' pfaq--open' : ''}`}
              >
                <button
                  className="pfaq__q"
                  onClick={() => setOpenFaq(openFaq === faq ? null : faq)}
                  aria-expanded={openFaq === faq}
                >
                  <span>{t(`pricing_page.${faq}_q`)}</span>
                  <svg className="pfaq__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="pfaq__a">
                  <p className="t-sm">{t(`pricing_page.${faq}_a`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="pricing__bottom section">
        <div className="container">
          <div className="pricing__bottom-inner">
            <h2 className="d-lg">{t('pricing_page.bottom_title')}</h2>
            <p className="t-lg" style={{ color: 'var(--text-500)' }}>{t('pricing_page.bottom_body')}</p>
            <Link
              to="/registro-proveedores"
              className="btn btn-primary btn-lg"
              onClick={() => trackEvent(Events.CLICK_APPLY_PROVIDER, { from: 'pricing_bottom' })}
            >
              <span>{t('pricing_page.bottom_cta')}</span>
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
