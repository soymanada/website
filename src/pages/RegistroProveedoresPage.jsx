import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { trackEvent, Events } from '../utils/analytics'
import PawIcon from '../components/PawIcon'
import './RegistroProveedoresPage.css'

export default function RegistroProveedoresPage() {
  const { t } = useTranslation()

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const handleApply = () => {
    trackEvent(Events.CLICK_APPLY_PROVIDER, { from: 'providers_page' })
    window.open('https://forms.gle/fcafAqi49XRevVot6', '_blank', 'noopener,noreferrer')
  }

  const benefits = [
    { icon: '🌍', title: t('registro_proveedores.benefit1_title'), body: t('registro_proveedores.benefit1_body') },
    { icon: '⚡',  title: t('registro_proveedores.benefit2_title'), body: t('registro_proveedores.benefit2_body') },
    { icon: 'PAW', title: t('registro_proveedores.benefit3_title'), body: t('registro_proveedores.benefit3_body') },
    { icon: '🆓',  title: t('registro_proveedores.benefit4_title'), body: t('registro_proveedores.benefit4_body') },
  ]

  const steps = [
    { n: '01', title: t('registro_proveedores.step1_title'), body: t('registro_proveedores.step1_body') },
    { n: '02', title: t('registro_proveedores.step2_title'), body: t('registro_proveedores.step2_body') },
    { n: '03', title: t('registro_proveedores.step3_title'), body: t('registro_proveedores.step3_body') },
  ]

  return (
    <main className="ppg">
      {/* Hero */}
      <section className="ppg-hero">
        <div className="ppg-hero__orb ppg-hero__orb--1" aria-hidden="true" />
        <div className="ppg-hero__orb ppg-hero__orb--2" aria-hidden="true" />
        <div className="container">
          <div className="ppg-hero__inner">
            <div className="ppg-hero__content">
              <p className="eyebrow">{t('registro_proveedores.eyebrow')}</p>
              <h1 className="d-2xl ppg-hero__title">
                {t('registro_proveedores.title')}<br />
                <em>{t('registro_proveedores.title_em')}</em>
              </h1>
              <p className="t-lg ppg-hero__sub">{t('registro_proveedores.subtitle')}</p>
              <div className="ppg-hero__actions">
                <button className="btn btn-primary btn-lg" onClick={handleApply}>
                  <span>{t('registro_proveedores.cta_primary')}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <p className="t-sm ppg-hero__note">{t('registro_proveedores.cta_note')}</p>
              </div>
            </div>

            {/* Visual */}
            <div className="ppg-hero__visual" aria-hidden="true">
              <div className="ppg-card">
                <div className="ppg-card__header">
                  <div className="ppg-card__avatar">M</div>
                  <div className="ppg-card__info">
                    <strong>María Fernández</strong>
                    <span>Corredora de seguros</span>
                  </div>
                  <div className="ppg-card__badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <PawIcon size={11} /> Verificado
                  </div>
                </div>
                <div className="ppg-card__stats">
                  <div className="ppg-card__stat">
                    <span className="ppg-card__stat-n">47</span>
                    <span>contactos este mes</span>
                  </div>
                  <div className="ppg-card__stat">
                    <span className="ppg-card__stat-n">5</span>
                    <span>países atendidos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="ppg-benefits section">
        <div className="container">
          <div className="ppg-benefits__header">
            <p className="eyebrow">{t('registro_proveedores.section_benefits')}</p>
            <h2 className="d-xl ppg-benefits__title">{t('registro_proveedores.benefits_title')}</h2>
          </div>
          <div className="ppg-benefits__grid">
            {benefits.map((b, i) => (
              <div key={i} className="ppg-benefit">
                <div className="ppg-benefit__icon">
                  {b.icon === 'PAW' ? <PawIcon size={28} /> : b.icon}
                </div>
                <div>
                  <h3 className="ppg-benefit__title">{b.title}</h3>
                  <p className="t-sm ppg-benefit__body">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="ppg-steps section">
        <div className="ppg-steps__orb" aria-hidden="true" />
        <div className="container">
          <h2 className="d-xl ppg-steps__title">{t('registro_proveedores.section_steps')}</h2>
          <div className="ppg-steps__list">
            {steps.map(s => (
              <div key={s.n} className="ppg-step">
                <div className="ppg-step__n">{s.n}</div>
                <div>
                  <h3 className="ppg-step__title">{s.title}</h3>
                  <p className="t-md ppg-step__desc">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="ppg-cta section">
        <div className="container">
          <div className="ppg-cta__inner">
            <h2 className="d-lg ppg-cta__title">{t('registro_proveedores.final_cta_title')}</h2>
            <p className="t-lg ppg-cta__sub">{t('registro_proveedores.final_cta_body')}</p>
            <button className="btn btn-primary btn-lg" onClick={handleApply}>
              <span>{t('registro_proveedores.final_cta_btn')}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
