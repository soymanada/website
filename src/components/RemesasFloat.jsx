import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './RemesasFloat.css'

export default function RemesasFloat() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  // Hide on the comparator page itself and on admin/dashboard pages
  if (pathname.startsWith('/categoria/remesas') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/mi-perfil')) return null

  return (
    <Link to="/categoria/remesas" className="remfloat" aria-label={t('remesas_teaser.cta')}>
      <span className="remfloat__icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="18" height="18">
          <path d="M4 12h16M14 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 9c0-1.7 1.3-3 3-3h1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".6"/>
          <path d="M16 15c0 1.7-1.3 3-3 3h-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".6"/>
        </svg>
      </span>
      <span className="remfloat__label">{t('remesas_teaser.float_label')}</span>
    </Link>
  )
}
