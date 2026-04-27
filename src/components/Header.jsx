import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { getUserDisplayName } from '../utils/userUtils'
import LanguageSwitcher from './LanguageSwitcher'
import './Header.css'

export default function Header() {
  const [scrolled,     setScrolled]     = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const darkHero = ['/proveedores', '/mi-perfil', '/cuenta'].includes(location.pathname)
  const darkPage = ['/primeros-pasos'].includes(location.pathname)
  const { user, isProvider, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
    setMenuOpen(false)
    setUserMenuOpen(false)
  }

  useEffect(() => {
    if (!userMenuOpen) return
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [userMenuOpen])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false) }, [location])

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
    <header className={`hdr${(scrolled || darkHero) ? ' hdr--scrolled' : ''}${darkPage && !scrolled ? ' hdr--dark' : ''}${menuOpen ? ' hdr--open' : ''}`}>
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
          {navLinks.slice(0, 6).map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `hdr__link${isActive ? ' hdr__link--active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hdr__actions">
          <NavLink to="/primeros-pasos" className={({ isActive }) => `hdr__first-steps${isActive ? ' hdr__first-steps--active' : ''}`}>
            🐾 {t('header.nav_primeros_pasos')}
          </NavLink>
          <Link to="/registro-proveedores" className="btn btn-ghost btn-sm hdr__provider-btn">
            {t('header.cta_proveedor')}
          </Link>
          <LanguageSwitcher />
          {user ? (
            <div className="hdr__user-group" ref={userMenuRef}>
              <button
                type="button"
                className={`hdr__avatar${userMenuOpen ? ' hdr__avatar--open' : ''}`}
                onClick={() => setUserMenuOpen(v => !v)}
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
                title={getUserDisplayName(user) ?? user.email}
              >
                <span className="hdr__avatar-initials">
                  {(getUserDisplayName(user) ?? '?').split(' ')[0]}
                </span>
                <svg className="hdr__avatar-caret" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {userMenuOpen && (
                <div className="hdr__user-menu" role="menu">
                  <Link
                    to={isProvider ? '/mi-perfil' : '/cuenta'}
                    className="hdr__user-menu-item"
                    role="menuitem"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    {isProvider ? t('header.cta_mi_perfil') : t('header.cta_mi_cuenta')}
                  </Link>
                  <div className="hdr__user-menu-divider" />
                  <button
                    type="button"
                    className="hdr__user-menu-item hdr__user-menu-item--danger"
                    role="menuitem"
                    onClick={handleSignOut}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    {t('header.cta_cerrar_sesion')}
                  </button>
                </div>
              )}
            </div>
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
          <NavLink to="/primeros-pasos">🐾 {t('header.nav_primeros_pasos')}</NavLink>
          {navLinks.map(l => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
        </nav>
        <div className="hdr__drawer-actions">
          <Link to="/registro-proveedores" className="btn btn-secondary btn-full">{t('header.cta_proveedor')}</Link>
          <Link to="/proveedores" className="btn btn-primary btn-full"><span>{t('header.cta_explorar')}</span></Link>
          {user ? (
            <>
              <Link to={isProvider ? '/mi-perfil' : '/cuenta'} className="btn btn-ghost btn-full">
                {isProvider ? t('header.cta_mi_perfil') : t('header.cta_mi_cuenta')}
              </Link>
              <button type="button" className="btn btn-secondary btn-full" onClick={handleSignOut}>
                {t('header.cta_cerrar_sesion')}
              </button>
            </>
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
