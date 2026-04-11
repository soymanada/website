// src/components/dashboard/MetricsSummary.jsx
// 6 KPIs: descubrimiento (visitas, contactos, conversión)
//         + confianza/respuesta (puntaje, mensajes, tasa de respuesta)
import { useTranslation } from 'react-i18next'
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

export default function MetricsSummary({ metrics, loading, messagingStats }) {
  const { t } = useTranslation()

  const views    = metrics?.profile_views_week    ?? null
  const contacts = metrics?.contact_clicks_week   ?? null
  const rate     = (views && contacts && views > 0)
    ? `${((contacts / views) * 100).toFixed(1)}%`
    : null
  const score    = metrics?.avg_score
    ? metrics.avg_score.toFixed(1)
    : null
  const reviews  = metrics?.review_count ?? null

  const messages  = messagingStats?.total ?? null
  const replyRate = messagingStats?.replyRate != null
    ? `${messagingStats.replyRate}%`
    : null

  return (
    <div className="metrics-summary metrics-summary--6">
      <KpiCard loading={loading} label={t('pdash.metrics_visits')}    value={views}    />
      <KpiCard loading={loading} label={t('pdash.metrics_contacts')}   value={contacts} />
      <KpiCard loading={loading} label={t('pdash.metrics_conversion')} value={rate}     accent />
      <KpiCard loading={loading} label={t('pdash.metrics_rating')}     value={score}
        sub={reviews != null ? t('pdash.metrics_reviews_count', { count: reviews }) : null} />
      <KpiCard loading={loading} label={t('pdash.metrics_messages')}   value={messages} />
      <KpiCard loading={loading} label={t('pdash.metrics_reply_rate')} value={replyRate} accent />
    </div>
  )
}
