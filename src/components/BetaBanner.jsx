import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './BetaBanner.css'

const STORAGE_KEY = 'beta_banner_v1'
const BANNER_H    = '38px'

export default function BetaBanner() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
      document.documentElement.style.setProperty('--banner-h', BANNER_H)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, '1')
    document.documentElement.style.setProperty('--banner-h', '0px')
  }

  if (!visible) return null

  return (
    <div className="beta-banner" role="note" aria-label={t('beta_banner.aria_label')}>
      <div className="beta-banner__inner">
        <span className="beta-banner__badge" aria-hidden="true">
          <span className="beta-banner__dot" />
          Beta
        </span>
        <p className="beta-banner__text">{t('beta_banner.message')}</p>
        <button
          type="button"
          className="beta-banner__close"
          onClick={dismiss}
          aria-label={t('beta_banner.close')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6"  y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
