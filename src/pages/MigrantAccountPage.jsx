import { useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import PawIcon from '../components/PawIcon'
import './LoginPage.css'
import './MigrantAccountPage.css'

export default function MigrantAccountPage() {
  const { user, loading, signOut, isProvider } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = t('account_page.meta_title')
    return () => { document.title = 'SoyManada – Directorio para la comunidad migrante' }
  }, [t])

  if (loading) {
    return (
      <main className="macct macct--loading">
        <div className="macct__spinner" aria-hidden="true" />
      </main>
    )
  }

  if (isProvider) {
    return <Navigate to="/mi-perfil" replace />
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    '—'

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <main className="lgp">
      <div className="lgp__bg-orb lgp__bg-orb--1" aria-hidden="true" />
      <div className="lgp__bg-orb lgp__bg-orb--2" aria-hidden="true" />

      <div className="lgp__card macct__card">
        <Link to="/" className="lgp__logo">
          <PawIcon size={18} className="lgp__logo-glyph" />
          <span>SoyManada</span>
        </Link>

        <h1 className="d-md macct__title">{t('account_page.title')}</h1>
        <p className="t-sm lgp__subtitle macct__subtitle">{t('account_page.subtitle')}</p>

        <div className="macct__panel">
          <div className="macct__row">
            <span className="macct__label t-sm">{t('account_page.name_label')}</span>
            <span className="macct__value">{displayName}</span>
          </div>
          <div className="macct__row">
            <span className="macct__label t-sm">{t('account_page.email_label')}</span>
            <span className="macct__value">{user?.email ?? '—'}</span>
          </div>
        </div>

        <div className="macct__actions">
          <button type="button" className="btn btn-primary btn-full" onClick={handleSignOut}>
            <span>{t('account_page.sign_out')}</span>
          </button>
          <Link to="/proveedores" className="btn btn-secondary btn-full">
            <span>{t('account_page.explore')}</span>
          </Link>
          <Link to="/" className="btn btn-ghost btn-full">
            <span>{t('account_page.back_home')}</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
