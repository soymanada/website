import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import './Header.css'

export default function Header() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const location = useLocation()
  const { t } = useTranslation()

  const darkHero = ['/proveedores', '/mi-perfil'].includes(location.pathname)
  const { user, isProvider } = useAuth()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const navLinks = [
    { to: '/categoria/seguros',       label: t('header.nav_seguros') },
    { to: '/categoria/migracion',     label: t('header.nav_migracion') },
    { to: '/categoria/traducciones',  label: t('header.nav_traducciones') },
    { to: '/categoria/trabajo',       label: t('header.nav_trabajo') },
    { to: '/categoria/alojamiento',   label: t('header.nav_alojamiento') },
    { to: '/categoria/idiomas',       label: t('header.nav_idiomas') },
    { to: '/categoria/banca',         label: t('header.nav_banca') },
    { to: '/categoria/salud-mental',  label: t('header.nav_salud_mental') },
    { to: '/categoria/antes-de-viajar', label: t('header.nav_antes_de_viajar') },
  ]

  return (
    <header className={`hdr${(scrolled || darkHero) ? ' hdr--scrolled' : ''}${menuOpen ? ' hdr--open' : ''}`}>
      <div className="hdr__bar container">
        <Link to="/" className="hdr__logo">
          <span className="hdr__logo-glyph" aria-hidden="true">✦</span>
          <span className="hdr__logo-word">SoyManada</span>
        </Link>

        <nav className="hdr__nav">
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `hdr__link${isActive ? ' hdr__link--active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hdr__actions">
          <Link to="/registro-proveedores" className="btn btn-ghost btn-sm hdr__provider-btn">
            {t('header.cta_proveedor')}
          </Link>
          {user ? (
            <Link
              to={isProvider ? '/mi-perfil' : '/proveedores'}
              className="hdr__avatar"
              title={user.user_metadata?.full_name || user.email}
            >
              <span className="hdr__avatar-initials">
                {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
              </span>
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              <span>{t('header.cta_ingresar')}</span>
            </Link>
          )}
        </div>

        <button className={`hdr__burger${menuOpen ? ' hdr__burger--open' : ''}`} onClick={() => setMenuOpen(v => !v)} aria-label={t('header.menu_label')}>
          <span /><span /><span />
        </button>
      </div>

      <div className={`hdr__drawer${menuOpen ? ' hdr__drawer--open' : ''}`}>
        <nav className="hdr__drawer-nav">
          <NavLink to="/" end>{t('header.nav_inicio')}</NavLink>
          {navLinks.map(l => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
        </nav>
        <div className="hdr__drawer-actions">
          <Link to="/registro-proveedores" className="btn btn-secondary btn-full">{t('header.cta_proveedor')}</Link>
          <Link to="/proveedores" className="btn btn-primary btn-full"><span>{t('header.cta_explorar')}</span></Link>
        </div>
      </div>
    </header>
  )
}
