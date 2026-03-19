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
  if (variant === 'seal') {
    return (
      <div className={`vb-seal vb-seal--${theme}`} role="img" aria-label="Verificado por Manada">
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
        <span className="vb-seal__label">VERIFICADO</span>
        <span className="vb-seal__sub">por Manada</span>
      </div>
    );
  }

  return (
    <div className={`vb-pill vb-pill--${theme}`} role="img" aria-label="Verificado por Manada">
      <div className="vb-pill__dot">
        <svg className="vb-pill__check" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path
            d="M2 5l2.5 2.5 4-4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="vb-pill__text">
        <strong>VERIFICADO</strong>
        <span> por Manada</span>
      </span>
    </div>
  );
}
