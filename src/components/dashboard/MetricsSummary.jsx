// src/components/dashboard/MetricsSummary.jsx
// Componente 1 — 4 KPIs: visitas, contactos, conversión, puntaje
// Mientras el backend no esté listo usa datos mock estructurados
import './MetricsSummary.css'

function KpiCard({ label, value, sub, accent, loading }) {
  if (loading) return (
    <div className="kpi">
      <div className="kpi__skeleton kpi__skeleton--n" />
      <div className="kpi__skeleton kpi__skeleton--label" />
    </div>
  )
  return (
    <div className={`kpi${accent ? ' kpi--accent' : ''}`}>
      <span className="kpi__n">{value ?? '—'}</span>
      <span className="kpi__label t-xs">{label}</span>
      {sub && <span className="kpi__sub t-xs">{sub}</span>}
    </div>
  )
}

export default function MetricsSummary({ metrics, loading }) {
  const views    = metrics?.profile_views_week    ?? null
  const contacts = metrics?.contact_clicks_week   ?? null
  const rate     = (views && contacts && views > 0)
    ? `${((contacts / views) * 100).toFixed(1)}%`
    : null
  const score    = metrics?.avg_score
    ? metrics.avg_score.toFixed(1)
    : null
  const reviews  = metrics?.review_count ?? null

  return (
    <div className="metrics-summary">
      <KpiCard loading={loading} label="Visitas esta semana"   value={views}    />
      <KpiCard loading={loading} label="Clics en contacto"     value={contacts} />
      <KpiCard loading={loading} label="Tasa de conversión"    value={rate}     accent />
      <KpiCard loading={loading} label="Puntaje promedio"      value={score}
        sub={reviews != null ? `${reviews} reseña${reviews !== 1 ? 's' : ''}` : null} />
    </div>
  )
}
