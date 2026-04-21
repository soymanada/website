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

Recuerda hacer clic en **Guardar cambios** al final de la página.`,
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

  // ── HERRAMIENTAS ─────────────────────────────────────────────
  {
    id: 'herramientas-agenda',
    category: 'Herramientas',
    icon: '📅',
    title: 'Configurar tu agenda de citas',
    content: `La agenda te permite recibir reservas directamente desde tu perfil público. Disponible desde el plan **Silver**.

Tienes dos opciones de agenda:

**Opción A — Agenda interna de SoyManada (recomendada)**
1. Ve a **Herramientas → Calendario de citas**.
2. Usa el editor de disponibilidad para marcar tus bloques horarios libres.
3. Los migrantes verán esos bloques y podrán reservar sin salir de SoyManada.

**Opción B — Link externo (Calendly, Cal.com, etc.)**
1. Pega tu link de Calendly o Cal.com en el campo "Link de agenda".
2. Guarda. Tu perfil público mostrará ese link como botón adicional.

Puedes usar ambas opciones al mismo tiempo.

**Plataforma de videollamada**
En la misma sección puedes configurar dónde se realizará la llamada:
• **Gold:** se genera automáticamente una sala Jitsi de SoyManada al confirmar la reserva.
• **Todos los planes:** pega un link de Zoom, Google Meet, Teams, Whereby o WhatsApp en el campo "Plataforma para la llamada". Ese link aparecerá en el email de confirmación del migrante. Si lo dejas vacío en Gold, se usa la sala Jitsi automática.`,
    links: [{ label: 'Ir a Herramientas', tab: 'herramientas' }],
  },
  {
    id: 'herramientas-pago',
    category: 'Herramientas',
    icon: '💳',
    title: 'Configurar tu link de pago',
    content: `Disponible en el plan **Gold**. Agrega un link de cobro que aparecerá como botón en tu perfil público.

Acepta cualquier plataforma:
• Wise: https://wise.com/pay/tu-nombre
• MercadoPago: https://link.mercadopago.com/...
• PayPal: https://paypal.me/tu-nombre

Pasos:
1. Ve a **Herramientas → Herramientas avanzadas**.
2. Pega tu link en el campo "Link de pago".
3. Haz clic en **Guardar**.

El botón aparecerá en tu perfil inmediatamente.`,
    links: [{ label: 'Ir a Herramientas', tab: 'herramientas' }],
  },
  {
    id: 'herramientas-whatsapp',
    category: 'Herramientas',
    icon: '📱',
    title: 'Activar visibilidad de WhatsApp',
    content: `Por defecto, tu número de WhatsApp **no es visible** en tu perfil público. Puedes activarlo desde el plan **Silver**.

Pasos:
1. Ve a **Herramientas**.
2. En la sección "Visibilidad de WhatsApp", activa el toggle.
3. Se guarda automáticamente.

Cuando está activado, los migrantes ven un botón de WhatsApp en tu perfil y pueden contactarte directamente.

⚠️ Asegúrate de haber ingresado tu número en Mi Perfil antes de activar esta opción.`,
    links: [{ label: 'Ir a Herramientas', tab: 'herramientas' }],
  },
  {
    id: 'herramientas-email',
    category: 'Herramientas',
    icon: '✉️',
    title: 'Email de redirección de consultas',
    content: `Disponible en el plan **Gold**. Permite que las consultas de migrantes lleguen también a tu correo personal, además del inbox de SoyManada.

Pasos:
1. Ve a **Herramientas → Herramientas avanzadas**.
2. Ingresa tu email en el campo "Email para redirección de consultas".
3. Haz clic en **Guardar**.

A partir de ese momento, cada mensaje nuevo en tu inbox de SoyManada también te llegará a ese correo.`,
    links: [{ label: 'Ir a Herramientas', tab: 'herramientas' }],
  },
  {
    id: 'herramientas-respuestas',
    category: 'Herramientas',
    icon: '💬',
    title: 'Respuestas predefinidas',
    content: `Disponible en el plan **Gold**. Las respuestas predefinidas son textos que puedes guardar y usar rápidamente al responder mensajes, sin tener que escribirlos desde cero cada vez.

Cómo configurarlas:
1. Ve a **Herramientas → Herramientas avanzadas**.
2. En el campo "Respuestas predefinidas", escribe cada respuesta en una línea separada.
3. Haz clic en **Guardar**.

