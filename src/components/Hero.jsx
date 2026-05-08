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
          <Link to="/primeros-pasos" className="hero__guide-btn anim-fade-up delay-3">
            <span className="hero__guide-btn-icon">🐾</span>
            <span className="hero__guide-btn-text">{t('hero.cta_guide_label')}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
