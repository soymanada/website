// src/pages/FirstStepsPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import './FirstStepsPage.css'

const TABS = [
  { id: 'sin',    icon: '🪪', label: 'SIN Number' },
  { id: 'banca',  icon: '🏦', label: 'Banca' },
  { id: 'arriendo', icon: '🏠', label: 'Arriendo' },
  { id: 'trabajo', icon: '💼', label: 'Trabajo' },
  { id: 'visas',  icon: '📋', label: 'Visas RO' },
]

function SinContent() {
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">Cómo obtener tu SIN Number</h2>
      <p className="fsp__content-lead">El Social Insurance Number (SIN) es tu identificador fiscal en Canadá. Sin él no puedes trabajar legalmente ni acceder a beneficios del gobierno.</p>
      <div className="fsp__steps">
        {[
          { n: '01', title: 'Reúne los documentos', body: 'Necesitas tu pasaporte vigente y el permiso de trabajo o estudio (o tu PR card si ya eres residente permanente).' },
          { n: '02', title: 'Ve a Service Canada', body: 'Busca la oficina más cercana en Canada.ca/service-canada. No necesitas cita previa en la mayoría de las ciudades.' },
          { n: '03', title: 'Solicita el SIN en persona', body: 'El trámite es gratuito y el número lo recibes el mismo día en un papel impreso. Guárdalo en un lugar seguro.' },
          { n: '04', title: 'Cuida tu SIN', body: 'Compártelo solo con tu empleador, el banco y el CRA (Revenue Canada). Nunca lo envíes por correo electrónico no seguro.' },
        ].map(s => (
          <div key={s.n} className="fsp__step">
            <span className="fsp__step-num">{s.n}</span>
            <div>
              <strong>{s.title}</strong>
              <p>{s.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="fsp__tip">
        <span className="fsp__tip-icon">💡</span>
        <p>Si llegaste con visa de turista y aún no tienes permiso de trabajo, debes esperar a tenerlo antes de solicitar el SIN.</p>
      </div>
    </div>
  )
}

function BancaContent() {
  const banks = [
    { name: 'RBC', full: 'Royal Bank of Canada', pros: 'Sucursales en todo Canadá, app sólida, buen soporte en español en ciudades grandes.', cons: 'Comisiones mensuales si no cumples saldo mínimo.', url: 'https://www.rbc.com/newcomers' },
    { name: 'TD', full: 'TD Bank', pros: 'Horario extendido incluyendo fines de semana. Buenas opciones para recién llegados.', cons: 'La cuenta de nuevos inmigrantes tiene vigencia limitada.', url: 'https://www.td.com/ca/en/personal-banking/solutions/new-to-canada' },
    { name: 'Scotiabank', full: 'Scotiabank', pros: 'Programa StartRight especial para inmigrantes. Tarjeta de crédito sin historial crediticio.', cons: 'Menos sucursales en zonas rurales.', url: 'https://www.scotiabank.com/ca/en/personal/bank-accounts/newcomers.html' },
  ]
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">Abrir tu cuenta bancaria</h2>
      <p className="fsp__content-lead">Con tu pasaporte y prueba de dirección (o carta de empleador) puedes abrir una cuenta en los primeros días. La mayoría de los bancos tienen programas especiales para recién llegados.</p>
      <div className="fsp__bank-grid">
        {banks.map(b => (
          <div key={b.name} className="fsp__bank-card">
            <div className="fsp__bank-header">
              <span className="fsp__bank-name">{b.name}</span>
              <span className="fsp__bank-full">{b.full}</span>
            </div>
            <div className="fsp__bank-body">
              <p><strong>✅ A favor:</strong> {b.pros}</p>
              <p><strong>⚠️ Ojo con:</strong> {b.cons}</p>
            </div>
            <a href={b.url} target="_blank" rel="noopener noreferrer" className="fsp__bank-link">Ver cuenta para inmigrantes →</a>
          </div>
        ))}
      </div>
      <div className="fsp__tip">
        <span className="fsp__tip-icon">💡</span>
        <p>Necesitas tu SIN Number antes de la cita bancaria. Abre la cuenta dentro de los primeros 15 días para facilitar el depósito de tu primer sueldo.</p>
      </div>
    </div>
  )
}

function ArriendoContent() {
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">Arriendo: evita estafas y encuentra tu lugar</h2>
      <p className="fsp__content-lead">El mercado de arriendo en Canadá es competitivo. Conocer las reglas y señales de alerta te ahorra dinero y problemas legales.</p>
      <div className="fsp__two-col">
        <div className="fsp__box fsp__box--danger">
          <h3>🚨 Señales de estafa</h3>
          <ul>
            <li>Propietario "fuera del país" que pide depósito antes de mostrarte el inmueble</li>
            <li>Precio muy por debajo del mercado de la zona</li>
            <li>Solicitan pago en efectivo o transferencia sin recibo</li>
            <li>No hay contrato formal o te presionan para firmar rápido</li>
            <li>No puedes visitar la propiedad en persona antes de pagar</li>
          </ul>
        </div>
        <div className="fsp__box fsp__box--safe">
          <h3>✅ Portales confiables</h3>
          <ul>
            <li><strong>Kijiji.ca</strong> — Más popular para arriendos directos</li>
            <li><strong>Rentals.ca</strong> — Listados verificados</li>
            <li><strong>PadMapper</strong> — Vista de mapa útil</li>
            <li><strong>Facebook Marketplace</strong> — Grupos de "Hispanics en [ciudad]"</li>
            <li><strong>Grupos Manada</strong> — Comunidad hispanohablante</li>
          </ul>
        </div>
      </div>
      <div className="fsp__tip">
        <span className="fsp__tip-icon">💡</span>
        <p>En la mayoría de provincias, el propietario puede pedir máximo 1 mes de depósito. Exige siempre recibo y un contrato escrito antes de entregar cualquier dinero.</p>
      </div>
    </div>
  )
}

function TrabajoContent() {
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">Primeros pasos para trabajar en Canadá</h2>
      <p className="fsp__content-lead">Antes de buscar empleo, asegúrate de tener tu SIN Number activo y entender qué tipo de permiso de trabajo tienes (abierto o cerrado).</p>
      <div className="fsp__steps">
        {[
          { n: '01', title: 'Adapta tu CV al formato canadiense', body: 'Sin foto, sin edad, sin estado civil. 1-2 páginas máximo. Incluye solo experiencia relevante y habilidades cuantificables.' },
          { n: '02', title: 'Crea perfiles en los portales clave', body: 'LinkedIn (imprescindible), Indeed.ca, Workopolis y los portales gubernamentales de cada provincia.' },
          { n: '03', title: 'Networking local', body: 'Asiste a eventos de la cámara de comercio, grupos de tu industria en Meetup.com y comunidades de LinkedIn en tu ciudad.' },
          { n: '04', title: 'Referencias canadienses', body: 'Si es tu primera experiencia local, busca voluntariados o trabajos de entrada para construir tu red de referencias en Canadá.' },
        ].map(s => (
          <div key={s.n} className="fsp__step">
            <span className="fsp__step-num">{s.n}</span>
            <div>
              <strong>{s.title}</strong>
              <p>{s.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="fsp__tip">
        <span className="fsp__tip-icon">💡</span>
        <p>Muchas provincias tienen programas de reconocimiento de credenciales extranjeras. Consulta el portal de tu provincia para validar tu título profesional.</p>
      </div>
    </div>
  )
}

function VisasContent() {
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">Visas RO — Recognized Organizations</h2>
      <p className="fsp__content-lead">Las Recognized Organizations (RO) son entidades autorizadas por IRCC para ofrecer cupos de Working Holiday dentro del IEC (International Experience Canada).</p>
      <div className="fsp__steps">
        {[
          { n: '01', title: '¿Qué es una RO?', body: 'Son organizaciones privadas o sin fines de lucro aprobadas por el gobierno canadiense para procesar solicitudes IEC. Actúan como intermediarias entre el solicitante e IRCC.' },
          { n: '02', title: '¿Por qué usarla?', body: 'Los cupos directos por IRCC se agotan rápido. Las RO tienen cupos reservados y pueden postularte incluso cuando el pool directo está cerrado.' },
          { n: '03', title: 'Costo y proceso', body: 'Las RO cobran una tarifa de servicio adicional a las tasas de IRCC. El proceso incluye registro, revisión de documentos, invitation to apply (ITA) y solicitud de permiso.' },
          { n: '04', title: 'Lista oficial de ROs', body: 'Consulta la lista actualizada en Canada.ca buscando "IEC Recognized Organizations". Verifica siempre que la organización aparezca en esa lista oficial antes de pagar cualquier tarifa.' },
        ].map(s => (
          <div key={s.n} className="fsp__step">
            <span className="fsp__step-num">{s.n}</span>
            <div>
              <strong>{s.title}</strong>
              <p>{s.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="fsp__tip">
        <span className="fsp__tip-icon">💡</span>
        <p>Las RO no garantizan la visa, solo facilitan el proceso. El resultado final depende de IRCC. Desconfía de quienes prometan aprobación segura.</p>
      </div>
      <div className="fsp__cta-block">
        <p>¿Buscas ayuda profesional para tu proceso migratorio?</p>
        <Link to="/categoria/migracion" className="btn btn-primary"><span>Ver asesores de migración verificados</span></Link>
      </div>
    </div>
  )
}

const CONTENT = { sin: SinContent, banca: BancaContent, arriendo: ArriendoContent, trabajo: TrabajoContent, visas: VisasContent }

export default function FirstStepsPage() {
  const [active, setActive] = useState('sin')
  const Content = CONTENT[active]

  return (
    <main className="fsp">
      <div className="fsp__hero">
        <div className="fsp__hero-orb" aria-hidden="true" />
        <div className="container">
          <p className="fsp__eyebrow">Guía de llegada</p>
          <h1 className="fsp__title">Primeros pasos<br /><em>en Canadá</em></h1>
          <p className="fsp__sub">Todo lo que necesitas saber en tu primer mes. Sin rodeos.</p>
        </div>
      </div>

      <div className="fsp__body container">
        <nav className="fsp__tabs" aria-label="Secciones">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`fsp__tab${active === tab.id ? ' fsp__tab--active' : ''}`}
              onClick={() => setActive(tab.id)}
            >
              <span className="fsp__tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="fsp__panel">
          <Content />
        </div>
      </div>
    </main>
  )
}
