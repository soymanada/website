import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { trackEvent, Events } from '../utils/analytics'
import './Hero.css'

const DEST_COUNTRIES = [
  { id: 'canada',      code: 'ca', available: true  },
  { id: 'new-zealand', code: 'nz', available: true  },
  { id: 'australia',   code: 'au', available: false },
]

const ORIGIN_COUNTRIES = [
  { id: 'chile',     code: 'cl', available: true  },
  { id: 'argentina', code: 'ar', available: false },
  { id: 'colombia',  code: 'co', available: false },
  { id: 'venezuela', code: 've', available: false },
  { id: 'mexico',    code: 'mx', available: false },
]

const FlagImg = ({ code, label, size = 24 }) => (
  <img
    src={`https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${code}.png`}
    srcSet={`https://flagcdn.com/${size * 2}x${Math.round(size * 1.5)}/${code}.png 2x`}
    width={size} height={Math.round(size * 0.75)}
    alt={label}
    className="hero__guide-flag"
  />
)

export default function Hero() {
  const { t }             = useTranslation()
  const navigate          = useNavigate()
  const [dest,   setDest]   = useState('canada')
  const [origin, setOrigin] = useState('chile')

  const destData   = DEST_COUNTRIES.find(c => c.id === dest)
  const originData = ORIGIN_COUNTRIES.find(c => c.id === origin)
  const isReady    = !!(destData?.available && originData?.available)

  const handleGuide = () => {
    navigate(`/primeros-pasos?dest=${dest}&from=${origin}`)
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
            <span className="hero__guide-label">🐾 {t('hero.guide_label')}</span>
            <div className="hero__guide-widget">

              {/* Row 1: origin */}
              <div className="hero__guide-row">
                <span className="hero__guide-row-label">{t('hero.guide_from_label')}</span>
                <div className="hero__guide-flags">
                  {ORIGIN_COUNTRIES.map(c => {
                    const name = t(`hero.origin_${c.id}`)
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={['hero__guide-flag-btn', origin === c.id ? 'hero__guide-flag-btn--active' : ''].filter(Boolean).join(' ')}
                        onClick={() => setOrigin(c.id)}
                        title={name}
                        aria-pressed={origin === c.id}
                      >
                        <FlagImg code={c.code} label={name} />
                        <span className="hero__guide-flag-name">{name}</span>
                        {!c.available && <span className="hero__guide-flag-soon">{t('first_steps.coming_soon_badge')}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="hero__guide-divider" />

              {/* Row 2: destination */}
              <div className="hero__guide-row">
                <span className="hero__guide-row-label">{t('hero.guide_to_label')}</span>
                <div className="hero__guide-flags">
                  {DEST_COUNTRIES.map(c => {
                    const name = t(`first_steps.dest_${c.id.replace('-', '_')}`)
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={['hero__guide-flag-btn', dest === c.id ? 'hero__guide-flag-btn--active' : ''].filter(Boolean).join(' ')}
                        onClick={() => setDest(c.id)}
                        title={name}
                        aria-pressed={dest === c.id}
                      >
                        <FlagImg code={c.code} label={name} />
                        <span className="hero__guide-flag-name">{name}</span>
                        {!c.available && <span className="hero__guide-flag-soon">{t('first_steps.coming_soon_badge')}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Go button */}
              <button
                type="button"
                className={`hero__guide-go${!isReady ? ' hero__guide-go--soon' : ''}`}
                onClick={handleGuide}
              >
                {isReady ? t('hero.guide_go') : t('first_steps.coming_soon_badge')}
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
