// src/components/LanguageSwitcher.jsx
import { useTranslation } from 'react-i18next'
import './LanguageSwitcher.css'

const LANGS = [
  { code: 'es',    label: 'ES' },
  { code: 'en',    label: 'EN' },
  { code: 'fr-CA', label: 'FR' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current  = i18n.language?.split('-')[0] === 'fr' ? 'fr-CA' : (i18n.language?.split('-')[0] ?? 'es')

  return (
    <div className="lang-sw" role="group" aria-label="Idioma / Language">
      {LANGS.map(l => (
        <button
          key={l.code}
          className={`lang-sw__btn${current === l.code ? ' lang-sw__btn--active' : ''}`}
          onClick={() => i18n.changeLanguage(l.code)}
          aria-pressed={current === l.code}
          lang={l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
