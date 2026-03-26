import { useTranslation } from 'react-i18next'
import './VerificationBadge.css';

/**
 * VerificationBadge — sistema de dos variantes
 *
 * variant="pill"   → inline dentro de ProviderCard, junto al nombre
 * variant="seal"   → protagonista en sección TrustBadge / ¿Qué significa verificado?
 * theme="light"    → sobre fondos ivory o surface blanca (default)
 * theme="dark"     → sobre secciones con fondo iris oscuro
 */
export default function VerificationBadge({ variant = 'pill', theme = 'light' }) {
  const { t } = useTranslation()
  const label = t('verification.verified')
  const sub   = t('verification.by_manada')

  if (variant === 'seal') {
    return (
      <div className={`vb-seal vb-seal--${theme}`} role="img" aria-label={`${label} ${sub}`}>
        <div className="vb-seal__circle">
          <svg className="vb-seal__check" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12l5 5L19 7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="vb-seal__label">{label}</span>
        <span className="vb-seal__sub">{sub}</span>
      </div>
    );
  }

  return (
    <div className={`vb-pill vb-pill--${theme}`} role="img" aria-label={`${label} ${sub}`}>
      <svg className="vb-pill__paw" viewBox="0 0 32 32" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        {/* 4 dedos */}
        <ellipse cx="4.5"  cy="15" rx="3.2" ry="4" transform="rotate(-25, 4.5, 15)"/>
        <ellipse cx="11"   cy="8"  rx="3.2" ry="4" transform="rotate(-10, 11, 8)"/>
        <ellipse cx="21"   cy="8"  rx="3.2" ry="4" transform="rotate(10, 21, 8)"/>
        <ellipse cx="27.5" cy="15" rx="3.2" ry="4" transform="rotate(25, 27.5, 15)"/>
        {/* Almohadilla central */}
        <ellipse cx="16" cy="25" rx="8" ry="5.5"/>
        {/* Checkmark blanco dentro de la almohadilla */}
        <path d="M11 25.5l3.5 3 6.5-6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
      <span className="vb-pill__text">
        <strong>{label}</strong>
        <span> {sub}</span>
      </span>
    </div>
  );
}
