// src/pages/ProviderDashboard.jsx — Dashboard del proveedor
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import './ProviderDashboard.css'

// ── Sección 1: Mi Perfil ─────────────────────────────────────────
function SectionPerfil({ provider, onSave, saving }) {
  const [form, setForm] = useState({
    name:        provider?.name        ?? '',
    description: provider?.description ?? '',
    service:     provider?.service     ?? '',
    languages:   (provider?.languages  ?? []).join(', '),
    countries:   (provider?.countries  ?? []).join(', '),
    payment_link:provider?.payment_link ?? '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">Mi perfil</h2>
        <p className="t-sm pdash__section-sub">Esto es lo que los migrantes ven de ti en el directorio.</p>
      </div>

      <div className="pdash__form">
        <div className="pdash__field">
          <label className="pdash__label t-sm">Nombre / Marca</label>
          <input className="pdash__input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Tu nombre o nombre de tu servicio" />
        </div>
        <div className="pdash__field">
          <label className="pdash__label t-sm">Servicio principal</label>
          <input className="pdash__input" value={form.service} onChange={e => set('service', e.target.value)} placeholder="Ej: Asesoría migratoria a Canadá" />
        </div>
        <div className="pdash__field pdash__field--full">
          <label className="pdash__label t-sm">Descripción</label>
          <textarea className="pdash__textarea" rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Cuéntale al migrante quién eres y cómo puedes ayudarlo." />
        </div>
        <div className="pdash__field">
          <label className="pdash__label t-sm">Países donde operas</label>
          <input className="pdash__input" value={form.countries} onChange={e => set('countries', e.target.value)} placeholder="Canadá, Chile, Australia (separados por coma)" />
        </div>
        <div className="pdash__field">
          <label className="pdash__label t-sm">Idiomas</label>
          <input className="pdash__input" value={form.languages} onChange={e => set('languages', e.target.value)} placeholder="Español, Inglés" />
        </div>
        <div className="pdash__field pdash__field--full">
          <label className="pdash__label t-sm">Link de pago <span className="pdash__badge pdash__badge--pro">Pro</span></label>
          <input className="pdash__input" value={form.payment_link} onChange={e => set('payment_link', e.target.value)} placeholder="https://wise.com/pay/... o PayPal, e-transfer, etc." />
          <p className="t-xs pdash__field-hint">Solo visible para migrantes. Disponible en capa Pro.</p>
        </div>

        <div className="pdash__field--full pdash__verified-notice">
          <span className="pdash__badge pdash__badge--verified">✦ Verificado por Manada</span>
          <p className="t-xs">Este badge lo asigna el equipo de Manada. No puedes modificarlo.</p>
        </div>

        <button className="btn btn-primary pdash__save-btn" onClick={() => onSave(form)} disabled={saving}>
          <span>{saving ? 'Guardando…' : 'Guardar cambios'}</span>
        </button>
      </div>
    </div>
  )
}

// ── Sección 2: Mis Métricas ──────────────────────────────────────
function SectionMetricas({ tier, metrics }) {
  const locked = tier === 'bronze' || !tier
  return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">
          Mis métricas
          {locked && <span className="pdash__badge pdash__badge--silver">Silver</span>}
        </h2>
        <p className="t-sm pdash__section-sub">Entiende cómo los migrantes interactúan con tu perfil.</p>
      </div>

      {locked ? (
        <div className="pdash__locked">
          <div className="pdash__locked-grid">
            {['Visitas esta semana', 'Clics en contacto', 'Reseñas', 'Puntaje promedio'].map(m => (
              <div key={m} className="pdash__metric-card pdash__metric-card--blur">
                <span className="pdash__metric-n">—</span>
                <span className="pdash__metric-label t-xs">{m}</span>
              </div>
            ))}
          </div>
          <div className="pdash__upgrade-cta">
            <p className="t-sm"><strong>Activa Silver</strong> por $5 USD/mes y desbloquea tus métricas.</p>
            <a href="mailto:hola@soymanada.com?subject=Quiero Silver" className="btn btn-primary btn-sm">
              <span>Activar Silver — $5/mes</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="pdash__metrics-grid">
          <div className="pdash__metric-card">
            <span className="pdash__metric-n">{metrics?.profile_views_week ?? 0}</span>
            <span className="pdash__metric-label t-xs">Visitas esta semana</span>
          </div>
          <div className="pdash__metric-card">
            <span className="pdash__metric-n">{metrics?.contact_clicks_week ?? 0}</span>
            <span className="pdash__metric-label t-xs">Clics en contacto</span>
          </div>
          <div className="pdash__metric-card">
            <span className="pdash__metric-n">{metrics?.review_count ?? 0}</span>
            <span className="pdash__metric-label t-xs">Reseñas</span>
          </div>
          <div className="pdash__metric-card">
            <span className="pdash__metric-n">{metrics?.avg_score ? metrics.avg_score.toFixed(1) : '—'}</span>
            <span className="pdash__metric-label t-xs">Puntaje promedio</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sección 3: Mis Herramientas ──────────────────────────────────
function SectionHerramientas({ tier, provider, onSave, saving }) {
  const locked = tier !== 'gold'
  const [form, setForm] = useState({
    calendar_link:        provider?.calendar_link        ?? '',
    redirect_email:       provider?.redirect_email       ?? '',
    predefined_responses: provider?.predefined_responses ?? [],
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">
          Mis herramientas
          {locked && <span className="pdash__badge pdash__badge--gold">Gold</span>}
        </h2>
        <p className="t-sm pdash__section-sub">Automatiza tu atención y ahorra tiempo.</p>
      </div>

      {locked ? (
        <div className="pdash__locked">
          <div className="pdash__tools-preview">
            {[
              { icon: '📅', name: 'Agenda de llamada', desc: 'Los migrantes reservan un horario contigo directamente.' },
              { icon: '💬', name: 'Respuestas predefinidas', desc: 'Responde las preguntas frecuentes con un click.' },
              { icon: '✉️', name: 'Redirección a email', desc: 'Recibe consultas con asunto pre-llenado en tu correo.' },
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
            <input className="pdash__input" value={form.calendar_link} onChange={e => set('calendar_link', e.target.value)} placeholder="https://calendly.com/tu-nombre" />
          </div>
          <div className="pdash__field pdash__field--full">
            <label className="pdash__label t-sm">✉️ Email para redirección de consultas</label>
            <input className="pdash__input" type="email" value={form.redirect_email} onChange={e => set('redirect_email', e.target.value)} placeholder="tu@email.com" />
            <p className="t-xs pdash__field-hint">Los migrantes que usen "Contactar por email" llegarán aquí con asunto pre-llenado.</p>
          </div>
          <div className="pdash__field pdash__field--full">
            <label className="pdash__label t-sm">💬 Respuestas predefinidas (una por línea)</label>
            <textarea
              className="pdash__textarea" rows={5}
              value={form.predefined_responses.join('\n')}
              onChange={e => set('predefined_responses', e.target.value.split('\n'))}
              placeholder={"¿Cuánto cuesta una consulta?\nMi primera sesión es gratuita de 30 minutos.\n¿Trabajas con residentes permanentes?"}
            />
          </div>
          <button className="btn btn-primary pdash__save-btn" onClick={() => onSave(form)} disabled={saving}>
            <span>{saving ? 'Guardando…' : 'Guardar herramientas'}</span>
          </button>
        </div>
      )}
    </div>
  )
}

// ── Dashboard principal ──────────────────────────────────────────
export default function ProviderDashboard() {
  const { user, tier, signOut } = useAuth()
  const [provider, setProvider] = useState(null)
  const [metrics,  setMetrics]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState(null)
  const [activeTab, setActiveTab] = useState('perfil')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      // Buscar el proveedor asociado al usuario por email
      const { data } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (data) setProvider(data)

      // Métricas (solo si tier >= activa)
      if (tier === 'silver' || tier === 'gold') {
        const { data: m } = await supabase
          .from('provider_metrics')
          .select('*')
          .eq('provider_id', data?.id)
          .single()
        if (m) setMetrics(m)
      }
      setLoading(false)
    }
    if (user) load()
  }, [user, tier])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSavePerfil = async (form) => {
    setSaving(true)
    const { error } = await supabase
      .from('providers')
      .update({
        name:         form.name,
        description:  form.description,
        service:      form.service,
        languages:    form.languages.split(',').map(s => s.trim()).filter(Boolean),
        countries:    form.countries.split(',').map(s => s.trim()).filter(Boolean),
        payment_link: form.payment_link,
      })
      .eq('user_id', user.id)
    setSaving(false)
    if (error) showToast('Error al guardar. Intenta de nuevo.', 'error')
    else { showToast('Perfil actualizado correctamente.'); setProvider(p => ({ ...p, ...form })) }
  }

  const handleSaveHerramientas = async (form) => {
    setSaving(true)
    const { error } = await supabase
      .from('providers')
      .update({
        calendar_link:        form.calendar_link,
        redirect_email:       form.redirect_email,
        predefined_responses: form.predefined_responses.filter(Boolean),
      })
      .eq('user_id', user.id)
    setSaving(false)
    if (error) showToast('Error al guardar.', 'error')
    else showToast('Herramientas guardadas.')
  }

  const tabs = [
    { id: 'perfil',       label: '👤 Mi perfil' },
    { id: 'metricas',     label: '📊 Métricas' },
    { id: 'herramientas', label: '🛠 Herramientas' },
  ]

  return (
    <main className="pdash">
      {/* Header del dashboard */}
      <div className="pdash__hero">
        <div className="pdash__hero-orb" aria-hidden="true" />
        <div className="container">
          <div className="pdash__hero-inner">
            <div>
              <p className="eyebrow">Panel de proveedor</p>
              <h1 className="d-lg pdash__hero-title">
                {provider?.name ?? user?.user_metadata?.full_name ?? 'Mi perfil'}
              </h1>
            </div>
            <div className="pdash__hero-right">
              <div className={`pdash__tier-badge pdash__tier-badge--${tier ?? 'bronze'}`}>
                <span className="pdash__tier-dot" />
                {tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Bronze'}
              </div>
              <button className="pdash__signout t-sm" onClick={signOut}>
                Cerrar sesión
              </button>
            </div>
          </div>
          {/* Tabs */}
          <div className="pdash__tabs">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`pdash__tab${activeTab === t.id ? ' pdash__tab--active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="pdash__body section">
        <div className="container pdash__container">
          {loading ? (
            <div className="pdash__loading">
              <div className="pdash__spinner" />
              <p className="t-sm" style={{ color: 'var(--text-300)' }}>Cargando tu perfil…</p>
            </div>
          ) : (
            <>
              {activeTab === 'perfil'       && <SectionPerfil       provider={provider} onSave={handleSavePerfil}       saving={saving} />}
              {activeTab === 'metricas'     && <SectionMetricas     tier={tier}         metrics={metrics} />}
              {activeTab === 'herramientas' && <SectionHerramientas tier={tier}         provider={provider} onSave={handleSaveHerramientas} saving={saving} />}
            </>
          )}
        </div>
      </div>

      {/* Toast de feedback */}
      {toast && (
        <div className={`pdash__toast pdash__toast--${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </main>
  )
}
