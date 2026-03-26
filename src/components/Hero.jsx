import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { trackEvent, Events } from '../utils/analytics'
import './Hero.css'

export default function Hero() {
  const { t } = useTranslation()
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
              <ellipse cx="16" cy="25" rx="8" ry="5.5"/>
              <ellipse cx="4.5" cy="15" rx="3.2" ry="4" transform="rotate(-25, 4.5, 15)"/>
              <ellipse cx="11" cy="8" rx="3.2" ry="4" transform="rotate(-10, 11, 8)"/>
              <ellipse cx="21" cy="8" rx="3.2" ry="4" transform="rotate(10, 21, 8)"/>
              <ellipse cx="27.5" cy="15" rx="3.2" ry="4" transform="rotate(25, 27.5, 15)"/>
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
        </div>
      </div>
    </section>
  )
}
