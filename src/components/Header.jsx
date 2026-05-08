import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { getUserDisplayName } from '../utils/userUtils'
import LanguageSwitcher from './LanguageSwitcher'
import categories from '../data/categories.json'
import './Header.css'

// ── Grouped navigation structure ─────────────────────────────────────────────
// Keys map to t('nav.group_<key>') in all locale files
const NAV_GROUPS = [
  { key: 'status',     icon: '🛂', slugs: ['migracion', 'traducciones', 'taxes'] },
  { key: 'settlement', icon: '🏠', slugs: ['alojamiento', 'banca', 'seguros', 'planes-telefono', 'remesas'] },
  { key: 'growth',     icon: '💼', slugs: ['trabajo', 'idiomas'] },
  { key: 'lifestyle',  icon: '🐾', slugs: ['salud-mental', 'mascotas', 'comunidad'] },
]

// Build a lookup: slug → category object
const CAT_BY_SLUG = Object.fromEntries(categories.map(c => [c.slug, c]))

// ─────────────────────────────────────────────────────────────────────────────
export default function Header() {
  const [scrolled,      setScrolled]      = useState(false)
  const [menuOpen,      setMenuOpen]      = useState(false)
  const [userMenuOpen,  setUserMenuOpen]  = useState(false)
  const [openGroup,     setOpenGroup]     = useState(null)   // desktop dropdown
  const [openAccordion, setOpenAccordion] = useState(null)   // mobile accordion

  const navRef     = useRef(null)
  const userMenuRef = useRef(null)
  const location   = useLocation()
  const navigate   = useNavigate()
  const { t, i18n } = useTranslation()

  const darkHero = ['/proveedores', '/mi-perfil', '/cuenta'].includes(location.pathname)
  const darkPage = ['/primeros-pasos'].includes(location.pathname)
  const { user, isProvider, signOut } = useAuth()

  // ── helpers ──────────────────────────────────────────────────────────────
  const isGroupActive = (slugs) =>
    slugs.some(slug => location.pathname === `/categoria/${slug}`)

  const buildGroupLinks = (slugs) =>
    slugs
      .map(slug => CAT_BY_SLUG[slug])
      .filter(Boolean)
      .map(c => ({ to: `/categoria/${c.slug}`, label: t(`categories.${c.slug}`, c.name) }))

  // ── event handlers ───────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
    setMenuOpen(false)
    setUserMenuOpen(false)
  }

  const toggleGroup = (key) =>
    setOpenGroup(prev => (prev === key ? null : key))

  const toggleAccordion = (key) =>
    setOpenAccordion(prev => (prev === key ? null : key))

  // ── effects ──────────────────────────────────────────────────────────────
  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [userMenuOpen])

  // Close nav dropdown on outside click
  useEffect(() => {
    if (!openGroup) return
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target))
        setOpenGroup(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openGroup])

  // Scroll detection
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close everything on route change
  useEffect(() => {
    setMenuOpen(false)
    setUserMenuOpen(false)
    setOpenGroup(null)
  }, [location])

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <header className={[
      'hdr',
      (scrolled || darkHero) ? 'hdr--scrolled' : '',
      darkPage && !scrolled  ? 'hdr--dark'     : '',
      menuOpen               ? 'hdr--open'     : '',
    ].filter(Boolean).join(' ')}>

      <div className="hdr__bar container">

        {/* ── Logo ────────────────────────────────────────────────────── */}
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

        {/* ── Desktop grouped nav ──────────────────────────────────────── */}
        <nav className="hdr__nav" ref={navRef} aria-label={t('header.nav_label', 'Categorías')}>
          {NAV_GROUPS.map(group => {
            const active = isGroupActive(group.slugs)
            const open   = openGroup === group.key
            return (
              <div key={group.key} className="hdr__group">
                <button
                  type="button"
                  className={[
                    'hdr__group-btn',
                    active ? 'hdr__group-btn--active' : '',
                    open   ? 'hdr__group-btn--open'   : '',
                  ].filter(Boolean).join(' ')}
                  aria-haspopup="true"
                  aria-expanded={open}
                  onClick={() => toggleGroup(group.key)}
                >
                  <span className="hdr__group-icon" aria-hidden="true">{group.icon}</span>
                  {t(`nav.group_${group.key}`)}
                  <svg className="hdr__group-caret" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {open && (
                  <div className="hdr__group-menu" role="menu">
                    {buildGroupLinks(group.slugs).map(link => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        role="menuitem"
                        className={({ isActive }) =>
                          `hdr__group-item${isActive ? ' hdr__group-item--active' : ''}`
                        }
                        onClick={() => setOpenGroup(null)}
                      >
                        {link.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* ── Right actions ────────────────────────────────────────────── */}
        <div className="hdr__actions">
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

        {/* ── Mobile: language switcher in top bar ──────────────────────── */}
        <div className="hdr__lang-mobile">
          <LanguageSwitcher />
        </div>

        {/* ── Burger ────────────────────────────────────────────────────── */}
        <button
          className={`hdr__burger${menuOpen ? ' hdr__burger--open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label={t('header.menu_label')}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────────────── */}
      <div className={`hdr__drawer${menuOpen ? ' hdr__drawer--open' : ''}`}>
        <nav className="hdr__drawer-nav">
          <NavLink to="/" end>{t('header.nav_inicio')}</NavLink>
          <NavLink to="/primeros-pasos">🐾 {t('header.nav_primeros_pasos')}</NavLink>

          {/* Accordion groups */}
          {NAV_GROUPS.map(group => {
            const active   = isGroupActive(group.slugs)
            const expanded = openAccordion === group.key
            return (
              <div key={group.key} className="hdr__acc">
                <button
                  type="button"
                  className={[
                    'hdr__acc-trigger',
                    active   ? 'hdr__acc-trigger--active' : '',
                    expanded ? 'hdr__acc-trigger--open'   : '',
                  ].filter(Boolean).join(' ')}
                  aria-expanded={expanded}
                  onClick={() => toggleAccordion(group.key)}
                >
                  <span>
                    <span className="hdr__acc-icon" aria-hidden="true">{group.icon}</span>
                    {t(`nav.group_${group.key}`)}
                  </span>
                  <svg className="hdr__acc-caret" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {expanded && (
                  <div className="hdr__acc-body">
                    {buildGroupLinks(group.slugs).map(link => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                          `hdr__acc-link${isActive ? ' hdr__acc-link--active' : ''}`
                        }
                      >
                        {link.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
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
