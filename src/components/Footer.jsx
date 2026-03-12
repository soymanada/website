import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
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
              <Link to="/categoria/seguros">Seguros</Link>
              <Link to="/categoria/migracion">Asesoría migratoria</Link>
              <Link to="/categoria/traducciones">Traducciones</Link>
              <Link to="/categoria/trabajo">Trabajo</Link>
              <Link to="/categoria/alojamiento">Alojamiento</Link>
              <Link to="/categoria/idiomas">Idiomas</Link>
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
