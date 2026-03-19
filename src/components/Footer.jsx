import { Link } from 'react-router-dom'
import categories from '../data/categories.json'
import CategoryIcon from './CategoryIcon'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        {/* Nueva sección ¿Por qué confiar? */}
        <div className="footer__trust-section">
          <h4 className="footer__trust-title d-md">¿Por qué confiar en Manada?</h4>
          <div className="footer__trust-grid">
            <div className="trust-item">
              <span className="trust-item__icon"><CategoryIcon name="shield" size={24} /></span>
              <div>
                <strong>Filtro manual</strong>
                <p className="t-xs">Cada proveedor es revisado antes de aparecer.</p>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-item__icon"><CategoryIcon name="message-circle" size={24} /></span>
              <div>
                <strong>Feedback real</strong>
                <p className="t-xs">Validado por la experiencia de nuestra comunidad.</p>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-item__icon"><CategoryIcon name="gift" size={24} /></span>
              <div>
                <strong>Beneficios exclusivos</strong>
                <p className="t-xs">Descuentos negociados solo para ti.</p>
              </div>
            </div>
          </div>
        </div>

        <hr className="footer__divider" />

        <div className="footer__inner">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span className="footer__logo-glyph">✦</span>
              <span>SoyManada</span>
            </Link>
            <p className="footer__tagline t-sm">
              El directorio de confianza para la comunidad migrante.
              Hecho con cariño, para gente lejos de casa.
            </p>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title label">Categorías</h4>
            <nav className="footer__links">
              {[...categories].sort((a, b) => a.order - b.order).map(cat => (
                <Link key={cat.slug} to={`/categoria/${cat.slug}`}>{cat.name}</Link>
              ))}
            </nav>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title label">Comunidad</h4>
            <nav className="footer__links">
              <Link to="/proveedores">Soy proveedor</Link>
              <a href="https://wa.me/56900000000" target="_blank" rel="noopener noreferrer">Grupo de WhatsApp</a>
            </nav>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="t-xs">© {new Date().getFullYear()} SoyManada. Todos los derechos reservados.</p>
          <p className="t-xs footer__disc">SoyManada es un directorio informativo y no provee asesoría legal, migratoria ni financiera.</p>
        </div>
      </div>
    </footer>
  )
}