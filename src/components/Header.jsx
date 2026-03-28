import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import LanguageSwitcher from './LanguageSwitcher'
import './Header.css'

export default function Header() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const location = useLocation()
  const { t, i18n } = useTranslation()

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
    { to: '/categoria/taxes',          label: t('header.nav_taxes') },
    { to: '/categoria/comunidad',      label: t('header.nav_comunidad') },
    { to: '/categoria/remesas',        label: t('header.nav_remesas') },
  ]

  return (
    <header className={`hdr${(scrolled || darkHero) ? ' hdr--scrolled' : ''}${menuOpen ? ' hdr--open' : ''}`}>
      <div className="hdr__bar container">
        <Link to="/" className="hdr__logo">
          <svg className="hdr__logo-glyph" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" width="22" height="22" aria-hidden="true">
            <ellipse cx="16" cy="25" rx="8" ry="5.5"/>
            <ellipse cx="4.5" cy="15" rx="3.2" ry="4" transform="rotate(-25, 4.5, 15)"/>
            <ellipse cx="11" cy="8" rx="3.2" ry="4" transform="rotate(-10, 11, 8)"/>
            <ellipse cx="21" cy="8" rx="3.2" ry="4" transform="rotate(10, 21, 8)"/>
            <ellipse cx="27.5" cy="15" rx="3.2" ry="4" transform="rotate(25, 27.5, 15)"/>
          </svg>
          <span className="hdr__logo-word">
            SoyManada
            {i18n.language !== 'es' && (
              <span className="hdr__logo-sub">{t('brand_name')}</span>
            )}
          </span>
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
                {(user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || '?')}
              </span>
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              <span>{t('header.cta_ingresar')}</span>
            </Link>
          )}
        </div>

        <div className="hdr__lang-mobile">
          <LanguageSwitcher />
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
          {user ? (
            <Link to={isProvider ? '/mi-perfil' : '/proveedores'} className="btn btn-ghost btn-full">
              {t('header.cta_mi_perfil', 'Mi perfil')}
            </Link>
          ) : (
            <Link to="/login" className="btn btn-ghost btn-full">
              {t('header.cta_ingresar')}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
