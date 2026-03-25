// src/components/TopBar.jsx
// Barra superior con selector de idioma via banderas.
// Lógica inteligente:
//   - Si el idioma activo es ES: muestra solo las banderas como selector discreto
//   - Si el idioma del navegador es EN o FR: muestra un banner de sugerencia
//   - Se puede cerrar (guarda en sessionStorage para no molestar de nuevo)
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './TopBar.css'

const LANGS = [
  { code: 'es',    flag: '🇨🇱', label: 'Español',          hint: 'ES' },
  { code: 'en',    flag: '🇨🇦', label: 'English',           hint: 'EN' },
  { code: 'fr-CA', flag: '🇶🇨', label: 'Français (Canada)', hint: 'FR' },
]

// Mensajes de sugerencia según idioma del navegador
const SUGGESTIONS = {
  en:    { text: 'This site is also available in English', cta: 'Switch to English', code: 'en' },
  fr:    { text: 'Ce site est aussi disponible en français', cta: 'Passer en français', code: 'fr-CA' },
  'fr-CA': { text: 'Ce site est aussi disponible en français', cta: 'Passer en français', code: 'fr-CA' },
}

export default function TopBar() {
  const { i18n } = useTranslation()
  const [dismissed, setDismissed] = useState(() =>
    sessionStorage.getItem('topbar_dismissed') === '1'
  )

  // Detectar si el navegador prefiere EN o FR (no ES)
  const browserLang = navigator.language?.toLowerCase() ?? 'es'
  const browserBase = browserLang.startsWith('fr') ? 'fr' : browserLang.startsWith('en') ? 'en' : 'es'
  const suggestion  = SUGGESTIONS[browserBase]

  // Idioma activo normalizado
  const activeLang = i18n.language === 'fr-CA' || i18n.language?.startsWith('fr') ? 'fr-CA'
    : i18n.language?.startsWith('en') ? 'en' : 'es'

  const dismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('topbar_dismissed', '1')
  }

  const switchTo = (code) => {
    i18n.changeLanguage(code)
    dismiss()
  }

  // Si el idioma activo NO es ES, mostrar solo el selector compacto (sin banner)
  // Si el idioma activo ES es el predeterminado y hay sugerencia → mostrar banner
  const showBanner  = !dismissed && activeLang === 'es' && !!suggestion
  const showCompact = activeLang !== 'es'

  return (
    <div className={`topbar${showBanner ? ' topbar--banner' : ' topbar--compact'}`}>
      <div className="container topbar__inner">

        {showBanner && (
          <>
            <span className="topbar__flag">{LANGS.find(l => l.code === suggestion.code)?.flag}</span>
            <span className="topbar__text t-xs">{suggestion.text}</span>
            <button className="topbar__cta t-xs" onClick={() => switchTo(suggestion.code)}>
              {suggestion.cta}
            </button>
            <div className="topbar__divider" />
          </>
        )}

        {/* Selector de banderas — siempre visible */}
        <div className="topbar__flags" role="group" aria-label="Language / Langue / Idioma">
          {LANGS.map(l => (
            <button
              key={l.code}
              className={`topbar__flag-btn${activeLang === l.code ? ' topbar__flag-btn--active' : ''}`}
              onClick={() => switchTo(l.code)}
              title={l.label}
              aria-pressed={activeLang === l.code}
            >
              <span className="topbar__flag-emoji">{l.flag}</span>
              <span className="topbar__flag-hint">{l.hint}</span>
            </button>
          ))}
        </div>

        {showBanner && (
          <button className="topbar__close" onClick={dismiss} aria-label="Cerrar">✕</button>
        )}
      </div>
    </div>
  )
}
