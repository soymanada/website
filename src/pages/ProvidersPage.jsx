import { useEffect } from 'react'
import { trackEvent, Events } from '../utils/analytics'
import './ProvidersPage.css'

const benefits = [
  { icon: '🌍', title: 'Llega a tu comunidad',      body: 'Miles de migrantes buscan servicios confiables cada semana. Tu perfil estará donde ellos buscan.' },
  { icon: '⚡', title: 'Contacto directo',            body: 'Los usuarios te contactan por WhatsApp o Instagram. Sin intermediarios ni comisiones.' },
  { icon: '✦',  title: 'Sello de confianza',         body: 'Si cumples los criterios, recibes el sello "Verificado por Manada". Vale más que cualquier anuncio.' },
  { icon: '🆓', title: 'Gratuito para empezar',       body: 'Aparecer en SoyManada no tiene costo. La confianza de la comunidad es el único requisito.' },
]

export default function ProvidersPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const handleApply = () => {
    // Analytics para medir cuántos proveedores se interesan
    trackEvent(Events.CLICK_APPLY_PROVIDER, { from: 'providers_page' })
    // Tu enlace real de Google Forms
    window.open('https://forms.gle/fcafAqi49XRevVot6', '_blank', 'noopener,noreferrer')
  }

  return (
    <main className="ppg">
      {/* Hero */}
      <section className="ppg-hero">
        <div className="ppg-hero__orb ppg-hero__orb--1" aria-hidden="true" />
        <div className="ppg-hero__orb ppg-hero__orb--2" aria-hidden="true" />
        <div className="container">
          <div className="ppg-hero__inner">
            <div className="ppg-hero__content">
              <p className="eyebrow">Para proveedores</p>
              <h1 className="d-2xl ppg-hero__title">
                Tu próximo cliente<br />
                <em>ya está buscándote</em>
              </h1>
              <p className="t-lg ppg-hero__sub">
                SoyManada conecta proveedores confiables con miles de migrantes
                que necesitan ayuda real. Sin publicidad cara, sin algoritmos.
                Solo confianza directa.
              </p>
              <div className="ppg-hero__actions">
                <button className="btn btn-primary btn-lg" onClick={handleApply}>
                  <span>Quiero aparecer en SoyManada</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <p className="t-sm ppg-hero__note">
                  Revisamos todas las solicitudes · Respuesta en menos de 48 h
                </p>
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
                  <div className="ppg-card__badge">✦ Verificado</div>
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
            <p className="eyebrow">Beneficios</p>
            <h2 className="d-xl ppg-benefits__title">¿Por qué aparecer en SoyManada?</h2>
          </div>
          <div className="ppg-benefits__grid">
            {benefits.map((b, i) => (
              <div key={i} className="ppg-benefit">
                <div className="ppg-benefit__icon">{b.icon}</div>
                <h3 className="ppg-benefit__title">{b.title}</h3>
                <p className="t-sm ppg-benefit__body">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="ppg-steps section">
        <div className="ppg-steps__orb" aria-hidden="true" />
        <div className="container">
          <h2 className="d-xl ppg-steps__title">¿Cómo funciona el proceso?</h2>
          <div className="ppg-steps__list">
            {[
              { n: '01', t: 'Envías tu solicitud',     d: 'Completa el formulario con tu nombre, servicio, países y contactos.' },
              { n: '02', t: 'Revisamos tu perfil',    d: 'El equipo valida tu información y presencia en la comunidad.' },
              { n: '03', t: 'Apareces en el directorio', d: 'Tu perfil queda activo y empiezas a recibir contactos directos.' },
            ].map(s => (
              <div key={s.n} className="ppg-step">
                <div className="ppg-step__n">{s.n}</div>
                <div>
                  <h3 className="ppg-step__title">{s.t}</h3>
                  <p className="t-md ppg-step__desc">{s.d}</p>
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
            <h2 className="d-lg ppg-cta__title">¿Listo para empezar?</h2>
            <p className="t-lg ppg-cta__sub">Es gratis, es simple y llega a gente que necesita lo que ofreces.</p>
            <button className="btn btn-primary btn-lg" onClick={handleApply}>
              <span>Enviar mi solicitud</span>
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