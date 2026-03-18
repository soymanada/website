import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import './Header.css'

export default function Header() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const location = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const navLinks = [
    { to: '/categoria/seguros',     label: 'Seguros' },
    { to: '/categoria/migracion',   label: 'Migración' },
    { to: '/categoria/trabajo',     label: 'Trabajo' },
    { to: '/categoria/alojamiento', label: 'Alojamiento' },
    { to: '/categoria/idiomas',     label: 'Idiomas' },
  ]

  return (
    <header className={`hdr${scrolled ? ' hdr--scrolled' : ''}${menuOpen ? ' hdr--open' : ''}`}>
      <div className="hdr__bar container">
        {/* Logo */}
        <Link to="/" className="hdr__logo">
          <span className="hdr__logo-glyph" aria-hidden="true">✦</span>
          <span className="hdr__logo-word">SoyManada</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hdr__nav">
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `hdr__link${isActive ? ' hdr__link--active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="hdr__actions">
          <Link to="/proveedores" className="btn btn-ghost btn-sm hdr__provider-btn">
            Soy proveedor
          </Link>
          <Link to="/categoria/migracion" className="btn btn-primary btn-sm">
            <span>Explorar directorio</span>
          </Link>
        </div>

        {/* Burger */}
        <button className={`hdr__burger${menuOpen ? ' hdr__burger--open' : ''}`} onClick={() => setMenuOpen(v => !v)} aria-label="Menú">
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`hdr__drawer${menuOpen ? ' hdr__drawer--open' : ''}`}>
        <nav className="hdr__drawer-nav">
          <NavLink to="/" end>Inicio</NavLink>
          {navLinks.map(l => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
          <NavLink to="/categoria/traducciones">Traducciones</NavLink>
        </nav>
        <div className="hdr__drawer-actions">
          <Link to="/proveedores" className="btn btn-secondary btn-full">Soy proveedor</Link>
          <Link to="/categoria/migracion" className="btn btn-primary btn-full"><span>Explorar directorio</span></Link>
        </div>
      </div>
    </header>
  )
}