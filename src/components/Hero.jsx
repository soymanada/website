import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { trackEvent, Events } from '../utils/analytics'
import './Hero.css'

const DEST_COUNTRIES = [
  { id: 'canada',      code: 'ca', available: true  },
  { id: 'new-zealand', code: 'nz', available: false },
  { id: 'australia',   code: 'au', available: false },
]

const FlagImg = ({ code, label }) => (
  <img
    src={`https://flagcdn.com/24x18/${code}.png`}
    srcSet={`https://flagcdn.com/48x36/${code}.png 2x`}
    width="24" height="18"
    alt={label}
    className="hero__guide-flag"
  />
)

export default function Hero() {
  const { t }        = useTranslation()
  const navigate     = useNavigate()
  const [dest, setDest] = useState('canada')

  const selected   = DEST_COUNTRIES.find(c => c.id === dest)
  const isAvailable = selected?.available ?? false

  const handleGuide = () => {
    if (dest === 'canada') {
      navigate('/primeros-pasos')
    } else {
      navigate(`/primeros-pasos?dest=${dest}`)
    }
  }

  return (
    <section className="hero">
      <div className="hero__mesh" aria-hidden="true">
        <div className="hero__mesh-orb hero__mesh-orb--1" />
        <div className="hero__mesh-orb hero__mesh-orb--2" />
        <div className="hero__mesh-orb hero__mesh-orb--3" />
      </div>
      <div className="hero__inner container">
        <div className="hero__content">
          <div className="eyebrow anim-fade-up">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" width="13" height="13" aria-hidden="true">
              <polygon points="2,13 30,16 2,2"/>
              <polygon points="2,19 30,16 2,30"/>
            </svg>
            {t('hero.eyebrow')}
          </div>
          <h1 className="d-2xl hero__headline anim-fade-up delay-1">
            {t('hero.title')} <br />
            <em className="hero__headline-em">{t('hero.title_em')}</em>
          </h1>
          <p className="t-lg hero__sub anim-fade-up delay-2">{t('hero.subtitle')}</p>
          <div className="hero__actions anim-fade-up delay-3">
            <Link to="/proveedores" className="btn btn-primary btn-lg"
              onClick={() => trackEvent(Events.CLICK_CATEGORIA, { origen: 'hero_primary' })}>
              <span>{t('hero.cta_primary')}</span>
            </Link>
            <Link to="/" className="btn btn-secondary btn-lg"
              onClick={(e) => { e.preventDefault(); document.getElementById('categorias')?.scrollIntoView({ behavior: 'smooth' }) }}>
              {t('hero.cta_secondary')}
            </Link>
          </div>

          {/* ── Country guide widget ─────────────────────────── */}
          <div className="hero__guide anim-fade-up delay-3">
            <span className="hero__guide-label">
              🐾 {t('hero.guide_label')}
            </span>
            <div className="hero__guide-widget">
              <div className="hero__guide-flags">
                {DEST_COUNTRIES.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    className={[
                      'hero__guide-flag-btn',
                      dest === c.id ? 'hero__guide-flag-btn--active' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => setDest(c.id)}
                    title={t(`first_steps.dest_${c.id.replace('-', '_')}`)}
                    aria-pressed={dest === c.id}
                  >
                    <FlagImg code={c.code} label={t(`first_steps.dest_${c.id.replace('-', '_')}`)} />
                    <span className="hero__guide-flag-name">
                      {t(`first_steps.dest_${c.id.replace('-', '_')}`)}
                    </span>
                    {!c.available && (
                      <span className="hero__guide-flag-soon">
                        {t('first_steps.coming_soon_badge')}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={`hero__guide-go${!isAvailable ? ' hero__guide-go--soon' : ''}`}
                onClick={handleGuide}
              >
                {isAvailable
                  ? t('hero.guide_go')
                  : t('first_steps.coming_soon_badge')}
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