Ejemplo de respuestas útiles:
• "Mi primera consulta es gratuita y dura 30 minutos."
• "Opero de lunes a viernes de 9 a 18 hrs (hora Santiago)."
• "Puedes agendar directamente desde mi perfil."`,
    links: [{ label: 'Ir a Herramientas', tab: 'herramientas' }],
  },

  // ── RESERVAS ──────────────────────────────────────────────────
  {
    id: 'reservas-gestionar',
    category: 'Reservas',
    icon: '🗓',
    title: 'Cómo gestionar reservas pendientes',
    content: `Cuando un migrante reserva una cita contigo, aparece en la pestaña **Reservas** con estado "Pendiente".

Acciones disponibles:
• **Confirmar** — acepta la reserva. El migrante recibe un email de confirmación con el link a la sala de videollamada.
• **Rechazar** — cancela la reserva. El migrante es notificado.

Una vez confirmada, la reserva pasa a la sección "Confirmadas". Cuando la cita se realice, márcala como **Completada** para habilitar la solicitud de reseña al migrante.

Las reservas requieren el plan **Silver o superior**.`,
    links: [{ label: 'Ir a Reservas', tab: 'reservas' }],
  },
  {
    id: 'reservas-confirmacion-email',
    category: 'Reservas',
    icon: '📧',
    title: 'Qué recibe el migrante al confirmar',
    content: `Cuando confirmas una reserva, SoyManada envía automáticamente dos emails:

**Al migrante:**
- Asunto: "Tu cita con [tu nombre] fue confirmada – SoyManada"
- Contenido: fecha y hora de la cita, notas si las hay, y un botón para entrar a la sala de videollamada en SoyManada.

**A ti (proveedor):**
- Asunto: "Cita confirmada con [nombre del migrante] – SoyManada"
- Contenido: resumen de la cita y link a la sala.

La sala de videollamada se genera automáticamente al confirmar y es accesible desde \`soymanada.github.io/website/sala/[id-reserva]\`.

No necesitas hacer nada adicional — el sistema se encarga de todo.`,
    links: [{ label: 'Ir a Reservas', tab: 'reservas' }],
  },

  // ── PLANES ────────────────────────────────────────────────────
  {
    id: 'planes-diferencias',
    category: 'Planes',
    icon: '💎',
    title: 'Diferencias entre Bronze, Silver y Gold',
    content: `SoyManada tiene tres planes para proveedores:

**🥉 Bronze — Gratis**
- Perfil público en el directorio
- Inbox de mensajes básico
- Sin agenda ni reservas

**🥈 Silver — $4.990 CLP/mes**
- Todo lo de Bronze
- Agenda de citas y reservas
- Visibilidad de WhatsApp en perfil
- Métricas de visitas y contactos
- Link de agenda externa (Calendly, etc.)

**🥇 Gold — $14.990 CLP/mes**
- Todo lo de Silver
- Email de redirección de consultas
- Respuestas predefinidas
- Link de pago en perfil (Wise, etc.)
- Traducciones automáticas (EN/FR)

Puedes cambiar de plan en cualquier momento desde la pestaña **Mi Plan**.`,
    links: [{ label: 'Ver Mi Plan', tab: 'miplan' }],
  },
  {
    id: 'planes-trial',
    category: 'Planes',
    icon: '🎁',
    title: 'Cómo activar el trial gratuito',
    content: `Los nuevos proveedores reciben un período de **Gold gratuito** para probar todas las herramientas sin costo.

• **Early Bird (hasta el 30 Jun 2026):** 3 meses gratis de Gold.
• **Después del Early Bird:** 1 mes gratis de Gold.

Cómo activarlo:
1. Ve a la pestaña **Mi Plan**.
2. Si eres elegible, verás el banner "Gold GRATIS".
3. Haz clic en **Activar X meses Gold gratis**.
4. El plan se activa inmediatamente, sin tarjeta de crédito.

El trial se puede usar una sola vez. Cuando termine, el plan vuelve a Bronze automáticamente a menos que actives una suscripción.`,
    links: [{ label: 'Ir a Mi Plan', tab: 'miplan' }],
  },
]

const CATEGORIES = [...new Set(ARTICLES.map(a => a.category))]

export default function ManualProveedor({ onNavigate }) {
  const [search,      setSearch]      = useState('')
  const [openId,      setOpenId]      = useState(null)
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
      // Bold via **text**
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

      {/* Lista de artículos — agrupados por categoría cuando no hay búsqueda */}
      {!search && activeCategory === 'Todos'
        ? CATEGORIES.map(cat => {
            const catArticles = filtered.filter(a => a.category === cat)
            if (catArticles.length === 0) return null
            return (
              <div key={cat} className="manual__group">
                <h3 className="manual__group-title t-sm">{cat}</h3>
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
