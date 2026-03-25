// src/pages/ProviderDashboard.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import MetricsSummary      from '../components/dashboard/MetricsSummary'
import WeeklyActivity      from '../components/dashboard/WeeklyActivity'
import AutoRecommendations from '../components/dashboard/AutoRecommendations'
import './ProviderDashboard.css'

// ── Editor de perfil ─────────────────────────────────────────────
function ProviderProfileEditor({ provider, tier, onSave, saving }) {
  const [form, setForm] = useState({
    name:                provider?.name                ?? '',
    description:         provider?.description         ?? '',
    service:             provider?.service             ?? '',
    languages:           (provider?.languages ?? []).join(', '),
    countries:           (provider?.countries ?? []).join(', '),
    payment_link:        provider?.payment_link        ?? '',
    calendar_link:       provider?.calendar_link       ?? '',
    redirect_email:      provider?.redirect_email      ?? '',
    predefined_responses:(provider?.predefined_responses ?? []).join('\n'),
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">Mi perfil</h2>
        <p className="t-sm pdash__section-sub">Esto es exactamente lo que los migrantes ven de ti.</p>
      </div>

      <div className="pdash__form">
        <div className="pdash__field">
          <label className="pdash__label t-sm">Nombre / Marca</label>
          <input className="pdash__input" value={form.name}
            onChange={e => set('name', e.target.value)} placeholder="Tu nombre o marca" />
        </div>
        <div className="pdash__field">
          <label className="pdash__label t-sm">Servicio principal</label>
          <input className="pdash__input" value={form.service}
            onChange={e => set('service', e.target.value)} placeholder="Ej: Asesoría migratoria a Canadá" />
        </div>
        <div className="pdash__field pdash__field--full">
          <label className="pdash__label t-sm">Descripción</label>
          <textarea className="pdash__textarea" rows={4} value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Cuéntale al migrante quién eres y cómo puedes ayudarlo." />
        </div>
        <div className="pdash__field">
          <label className="pdash__label t-sm">Países donde operas</label>
          <input className="pdash__input" value={form.countries}
            onChange={e => set('countries', e.target.value)} placeholder="Canadá, Chile (separados por coma)" />
        </div>
        <div className="pdash__field">
          <label className="pdash__label t-sm">Idiomas</label>
          <input className="pdash__input" value={form.languages}
            onChange={e => set('languages', e.target.value)} placeholder="Español, Inglés" />
        </div>

        <div className="pdash__field pdash__field--full pdash__divider-section">
          <p className="label pdash__section-label">Contacto y pagos</p>
        </div>

        <div className="pdash__field pdash__field--full">
          <label className="pdash__label t-sm">
            Link de pago
            <span className="pdash__badge pdash__badge--gold">Gold</span>
          </label>
          <input className="pdash__input" value={form.payment_link}
            onChange={e => set('payment_link', e.target.value)}
            placeholder="https://wise.com/pay/..." disabled={tier !== 'gold'} />
        </div>

        <div className="pdash__field pdash__field--full pdash__divider-section">
          <p className="label pdash__section-label">Herramientas de atención
            <span className="pdash__badge pdash__badge--gold" style={{ marginLeft: 10 }}>Gold</span>
          </p>
        </div>

        <div className="pdash__field">
          <label className="pdash__label t-sm">📅 Link de agenda</label>
          <input className="pdash__input" value={form.calendar_link}
            onChange={e => set('calendar_link', e.target.value)}
            placeholder="https://calendly.com/..." disabled={tier !== 'gold'} />
        </div>
        <div className="pdash__field">
          <label className="pdash__label t-sm">✉️ Email de redirección</label>
          <input className="pdash__input" type="email" value={form.redirect_email}
            onChange={e => set('redirect_email', e.target.value)}
            placeholder="tu@email.com" disabled={tier !== 'gold'} />
        </div>
        <div className="pdash__field pdash__field--full">
          <label className="pdash__label t-sm">💬 Respuestas predefinidas (una por línea)</label>
          <textarea className="pdash__textarea" rows={5}
            value={form.predefined_responses}
            onChange={e => set('predefined_responses', e.target.value)}
            placeholder={"¿Cuánto cuesta una consulta?\nMi primera sesión es gratuita."} disabled={tier !== 'gold'} />
        </div>

        {tier !== 'gold' && (
          <div className="pdash__field--full pdash__upgrade-inline">
            <p className="t-sm">Las herramientas de atención están disponibles en <strong>Gold ($15/mes)</strong>.</p>
            <a href="mailto:hola@soymanada.com?subject=Quiero Gold" className="btn btn-primary btn-sm">
              <span>Activar Gold</span>
            </a>
          </div>
        )}

        <div className="pdash__field--full pdash__verified-notice">
          <span className="pdash__badge pdash__badge--verified">✦ Verificado por Manada</span>
          <p className="t-xs" style={{ color: 'var(--text-500)' }}>Este badge lo asigna el equipo. No es editable.</p>
        </div>

        <button className="btn btn-primary pdash__save-btn" onClick={() => onSave(form)} disabled={saving}>
          <span>{saving ? 'Guardando…' : 'Guardar cambios'}</span>
        </button>
      </div>
    </div>
  )
}

// ── Sección Herramientas (Gold) ─────────────────────────────────
function SectionHerramientas({ tier, provider, onSave, saving }) {
  const locked = tier !== 'gold'
  const [form, setForm] = useState({
    calendar_link:        provider?.calendar_link        ?? '',
    redirect_email:       provider?.redirect_email       ?? '',
    predefined_responses: (provider?.predefined_responses ?? []).join('\n'),
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">
          Herramientas
          {locked && <span className="pdash__badge pdash__badge--gold">Gold</span>}
        </h2>
        <p className="t-sm pdash__section-sub">Automatiza tu atención y ahorra tiempo.</p>
      </div>

      {locked ? (
        <div className="pdash__locked">
          <div className="pdash__tools-preview">
            {[
              { icon: '📅', name: 'Agenda de llamada',       desc: 'Los migrantes reservan un horario contigo directamente.' },
              { icon: '💬', name: 'Respuestas predefinidas',  desc: 'Responde preguntas frecuentes con un click.' },
              { icon: '✉️',  name: 'Redirección a email',      desc: 'Recibe consultas con asunto pre-llenado en tu correo.' },
            ].map(t => (
              <div key={t.name} className="pdash__tool-card pdash__tool-card--locked">
                <span className="pdash__tool-icon">{t.icon}</span>
                <div>
                  <strong className="t-sm">{t.name}</strong>
                  <p className="t-xs" style={{ color: 'var(--text-300)' }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="pdash__upgrade-cta">
            <p className="t-sm"><strong>Activa Gold</strong> por $15 USD/mes y desbloquea todas las herramientas.</p>
            <a href="mailto:hola@soymanada.com?subject=Quiero Gold" className="btn btn-primary btn-sm">
              <span>Activar Gold — $15/mes</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="pdash__form">
          <div className="pdash__field pdash__field--full">
            <label className="pdash__label t-sm">📅 Link de agenda (Calendly, Cal.com, etc.)</label>
            <input className="pdash__input" value={form.calendar_link}
              onChange={e => set('calendar_link', e.target.value)} placeholder="https://calendly.com/tu-nombre" />
          </div>
          <div className="pdash__field pdash__field--full">
            <label className="pdash__label t-sm">✉️ Email para redirección de consultas</label>
            <input className="pdash__input" type="email" value={form.redirect_email}
              onChange={e => set('redirect_email', e.target.value)} placeholder="tu@email.com" />
          </div>
          <div className="pdash__field pdash__field--full">
            <label className="pdash__label t-sm">💬 Respuestas predefinidas (una por línea)</label>
            <textarea className="pdash__textarea" rows={5}
              value={form.predefined_responses}
              onChange={e => set('predefined_responses', e.target.value)}
              placeholder="¿Cuánto cuesta una consulta?\nMi primera sesión es gratuita." />
          </div>
          <button className="btn btn-primary pdash__save-btn" onClick={() => onSave({
            ...provider,
            calendar_link:        form.calendar_link,
            redirect_email:       form.redirect_email,
            predefined_responses: form.predefined_responses,
          })} disabled={saving}>
            <span>{saving ? 'Guardando…' : 'Guardar herramientas'}</span>
          </button>
        </div>
      )}
    </div>
  )
}

// ── Sección métricas completa ────────────────────────────────────
function SectionMetricas({ tier, metrics, activity, hourlyActivity, feedback, provider, metricsLoading }) {
  const locked = tier === 'bronze' || !tier

  if (locked) return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">
          Métricas <span className="pdash__badge pdash__badge--silver">Silver</span>
        </h2>
        <p className="t-sm pdash__section-sub">Entiende cómo los migrantes interactúan con tu perfil.</p>
      </div>
      <div className="pdash__locked">
        <MetricsSummary metrics={null} loading={true} />
        <div className="pdash__upgrade-cta">
          <p className="t-sm"><strong>Activa Silver</strong> por $5 USD/mes y desbloquea tus métricas en tiempo real.</p>
          <a href="mailto:hola@soymanada.com?subject=Quiero Silver" className="btn btn-primary btn-sm">
            <span>Activar Silver — $5/mes</span>
          </a>
        </div>
      </div>
    </div>
  )

  return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">Métricas</h2>
        <p className="t-sm pdash__section-sub">Últimos 7 días.</p>
      </div>

      <MetricsSummary metrics={metrics} loading={metricsLoading} />

      <div className="pdash__subsection-title label" style={{ marginTop: 8 }}>Actividad por día</div>
      <WeeklyActivity activity={activity} loading={metricsLoading} />

      <div className="pdash__subsection-title label" style={{ marginTop: 8 }}>Recomendaciones</div>
      <AutoRecommendations
        metrics={metrics}
        activity={activity}
        hourlyActivity={hourlyActivity}
        feedback={feedback}
        provider={provider}
      />
    </div>
  )
}

// ── Dashboard principal ──────────────────────────────────────────
export default function ProviderDashboard() {
  const { user, tier, signOut } = useAuth()
  const [provider,      setProvider]      = useState(null)
  const [metrics,       setMetrics]       = useState(null)
  const [activity,      setActivity]      = useState([])
  const [hourlyActivity,setHourlyActivity]= useState([])
  const [feedback,      setFeedback]      = useState([])
  const [loading,       setLoading]       = useState(true)
  const [metricsLoading,setMetricsLoading]= useState(true)
  const [saving,        setSaving]        = useState(false)
  const [toast,         setToast]         = useState(null)
  const [activeTab,     setActiveTab]     = useState('perfil')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (data) setProvider(data)
      setLoading(false)

      // Métricas solo para silver/gold
      if (tier === 'silver' || tier === 'gold') {
        setMetricsLoading(true)
        const [mRes, aRes, hRes, fRes] = await Promise.all([
          supabase.from('provider_metrics').select('*').eq('provider_id', data?.id).single(),
          supabase.from('provider_activity_weekly').select('dow, views, contacts').eq('provider_id', data?.id),
          supabase.from('provider_activity_hourly').select('hour_utc, views').eq('provider_id', data?.id),
          supabase.from('provider_feedback_keywords').select('keyword, count').eq('provider_id', data?.id).gte('count', 2),
        ])
        if (mRes.data)  setMetrics(mRes.data)
        if (aRes.data)  setActivity(aRes.data)
        if (hRes.data)  setHourlyActivity(hRes.data)
        if (fRes.data)  setFeedback(fRes.data)
        setMetricsLoading(false)
      }
    }
    if (user) load()
  }, [user, tier])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async (form) => {
    setSaving(true)
    const { error } = await supabase
      .from('providers')
      .update({
        name:                 form.name,
        description:          form.description,
        service:              form.service,
        languages:            form.languages.split(',').map(s => s.trim()).filter(Boolean),
        countries:            form.countries.split(',').map(s => s.trim()).filter(Boolean),
        payment_link:         form.payment_link,
        calendar_link:        form.calendar_link,
        redirect_email:       form.redirect_email,
        predefined_responses: form.predefined_responses.split('\n').filter(Boolean),
      })
      .eq('user_id', user.id)
    setSaving(false)
    if (error) showToast('Error al guardar.', 'error')
    else { showToast('Perfil guardado correctamente.'); setProvider(p => ({ ...p, ...form })) }
  }

  const tabs = [
    { id: 'perfil',       label: '👤 Mi perfil' },
    { id: 'metricas',     label: '📊 Métricas' },
    { id: 'herramientas', label: '🛠 Herramientas' },
  ]

  return (
    <main className="pdash">
      <div className="pdash__hero">
        <div className="pdash__hero-orb" aria-hidden="true" />
        <div className="container">
          <div className="pdash__hero-inner">
            <div>
              <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)' }}>
                <span className="eyebrow-dot" style={{ background: '#4ade80' }} />
                Panel de proveedor
              </p>
              <h1 className="d-lg pdash__hero-title">
                {provider?.name ?? user?.user_metadata?.full_name ?? 'Mi perfil'}
              </h1>
            </div>
            <div className="pdash__hero-right">
              <div className={`pdash__tier-badge pdash__tier-badge--${tier ?? 'bronze'}`}>
                <span className="pdash__tier-dot" />
                {tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Bronze'}
              </div>
              <button className="pdash__signout t-sm" onClick={signOut}>Cerrar sesión</button>
            </div>
          </div>
          <div className="pdash__tabs">
            {tabs.map(t => (
              <button key={t.id}
                className={`pdash__tab${activeTab === t.id ? ' pdash__tab--active' : ''}`}
                onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pdash__body section">
        <div className="container pdash__container">
          {loading ? (
            <div className="pdash__loading">
              <div className="pdash__spinner" />
              <p className="t-sm" style={{ color: 'var(--text-300)' }}>Cargando tu perfil…</p>
            </div>
          ) : (
            <>
              {activeTab === 'perfil' && (
                <ProviderProfileEditor provider={provider} tier={tier} onSave={handleSave} saving={saving} />
              )}
              {activeTab === 'metricas' && (
                <SectionMetricas
                  tier={tier} metrics={metrics} activity={activity}
                  hourlyActivity={hourlyActivity} feedback={feedback}
                  provider={provider} metricsLoading={metricsLoading}
                />
              )}
              {activeTab === 'herramientas' && (
                <SectionHerramientas tier={tier} provider={provider} onSave={handleSave} saving={saving} />
              )}
            </>
          )}
        </div>
      </div>

      {toast && (
        <div className={`pdash__toast pdash__toast--${toast.type}`}>{toast.msg}</div>
      )}
    </main>
  )
}
