import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Header.css'

export default function Header() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const location = useLocation()

  // Páginas con hero oscuro: el header arranca con fondo sólido
  const darkHero = ['/proveedores', '/mi-perfil'].includes(location.pathname)
  const { user, signOut, isProvider } = useAuth()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const navLinks = [
    { to: '/categoria/seguros',      label: 'Seguros' },
    { to: '/categoria/migracion',    label: 'Migración' },
    { to: '/categoria/traducciones', label: 'Traducciones' },
    { to: '/categoria/trabajo',      label: 'Trabajo' },
    { to: '/categoria/alojamiento',  label: 'Alojamiento' },
    { to: '/categoria/idiomas',      label: 'Idiomas' },
    { to: '/categoria/banca',        label: 'Banca' },
    { to: '/categoria/salud-mental',    label: 'Salud Mental' },
    { to: '/categoria/antes-de-viajar', label: 'Antes de viajar' },
  ]

  return (
    <header className={`hdr${(scrolled || darkHero) ? ' hdr--scrolled' : ''}${menuOpen ? ' hdr--open' : ''}`}>
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
          <Link to="/registro-proveedores" className="btn btn-ghost btn-sm hdr__provider-btn">
            Soy proveedor
          </Link>
          {user ? (
            <div className="hdr__user-group">
              {isProvider && (
                <Link to="/mi-perfil" className="btn btn-ghost btn-sm" style={{ color: 'var(--iris-600)' }}>
                  Mi perfil
                </Link>
              )}
              <button className="hdr__avatar" onClick={signOut} title="Cerrar sesión">
                <span className="hdr__avatar-initials">
                  {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
                </span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              <span>Ingresar</span>
            </Link>
          )}
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
        </nav>
        <div className="hdr__drawer-actions">
          <Link to="/registro-proveedores" className="btn btn-secondary btn-full">Soy proveedor</Link>
          <Link to="/proveedores" className="btn btn-primary btn-full"><span>Explorar directorio</span></Link>
        </div>
      </div>
    </header>
  )
}