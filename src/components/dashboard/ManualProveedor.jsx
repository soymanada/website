// src/components/dashboard/ManualProveedor.jsx
import React, { useState } from 'react'
import './ManualProveedor.css'

const ARTICLES = [
  // ── MI PERFIL ────────────────────────────────────────────────
  {
    id: 'perfil-completar',
    category: 'Mi Perfil',
    icon: '👤',
    title: '¿Cómo completo mi perfil?',
    content: `Tu perfil es lo primero que ve un migrante al encontrarte en el directorio. Un perfil completo genera más confianza y más contactos.

Campos esenciales:
• **Nombre / Marca** — tu nombre o el nombre de tu servicio.
• **Servicio principal** — una frase corta que describe lo que haces. Ej: "Asesoría migratoria a Canadá".
• **Descripción** — cuéntale al migrante quién eres y cómo puedes ayudarlo. Mínimo 3 oraciones.
• **Países donde operas** — separados por coma. Ej: Canadá, Chile.
• **Idiomas** — los idiomas en que puedes atender.

Recuerda hacer clic en **Guardar cambios** al final de la sección.`,
    links: [{ label: 'Ir a Mi Perfil', tab: 'perfil' }],
  },
  {
    id: 'perfil-foto',
    category: 'Mi Perfil',
    icon: '📷',
    title: 'Cómo subir tu foto de perfil',
    content: `Una foto real aumenta la confianza del migrante y diferencia tu perfil de los demás.

Pasos:
1. Ve a la pestaña **Mi Perfil**.
2. Haz clic en el círculo con tu inicial (o en tu foto actual).
3. Selecciona una imagen JPG, PNG o WebP de **máximo 2 MB**.
4. La foto se guarda automáticamente — no necesitas hacer clic en Guardar.

Recomendación: usa una foto tuya real o el logo de tu marca con fondo claro.`,
    links: [{ label: 'Ir a Mi Perfil', tab: 'perfil' }],
  },
  {
    id: 'perfil-pago-externo',
    category: 'Mi Perfil',
    icon: '💳',
    title: 'Agregar un link de pago externo',
    content: `Disponible en **todos los planes**, incluyendo Wonderer. Puedes agregar un link de cobro que aparecerá como botón en tu perfil público.

Acepta cualquier plataforma de pago:
• MercadoPago: https://mpago.la/tu-link
• Wise: https://wise.com/pay/tu-nombre
• PayPal: https://paypal.me/tu-nombre
• Cualquier otra plataforma con URL directa

Pasos:
1. Ve a la pestaña **Mi Perfil**.
2. En la sección "Contacto y pagos", pega tu link en el campo "Link de pago".
3. El link debe comenzar con https://
4. Haz clic en **Guardar cambios**.

El botón aparecerá en tu perfil inmediatamente.`,
    links: [{ label: 'Ir a Mi Perfil', tab: 'perfil' }],
  },

  // ── HERRAMIENTAS ─────────────────────────────────────────────
  {
    id: 'herramientas-whatsapp',
    category: 'Herramientas',
    icon: '📱',
    title: 'Activar tu WhatsApp en el perfil',
    content: `Disponible desde el plan **Cub**. Por defecto, tu número no es visible en el perfil público. Puedes activarlo manualmente.

Pasos:
1. Ve a **Herramientas**.
2. En la sección "WhatsApp", activa el toggle.
3. Se guarda automáticamente.

Cuando está activado, los migrantes ven un botón de WhatsApp en tu perfil y pueden contactarte directamente.

⚠️ Asegúrate de haber ingresado tu número en **Mi Perfil → WhatsApp** antes de activar esta opción.`,
    links: [{ label: 'Ir a Herramientas', tab: 'herramientas' }],
  },
  {
    id: 'herramientas-agenda',
    category: 'Herramientas',
    icon: '📅',
    title: 'Configurar tu agenda de citas',
    content: `La agenda te permite recibir reservas directamente desde tu perfil público. Disponible desde el plan **Cub**.

Tienes dos opciones:

**Opción A — Agenda interna de SoyManada (recomendada)**
1. Ve a **Herramientas → Calendario de citas**.
2. Usa el editor de disponibilidad para marcar tus bloques horarios libres.
3. Los migrantes podrán reservar directamente desde tu perfil.

**Opción B — Link externo (Calendly, Cal.com, etc.)**
1. Pega tu link de Calendly o Cal.com en el campo "Link de agenda".
2. Guarda. Tu perfil mostrará ese link como botón adicional.

Puedes usar ambas al mismo tiempo.

**Plataforma de videollamada**
En la misma sección configuras dónde se realizará la llamada:
• **Plan Wolf:** se genera una sala automática de SoyManada (Jitsi) al confirmar cada reserva.
• **Todos los planes:** pega un link de Zoom, Google Meet, Teams o WhatsApp. Ese link aparece en el email de confirmación del migrante.`,
    links: [{ label: 'Ir a Herramientas', tab: 'herramientas' }],
  },
  {
    id: 'herramientas-stripe',
    category: 'Herramientas',
    icon: '🔐',
    title: 'Configurar cobros seguros con Stripe (Wolf)',
    content: `Disponible en el plan **Wolf**. Conecta tu cuenta bancaria a través de Stripe para recibir pagos con tarjeta directamente desde tu perfil.

Pasos:
1. Ve a **Herramientas → Cobros seguros con Stripe**.
2. Haz clic en **Conectar mi cuenta Stripe**.
3. Serás redirigido al portal de Stripe para verificar tu identidad y cuenta bancaria.
4. Una vez completado, vuelves automáticamente a SoyManada.

Estados posibles:
• **Sin conectar** — aún no iniciaste el proceso.
• **Onboarding incompleto** — iniciaste pero no terminaste. Haz clic en "Completar verificación".
• **Requisitos pendientes** — Stripe necesita más información. Entra a "Ver requisitos pendientes".
• **Activo** — tu cuenta está verificada y puedes recibir pagos.

Cuando está activo, el botón de pago con Stripe aparece en tu perfil público.`,
    links: [{ label: 'Ir a Herramientas', tab: 'herramientas' }],
  },
  {
    id: 'herramientas-email',
    category: 'Herramientas',
    icon: '✉️',
    title: 'Email de redirección de consultas (Wolf)',
    content: `Disponible en el plan **Wolf**. Cada mensaje nuevo en tu inbox de SoyManada también te llega a tu correo personal.

Pasos:
1. Ve a **Herramientas → Herramientas avanzadas**.
2. Ingresa tu email en el campo "Email para redirección de consultas".
3. Haz clic en **Guardar**.`,
    links: [{ label: 'Ir a Herramientas', tab: 'herramientas' }],
  },
  {
    id: 'herramientas-respuestas',
    category: 'Herramientas',
    icon: '💬',
    title: 'Respuestas predefinidas (Wolf)',
    content: `Disponible en el plan **Wolf**. Define textos que puedes reutilizar rápidamente al responder mensajes en tu inbox.

Cómo configurarlas:
1. Ve a **Herramientas → Herramientas avanzadas**.
2. Haz clic en **Agregar pregunta y respuesta**.
3. Escribe la pregunta frecuente y la respuesta correspondiente.
4. Puedes agregar varios pares. Haz clic en **Guardar**.

Ejemplo de respuestas útiles:
• "Mi primera consulta es gratuita y dura 30 minutos."
• "Opero de lunes a viernes de 9 a 18 hrs (hora Santiago)."
• "Puedes agendar directamente desde mi perfil."`,
    links: [{ label: 'Ir a Herramientas', tab: 'herramientas' }],
  },

  // ── RESEÑAS ───────────────────────────────────────────────────
  {
    id: 'reseñas-responder',
    category: 'Reseñas',
    icon: '⭐',
    title: 'Cómo responder reseñas de clientes (Wolf)',
    content: `Disponible en el plan **Wolf**. Cuando un migrante deja una reseña en tu perfil, puedes responderla públicamente desde la pestaña Reseñas.

Pasos:
1. Ve a la pestaña **Reseñas**.
2. Verás las reseñas de tus clientes con autor, calificación y texto.
3. Haz clic en el área de texto debajo de la reseña, escribe tu respuesta y haz clic en **Responder**.
4. Tu respuesta aparecerá en tu perfil público debajo de esa reseña.

Para editar una respuesta ya publicada, haz clic en **Editar respuesta**.

Las respuestas públicas muestran profesionalismo y generan confianza en nuevos migrantes que visiten tu perfil.`,
    links: [{ label: 'Ir a Reseñas', tab: 'reseñas' }],
  },
  {
    id: 'reseñas-como-llegan',
    category: 'Reseñas',
    icon: '📬',
    title: '¿Cómo recibo reseñas de mis clientes?',
    content: `Las reseñas se generan automáticamente después de una cita completada.

Flujo:
1. Un migrante reserva y confirmas la cita.
2. Una vez que la cita ocurre, marcas la reserva como **Completada** en la pestaña Reservas.
3. SoyManada envía automáticamente un email al migrante invitándolo a dejar una reseña.
4. Si el migrante deja la reseña, aparece en tu perfil público y en tu pestaña Reseñas.

No puedes solicitar ni eliminar reseñas manualmente — el proceso es automático para garantizar la autenticidad.`,
    links: [{ label: 'Ir a Reservas', tab: 'reservas' }],
  },

  // ── RESERVAS ──────────────────────────────────────────────────
  {
    id: 'reservas-gestionar',
    category: 'Reservas',
    icon: '🗓',
    title: 'Cómo gestionar reservas pendientes',
    content: `Cuando un migrante reserva una cita contigo, aparece en la pestaña **Reservas** con estado "Pendiente". Disponible desde el plan **Cub**.

Acciones disponibles:
• **Confirmar** — acepta la reserva. El migrante recibe un email con los detalles y el link a la sala de videollamada.
• **Rechazar** — cancela la reserva. El migrante es notificado automáticamente.

Una vez confirmada, la reserva aparece en "Confirmadas". Cuando la cita se realice, márcala como **Completada** para habilitar la solicitud de reseña al migrante.`,
    links: [{ label: 'Ir a Reservas', tab: 'reservas' }],
  },
  {
    id: 'reservas-confirmacion-email',
    category: 'Reservas',
    icon: '📧',
    title: 'Qué recibe el migrante al confirmar una cita',
    content: `Cuando confirmas una reserva, SoyManada envía automáticamente emails a ambas partes.

**Al migrante:**
- Fecha y hora de la cita
- Notas si las hay
- Botón para entrar a la sala de videollamada

**A ti (proveedor):**
- Resumen de la cita
- Link a la sala

La sala de videollamada se genera automáticamente al confirmar y es accesible desde la pestaña **Reservas** en tu cuenta y en la del migrante.

No necesitas hacer nada adicional — el sistema se encarga de todo.`,
    links: [{ label: 'Ir a Reservas', tab: 'reservas' }],
  },

  // ── PLANES ────────────────────────────────────────────────────
  {
    id: 'planes-diferencias',
    category: 'Planes',
    icon: '💎',
    title: 'Diferencias entre Wonderer, Cub y Wolf',
    content: `SoyManada tiene tres planes para proveedores:

**✨ Wonderer — Gratis**
- Perfil público en el directorio
- Descripción, foto y redes sociales
- Link de pago externo (Wise, MercadoPago, etc.)

**🐾 Cub — $4.990 CLP/mes**
- Todo lo de Wonderer
- Métricas de visitas en tiempo real
- WhatsApp visible en tu perfil
- Agenda de citas y reservas
- Inbox de mensajes directos

**🐺 Wolf — $9.990 CLP/mes**
- Todo lo de Cub
- Cobros seguros con Stripe (tarjeta desde tu perfil)
- Responder reseñas públicamente
- Email de redirección de consultas
- Respuestas predefinidas en el inbox

Puedes comparar los planes y actualizar desde la pestaña **Herramientas** (al final de la sección).`,
    links: [{ label: 'Ver planes', tab: 'herramientas' }],
  },
  {
    id: 'planes-cambio',
    category: 'Planes',
    icon: '🔄',
    title: 'Cómo cambiar de plan',
    content: `Puedes actualizar tu plan en cualquier momento desde la pestaña **Herramientas**.

Pasos:
1. Ve a **Herramientas**.
2. Desplázate hasta el final de la sección — encontrarás la comparación de planes.
3. Haz clic en **Activar Cub** o **Activar Wolf** según el plan que desees.
4. Serás redirigido a MercadoPago para completar el pago.
5. Una vez procesado, tu plan se activa automáticamente.

El cobro es mensual y puedes cancelar cuando quieras.`,
    links: [{ label: 'Ir a Herramientas', tab: 'herramientas' }],
  },
]

