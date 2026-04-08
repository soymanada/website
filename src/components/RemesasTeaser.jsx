import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { REMESAS_PLATFORMS } from '../data/remesas.config'
import './RemesasTeaser.css'

export default function RemesasTeaser() {
  const { t } = useTranslation()
  return (
    <section className="remtease" aria-label={t('remesas_teaser.aria', 'Comparador de remesas')}>
      <div className="container remtease__inner">

        {/* Left: identity */}
        <div className="remtease__identity">
          <div className="remtease__badge-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" width="36" height="36">
              <path d="M8 24h32M28 14l12 10-12 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 18c0-2.8 2.2-5 5-5h5" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M32 30c0 2.8-2.2 5-5 5h-5" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="remtease__eyebrow">{t('remesas_teaser.eyebrow', 'Herramienta gratuita')}</p>
            <h2 className="remtease__title">{t('remesas_teaser.title', 'Comparador de remesas')}</h2>
            <p className="remtease__sub">{t('remesas_teaser.sub', 'Encontrá el mejor tipo de cambio en segundos. Sin registro.')}</p>
          </div>
        </div>

        {/* Center: platforms */}
        <div className="remtease__platforms" aria-hidden="true">
          {REMESAS_PLATFORMS.map(p => (
            <span key={p.id} className="remtease__platform">{p.name}</span>
          ))}
        </div>

        {/* Right: CTA */}
        <Link to="/categoria/remesas" className="remtease__cta">
          {t('remesas_teaser.cta', 'Comparar precios')}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

      </div>
    </section>
  )
}
