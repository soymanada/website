import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Search, Users, MessageCircle, XCircle, RefreshCw } from 'lucide-react'
import './VerificacionPage.css'

const steps = [
  {
    Icon: Search,
    title: 'Revisión manual de cada postulación',
    body: 'Cada proveedor que llega al formulario es revisado por el equipo de Manada antes de ser publicado. No existe aprobación automática.',
  },
  {
    Icon: MessageCircle,
    title: 'Verificación de contacto activo',
    body: 'Confirmamos que el WhatsApp, Instagram o sitio web indicados son reales, están activos y responden. Un proveedor sin contacto verificable no se publica.',
  },
  {
    Icon: Users,
    title: 'Validación comunitaria',
    body: 'Priorizamos proveedores recomendados por miembros reales de la comunidad Manada. La experiencia directa de otros migrantes tiene más peso que cualquier declaración propia.',
  },
  {
    Icon: ShieldCheck,
    title: 'Consistencia entre lo declarado y lo real',
    body: 'Verificamos que el servicio descrito coincida con la actividad real del proveedor. Perfiles vagos, promesas genéricas o información inconsistente son motivo de rechazo.',
  },
]

const rejectionReasons = [
  'Información no verificable o inconsistente',
  'Sin experiencia demostrable con migrantes',
  'Sin canales de contacto activos al momento de la revisión',
  'Servicios que requieren advertencia legal no declarada',
  'Feedback negativo de miembros de la comunidad',
]

export default function VerificacionPage() {
  useEffect(() => {
    document.title = 'Verificación de proveedores | SoyManada'
    return () => { document.title = 'SoyManada – Directorio para la comunidad migrante' }
  }, [])

  return (
    <main className="verif">

      {/* Hero */}
      <section className="verif__hero section">
        <div className="container">
          <div className="verif__hero-inner">
            <span className="eyebrow"><span className="eyebrow-dot" />Transparencia</span>
            <h1 className="d-xl verif__title">
              Cómo verificamos<br />
              <em>a cada proveedor</em>
            </h1>
            <p className="t-lg verif__lead">
              "Verificado por Manada" no es un sello automático. Es el resultado de un proceso manual, estricto y basado en la experiencia real de la comunidad.
            </p>
          </div>
        </div>
      </section>

      {/* Proceso */}
      <section className="verif__process section">
        <div className="container">
          <div className="verif__steps">
            {steps.map(({ Icon, title, body }, i) => (
              <div key={i} className="verif__step">
                <div className="verif__step-icon">
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <div className="verif__step-content">
                  <h3 className="verif__step-title">{title}</h3>
                  <p className="t-md verif__step-body">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Criterios de rechazo */}
      <section className="verif__reject section">
        <div className="container">
          <div className="verif__reject-inner">
            <div className="verif__reject-header">
              <XCircle size={28} strokeWidth={1.5} className="verif__reject-icon" />
              <h2 className="d-md">Motivos de rechazo</h2>
            </div>
            <p className="t-md verif__reject-lead">
              SoyManada se reserva el derecho de rechazar cualquier postulación sin necesidad de dar explicaciones. Los motivos más frecuentes son:
            </p>
            <ul className="verif__reject-list">
              {rejectionReasons.map((r, i) => (
                <li key={i} className="verif__reject-item">
                  <span className="verif__reject-dot" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Mantenimiento */}
      <section className="verif__maintain section">
        <div className="container">
          <div className="verif__maintain-inner">
            <RefreshCw size={28} strokeWidth={1.5} className="verif__maintain-icon" />
            <div>
              <h2 className="d-md">El sello no es para siempre</h2>
              <p className="t-md">
                Los proveedores con feedback negativo, canales de contacto inactivos o información desactualizada son removidos del directorio. La verificación es un estado continuo, no un certificado permanente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="verif__cta section">
        <div className="container">
          <p className="t-lg verif__cta-text">¿Eres un proveedor y quieres aparecer en el directorio?</p>
          <Link to="/registro-proveedores" className="btn btn-primary btn-lg">
            <span>Postularme ahora</span>
          </Link>
        </div>
      </section>

    </main>
  )
}
