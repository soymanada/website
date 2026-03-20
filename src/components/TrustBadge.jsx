import './TrustBadge.css'
import VerificationBadge from './VerificationBadge'

const pillars = [
  { icon: '👥', title: 'Recomendado por la comunidad', body: 'Cada proveedor fue sugerido o avalado por miembros reales de la Manada. No listamos a desconocidos.' },
  { icon: '✅', title: 'Revisión básica verificada',    body: 'Validamos presencia real: perfil activo, historial en la comunidad y forma de contacto directa.' },
  { icon: '🚫', title: 'Sin pago por aparecer',        body: 'Estar en SoyManada no se compra. Se gana con confianza. El sello es por mérito, no por dinero.' },
]

export default function TrustBadge() {
  return (
    <section className="trust section">
      <div className="container">
        <div className="trust__layout">
          {/* Left */}
          <div className="trust__left">
            <div className="trust__title-row">
              <VerificationBadge variant="seal" theme="dark" />
              <h2 className="d-lg trust__title">
                ¿Qué significa<br />
                <em>"Verificado por Manada"?</em>
              </h2>
            </div>
            <p className="t-lg trust__lead">
              No es un certificado legal. Es algo más valioso:
              la validación de personas reales que ya trabajaron
              con este proveedor y lo recomiendan.
            </p>

            <p className="t-sm trust__disclaimer">
              ⚠️ SoyManada es un directorio de referencia. No presta servicios legales, migratorios ni financieros.
              Siempre evalúa a tu proveedor antes de contratar.
            </p>
          </div>

          {/* Right */}
          <div className="trust__right">
            {pillars.map((p, i) => (
              <div key={i} className="trust-pillar">
                <div className="trust-pillar__icon" aria-hidden="true">{p.icon}</div>
                <div>
                  <h3 className="trust-pillar__title">{p.title}</h3>
                  <p className="t-sm trust-pillar__body">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
