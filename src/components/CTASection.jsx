import { Link } from 'react-router-dom'
import { trackEvent, Events } from '../utils/analytics'
import './CTASection.css'

export default function CTASection() {
  return (
    <section className="cta-sec section">
      <div className="cta-sec__bg-orb" aria-hidden="true" />
      <div className="container">
        <div className="cta-sec__inner">
          <div className="cta-sec__badge">
            <span className="cta-sec__badge-glyph" aria-hidden="true">✦</span>
            Para proveedores
          </div>

          <h2 className="d-xl cta-sec__title">
            Llega a quienes<br />
            <em>realmente te necesitan</em>
          </h2>

          <p className="t-lg cta-sec__body">
            Miles de migrantes buscan servicios de confianza cada semana.
            Aparecer en SoyManada es aparecer en el directorio de su comunidad.
          </p>

          <ul className="cta-sec__perks">
            {['Perfil gratuito para empezar', 'Contacto directo por WhatsApp e Instagram', 'Comunidad activa y comprometida'].map(p => (
              <li key={p} className="cta-sec__perk">
                <span className="cta-sec__perk-check" aria-hidden="true">✦</span>
                {p}
              </li>
            ))}
          </ul>

          <Link
            to="/registro-proveedores"
            className="btn btn-primary btn-lg cta-sec__btn"
            onClick={() => trackEvent(Events.CLICK_APPLY_PROVIDER, { from: 'cta_section' })}
          >
            <span>Quiero aparecer en SoyManada</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
