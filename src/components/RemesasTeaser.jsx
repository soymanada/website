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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" width="52" height="52">
              <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.12)" />
              <path d="M10 24h28M30 17l7 7-7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 19c0-2.2 1.8-4 4-4h4" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"/>
              <path d="M34 29c0 2.2-1.8 4-4 4h-4" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"/>
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
