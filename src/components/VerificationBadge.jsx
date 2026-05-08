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

  if (variant === 'banner') {
    return (
      <div className="vb-banner" role="img" aria-label={`${label} ${sub}`}>
        <div className="vb-banner__dot">
          <svg className="vb-banner__check" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M2 5l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="vb-banner__text">
          <strong>{label}</strong>
          <span> {sub}</span>
        </span>
      </div>
    )
  }

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
      <div className="vb-pill__dot">
        <svg className="vb-pill__check" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 5l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className="vb-pill__text">
        <strong>{label}</strong>
        <span> {sub}</span>
      </span>
    </div>
  );
}
