// src/components/TopBar.jsx
// Usa flag-icons CDN (ya incluido en index.html)
import { useTranslation } from 'react-i18next'
import './TopBar.css'

const LANGS = [
  { code: 'es',    label: 'ES', flag: 'fi fi-cl' },
  { code: 'en',    label: 'EN', flag: 'fi fi-ca' },
  { code: 'fr-CA', label: 'FR', flag: 'fi fi-ca' },
]

export default function TopBar() {
  const { i18n } = useTranslation()
  const activeLang = i18n.language === 'fr-CA' || i18n.language?.startsWith('fr') ? 'fr-CA'
    : i18n.language?.startsWith('en') ? 'en' : 'es'

  return (
    <div className="topbar">
      <div className="topbar__flags" role="group" aria-label="Language / Langue / Idioma">
        {LANGS.map(l => (
          <button
            key={l.code}
            className={`topbar__btn${activeLang === l.code ? ' topbar__btn--active' : ''}`}
            onClick={() => i18n.changeLanguage(l.code)}
            title={l.code === 'es' ? 'Español' : l.code === 'en' ? 'English' : 'Français'}
            aria-pressed={activeLang === l.code}
          >
            <span className={`${l.flag} topbar__flag-icon`} />
            <span className="topbar__label">{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
