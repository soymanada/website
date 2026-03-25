import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { trackEvent, Events } from '../utils/analytics'
import './CTASection.css'

export default function CTASection() {
  const { t } = useTranslation()
  const perks = [t('cta_section.perk1'), t('cta_section.perk2'), t('cta_section.perk3')]
  return (
    <section className="cta-sec section">
      <div className="cta-sec__bg-orb" aria-hidden="true" />
      <div className="container">
        <div className="cta-sec__inner">
          <div className="cta-sec__badge">
            <span className="cta-sec__badge-glyph" aria-hidden="true">✦</span>
            {t('cta_section.badge')}
          </div>
          <h2 className="d-xl cta-sec__title">
            {t('cta_section.title')}<br />
            <em>{t('cta_section.title_em')}</em>
          </h2>
          <p className="t-lg cta-sec__body">{t('cta_section.body')}</p>
          <ul className="cta-sec__perks">
            {perks.map(p => (
              <li key={p} className="cta-sec__perk">
                <span className="cta-sec__perk-check" aria-hidden="true">✦</span>
                {p}
              </li>
            ))}
          </ul>
          <Link to="/registro-proveedores" className="btn btn-primary btn-lg cta-sec__btn"
            onClick={() => trackEvent(Events.CLICK_APPLY_PROVIDER, { from: 'cta_section' })}>
            <span>{t('cta_section.cta')}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
