import { Link } from 'react-router-dom'
import { trackEvent, Events } from '../utils/analytics'
import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      {/* Gradient mesh background */}
      <div className="hero__mesh" aria-hidden="true">
        <div className="hero__mesh-orb hero__mesh-orb--1" />
        <div className="hero__mesh-orb hero__mesh-orb--2" />
        <div className="hero__mesh-orb hero__mesh-orb--3" />
      </div>

      <div className="hero__inner container">
        {/* ── Left column ── */}
        <div className="hero__content">
          <div className="eyebrow anim-fade-up">
            <span className="eyebrow-dot" />
            Directorio verificado por la comunidad
          </div>

          <h1 className="d-2xl hero__headline anim-fade-up delay-1">
            La red que te cuida<br />
            <em className="hero__headline-em">donde sea que estés</em>
          </h1>

          <p className="t-lg hero__sub anim-fade-up delay-2">
            SoyManada conecta migrantes con proveedores reales validados
            por personas como tú. Seguros, migración, trabajo y más —
            sin perderse en grupos de WhatsApp.
          </p>

          <div className="hero__actions anim-fade-up delay-3">
            <Link
              to="/categoria/migracion"
              className="btn btn-primary btn-lg"
              onClick={() => trackEvent(Events.CLICK_CATEGORY_CARD, { from: 'hero' })}
            >
              <span>Explorar directorio</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              to="/proveedores"
              className="btn btn-secondary"
              onClick={() => trackEvent(Events.CLICK_APPLY_PROVIDER, { from: 'hero' })}
            >
              Soy proveedor
            </Link>
          </div>

          {/* Social proof row */}
          <div className="hero__proof anim-fade-up delay-4">
            <div className="hero__flags" aria-label="Comunidad de varios países">
              {['🇻🇪','🇨🇴','🇵🇪','🇦🇷','🇧🇴'].map((f, i) => (
                <span key={i} className="hero__flag">{f}</span>
              ))}
            </div>
            <p className="t-sm hero__proof-text">
              <strong>+2.000 personas</strong> ya encontraron su proveedor de confianza
            </p>
          </div>
        </div>

        {/* ── Right column: floating card UI ── */}
        <div className="hero__visual anim-fade-up delay-2">
          {/* Main card */}
          <div className="hero__card">
            {/* Card top bar */}
            <div className="hero__card-topbar">
              <div className="hero__card-dots" aria-hidden="true">
                <span /><span /><span />
              </div>
              <span className="hero__card-title">Directorio SoyManada</span>
            </div>

            {/* Search bar mock */}
            <div className="hero__search-mock" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="var(--iris-300)" strokeWidth="1.8"/>
                <path d="M15 15l-3-3" stroke="var(--iris-300)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span>Buscar proveedor o categoría...</span>
            </div>

            {/* Provider rows */}
            {[
              { emoji: '🛡️', name: 'María Fernández', cat: 'Seguros', verified: true,  flag: '🇻🇪' },
              { emoji: '📋', name: 'Estudio Legal',   cat: 'Migración', verified: true, flag: '🇨🇴' },
              { emoji: '🌐', name: 'TransDoc',        cat: 'Traducciones', verified: true, flag: '🇵🇪' },
            ].map((p, i) => (
              <div key={i} className={`hero__row hero__row--${i+1}`}>
                <div className="hero__row-icon">{p.emoji}</div>
                <div className="hero__row-info">
                  <span className="hero__row-name">{p.name}</span>
                  <span className="hero__row-cat">{p.cat} · {p.flag}</span>
                </div>
                {p.verified && (
                  <span className="hero__row-badge" aria-label="Verificado">✦</span>
                )}
              </div>
            ))}

            {/* CTA mock */}
            <div className="hero__card-cta" aria-hidden="true">
              <div className="hero__cta-wa">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </div>
              <div className="hero__cta-ig">Instagram</div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="hero__badge hero__badge--1" aria-hidden="true">
            <span className="hero__badge-check">✦</span>
            Verificado por Manada
          </div>
          <div className="hero__badge hero__badge--2" aria-hidden="true">
            <span>🌍</span>
            12 países · 6 categorías
          </div>
        </div>
      </div>
    </section>
  )
}
