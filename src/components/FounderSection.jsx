// src/components/FounderSection.jsx
import { useTranslation } from 'react-i18next'
import './FounderSection.css'

export default function FounderSection() {
  const { t } = useTranslation()

  return (
    <section className="founder section">
      <div className="container">
        <div className="founder__layout">

          {/* ── Foto ── */}
          <div className="founder__photo-col" aria-hidden="true">
            <div className="founder__photo-wrap">
              <div className="founder__avatar">
                <span className="founder__initials">FA</span>
              </div>
              <div className="founder__photo-orb" />
            </div>
          </div>

          {/* ── Contenido ── */}
          <div className="founder__content">
            <p className="founder__eyebrow t-xs">{t('founder.eyebrow')}</p>

            <blockquote className="founder__quote d-md">
              "{t('founder.quote')}"
            </blockquote>

            <p className="founder__bio t-lg">{t('founder.bio')}</p>

            <div className="founder__meta">
              <div className="founder__name-block">
                <strong className="founder__name">{t('founder.name')}</strong>
                <span className="founder__role t-sm">{t('founder.role')}</span>
              </div>

              <div className="founder__badges">
                <span className="founder__badge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.02a8.27 8.27 0 0 0 4.84 1.55V7.12a4.85 4.85 0 0 1-1.07-.43z"/>
                  </svg>
                  {t('founder.tiktok_stat')}
                </span>
                <a
                  href="https://franciscoaleuy.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="founder__badge founder__badge--link"
                >
                  franciscoaleuy.ca ↗
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
