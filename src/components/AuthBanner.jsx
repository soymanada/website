// src/components/AuthBanner.jsx
// Strip shown only to unauthenticated users, right below the hero.
// Communicates value (verified contacts) and community protection angle.
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from 'react-i18next'
import './AuthBanner.css'

export default function AuthBanner() {
  const { user } = useAuth()
  const { t } = useTranslation()

  if (user) return null

  return (
    <div className="auth-banner">
      <div className="auth-banner__inner container">
        <div className="auth-banner__text">
          <span className="auth-banner__icon" aria-hidden="true">🐾</span>
          <div>
            <p className="auth-banner__headline">{t('auth_banner.headline')}</p>
            <p className="auth-banner__copy">{t('auth_banner.copy')}</p>
          </div>
        </div>
        <div className="auth-banner__actions">
          <Link to="/login" className="auth-banner__btn auth-banner__btn--secondary">
            {t('auth_banner.login')}
          </Link>
          <Link to="/login?mode=register" className="auth-banner__btn auth-banner__btn--primary">
            {t('auth_banner.register')}
          </Link>
        </div>
      </div>
    </div>
  )
}
