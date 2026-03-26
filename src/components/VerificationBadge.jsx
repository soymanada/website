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
        {/* Pulgar apuntando arriba */}
        <rect x="4" y="2" width="9" height="18" rx="4.5"/>
        {/* Puño / palma */}
        <rect x="4" y="18" width="24" height="12" rx="5"/>
        {/* Nudillos redondeados — 3 dedos curvados */}
        <ellipse cx="16" cy="18" rx="3" ry="2.5"/>
        <ellipse cx="22" cy="16.5" rx="3" ry="2.5"/>
        <ellipse cx="27.5" cy="18.5" rx="2.5" ry="2"/>
      </svg>
      <span className="vb-pill__text">
        <strong>{label}</strong>
        <span> {sub}</span>
      </span>
    </div>
  );
}
