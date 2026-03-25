// src/components/TopBar.jsx
// Selector de idioma compacto en esquina superior derecha — no interfiere con el Header
import { useTranslation } from 'react-i18next'
import './TopBar.css'

const LANGS = [
  { code: 'es',    label: 'ES', country: 'cl' },
  { code: 'en',    label: 'EN', country: 'ca' },
  { code: 'fr-CA', label: 'FR', country: 'qc' },
]

// Íconos SVG de banderas simples (no emoji — compatibilidad total)
function FlagIcon({ country, size = 16 }) {
  const flags = {
    cl: (
      <svg width={size} height={size * 0.67} viewBox="0 0 30 20" aria-hidden="true">
        <rect width="30" height="10" fill="#D52B1E"/>
        <rect y="10" width="30" height="10" fill="#fff"/>
        <rect width="10" height="10" fill="#003087"/>
        <polygon points="5,2 6.2,5.8 10,5.8 6.9,8 8.1,11.8 5,9.5 1.9,11.8 3.1,8 0,5.8 3.8,5.8" fill="#fff"/>
      </svg>
    ),
    ca: (
      <svg width={size} height={size * 0.67} viewBox="0 0 30 20" aria-hidden="true">
        <rect width="7.5" height="20" fill="#FF0000"/>
        <rect x="22.5" width="7.5" height="20" fill="#FF0000"/>
        <rect x="7.5" width="15" height="20" fill="#fff"/>
        <path d="M15,4 l1.5,3 3.5,0.5 -2.5,2.5 0.5,3.5 -3,-1.5 -3,1.5 0.5,-3.5 -2.5,-2.5 3.5,-0.5z" fill="#FF0000"/>
      </svg>
    ),
    qc: (
      <svg width={size} height={size * 0.67} viewBox="0 0 30 20" aria-hidden="true">
        <rect width="30" height="20" fill="#003087"/>
        <rect x="13" width="4" height="20" fill="#fff"/>
        <rect y="8" width="30" height="4" fill="#fff"/>
        <text x="5" y="7" fontSize="5" fill="#fff" fontFamily="serif">✦</text>
        <text x="20" y="7" fontSize="5" fill="#fff" fontFamily="serif">✦</text>
        <text x="5" y="17" fontSize="5" fill="#fff" fontFamily="serif">✦</text>
        <text x="20" y="17" fontSize="5" fill="#fff" fontFamily="serif">✦</text>
      </svg>
    ),
  }
  return flags[country] ?? null
}

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
            <FlagIcon country={l.country} size={14} />
            <span className="topbar__label">{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