const CATEGORIES = [...new Set(ARTICLES.map(a => a.category))]

export default function ManualProveedor({ onNavigate }) {
  const [search,         setSearch]         = useState('')
  const [openId,         setOpenId]         = useState(null)
  const [activeCategory, setActiveCategory] = useState('Todos')

  const filtered = ARTICLES.filter(a => {
    const matchCat  = activeCategory === 'Todos' || a.category === activeCategory
    const matchText = !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchText
  })

  const toggle = (id) => setOpenId(prev => prev === id ? null : id)

  const renderContent = (text) =>
    text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g)
      const rendered = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
      )
      return <p key={i} className={line === '' ? 'manual__spacer' : 'manual__line'}>{rendered}</p>
    })

  return (
    <div className="pdash__section manual">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">❓ Manual del Proveedor</h2>
        <p className="t-sm pdash__section-sub">
          Todo lo que necesitas saber para sacarle el máximo provecho a SoyManada.
        </p>
      </div>

      {/* Búsqueda */}
      <div className="manual__search-wrap">
        <span className="manual__search-icon" aria-hidden="true">🔍</span>
        <input
          className="manual__search"
          type="search"
          placeholder="Buscar en el manual…"
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveCategory('Todos') }}
        />
        {search && (
          <button className="manual__search-clear" onClick={() => setSearch('')} aria-label="Limpiar búsqueda">
            ✕
          </button>
        )}
      </div>

      {/* Filtros por categoría */}
      {!search && (
        <div className="manual__categories">
          {['Todos', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              className={`manual__cat-btn${activeCategory === cat ? ' manual__cat-btn--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Resultados vacíos */}
      {filtered.length === 0 && (
        <div className="manual__empty">
          <p className="t-sm" style={{ color: 'var(--text-300)' }}>
            No encontramos artículos para "<strong>{search}</strong>".
          </p>
        </div>
      )}

      {/* Lista — agrupada por categoría cuando no hay búsqueda */}
      {!search && activeCategory === 'Todos'
        ? CATEGORIES.map(cat => {
            const catArticles = filtered.filter(a => a.category === cat)
            if (catArticles.length === 0) return null
            return (
              <div key={cat} className="manual__group">
                <h3 className="manual__group-title t-sm">{cat.toUpperCase()}</h3>
                {catArticles.map(a => (
                  <ArticleCard key={a.id} article={a} open={openId === a.id}
                    onToggle={() => toggle(a.id)} onNavigate={onNavigate}
                    renderContent={renderContent} />
                ))}
              </div>
            )
          })
        : filtered.map(a => (
            <ArticleCard key={a.id} article={a} open={openId === a.id}
              onToggle={() => toggle(a.id)} onNavigate={onNavigate}
              renderContent={renderContent} />
          ))
      }
    </div>
  )
}

function ArticleCard({ article, open, onToggle, onNavigate, renderContent }) {
  return (
    <div className={`manual__card${open ? ' manual__card--open' : ''}`}>
      <button className="manual__card-header" onClick={onToggle} aria-expanded={open}>
        <span className="manual__card-icon" aria-hidden="true">{article.icon}</span>
        <span className="manual__card-title t-sm">{article.title}</span>
        <span className={`manual__card-chevron${open ? ' manual__card-chevron--open' : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <div className="manual__card-body">
          <div className="manual__card-content">
            {renderContent(article.content)}
          </div>
          {article.links?.length > 0 && (
            <div className="manual__card-links">
              {article.links.map(link => (
                <button
                  key={link.tab}
                  className="btn btn-ghost btn-sm manual__card-link"
                  onClick={() => onNavigate?.(link.tab)}
                >
                  {link.label} →
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
