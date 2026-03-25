// src/components/dashboard/AutoRecommendations.jsx
// Componente 3 — Recomendaciones automáticas evaluadas en cliente
// Sin IA. 3 condiciones sobre datos crudos del backend.
import './AutoRecommendations.css'

// Promedio de conversión por categoría (placeholder hasta tener datos reales)
const CATEGORY_AVG_CONVERSION = {
  seguros:      0.18,
  migracion:    0.22,
  traducciones: 0.25,
  trabajo:      0.15,
  alojamiento:  0.20,
  idiomas:      0.28,
  banca:        0.16,
  'salud-mental': 0.30,
  default:      0.20,
}

// Evalúa si hay actividad nocturna en hora de Canadá (UTC-5)
// activity: [{ hour_utc: 0-23, views: n }]
function hasNightActivity(activity) {
  if (!activity?.length) return false
  // 11pm-3am Toronto = 4am-8am UTC
  const nightHours = [4, 5, 6, 7, 8]
  return activity.some(h => nightHours.includes(h.hour_utc) && h.views > 0)
}

// Evalúa si feedback menciona atributos que no están en la descripción
function hasMissingKeywords(feedback, description) {
  if (!feedback?.length || !description) return false
  const desc = description.toLowerCase()
  const frequent = feedback
    .filter(f => f.count >= 2)
    .map(f => f.keyword.toLowerCase())
  return frequent.some(kw => !desc.includes(kw))
}

export default function AutoRecommendations({ metrics, activity, hourlyActivity, feedback, provider }) {
  const recs = []

  // Condición 1: tasa de conversión < promedio de categoría
  const views    = metrics?.profile_views_week ?? 0
  const contacts = metrics?.contact_clicks_week ?? 0
  const rate     = views > 0 ? contacts / views : 0
  const catAvg   = CATEGORY_AVG_CONVERSION[provider?.categorySlug] ?? CATEGORY_AVG_CONVERSION.default

  if (views >= 5 && rate < catAvg) {
    recs.push({
      id:    'descripcion',
      icon:  '✏️',
      title: 'Mejora tu descripción',
      body:  `Tu tasa de contacto (${(rate * 100).toFixed(1)}%) está por debajo del promedio de tu categoría (${(catAvg * 100).toFixed(0)}%). Una descripción más específica sobre a quién ayudas y cómo puede mejorarla.`,
      cta:   'Editar descripción',
      tab:   'perfil',
    })
  }

  // Condición 2: visitas entre 11pm y 3am hora Canadá
  if (hasNightActivity(hourlyActivity)) {
    recs.push({
      id:    'horario',
      icon:  '🌙',
      title: 'Migrantes te buscan de noche',
      body:  'Detectamos visitas a tu perfil entre las 11pm y 3am hora de Canadá. Considera agregar un mensaje de respuesta fuera de horario o configurar tu agenda para capturar esos leads.',
      cta:   'Configurar agenda',
      tab:   'herramientas',
    })
  }

  // Condición 3: keywords en feedback no están en descripción
  if (hasMissingKeywords(feedback, provider?.description)) {
    const missing = feedback
      .filter(f => f.count >= 2 && !provider.description.toLowerCase().includes(f.keyword.toLowerCase()))
      .slice(0, 3)
      .map(f => f.keyword)
    recs.push({
      id:    'contenido',
      icon:  '💡',
      title: 'Tu perfil no refleja lo que destacan tus clientes',
      body:  `Los migrantes que te contactaron mencionan: "${missing.join('", "')}". Agrega estas palabras a tu descripción para atraer más perfiles similares.`,
      cta:   'Actualizar perfil',
      tab:   'perfil',
    })
  }

  if (!recs.length) return (
    <div className="autorec autorec--empty">
      <span className="autorec__empty-icon">✦</span>
      <p className="t-sm">Tu perfil está optimizado. No hay recomendaciones por ahora.</p>
    </div>
  )

  return (
    <div className="autorec">
      {recs.map(r => (
        <div key={r.id} className="autorec__card">
          <span className="autorec__icon">{r.icon}</span>
          <div className="autorec__body">
            <h4 className="autorec__title t-md">{r.title}</h4>
            <p className="autorec__text t-sm">{r.body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
