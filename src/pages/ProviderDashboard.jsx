// src/pages/ProviderDashboard.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import MetricsSummary      from '../components/dashboard/MetricsSummary'
import WeeklyActivity      from '../components/dashboard/WeeklyActivity'
import AutoRecommendations from '../components/dashboard/AutoRecommendations'
import './ProviderDashboard.css'

// ── Avatar uploader ───────────────────────────────────────────────
function AvatarUploader({ provider, onUpload, uploading }) {
  const inputRef = React.useRef()
  const src = provider?.avatar_url

  return (
    <div className="pdash__avatar-wrap">
      <div className="pdash__avatar-preview" onClick={() => !uploading && inputRef.current?.click()}>
        {src
          ? <img src={src} alt="Avatar" className="pdash__avatar-img" />
          : <span className="pdash__avatar-placeholder">{(provider?.name || '?')[0].toUpperCase()}</span>
        }
        <div className="pdash__avatar-overlay">
          {uploading ? '…' : '📷'}
        </div>
      </div>
      <div>
        <p className="t-sm" style={{ fontWeight: 600, color: 'var(--text-700)' }}>Foto de perfil</p>
        <p className="t-xs" style={{ color: 'var(--text-300)' }}>JPG o PNG · máx. 2 MB</p>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}
          onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Subiendo…' : 'Cambiar foto'}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }} onChange={e => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
          e.target.value = ''
        }} />
    </div>
  )
}

// ── Editor de perfil ─────────────────────────────────────────────
function ProviderProfileEditor({ provider, tier, onSave, saving, onAvatarUpload, avatarUploading }) {
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

      <AvatarUploader provider={provider} onUpload={onAvatarUpload} uploading={avatarUploading} />

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
          <span className="pdash__badge pdash__badge--verified" style={{ gap: 6 }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" width="11" height="11" aria-hidden="true">
              <ellipse cx="16" cy="25" rx="8" ry="5.5"/><ellipse cx="4.5" cy="15" rx="3.2" ry="4" transform="rotate(-25,4.5,15)"/>
              <ellipse cx="11" cy="8" rx="3.2" ry="4" transform="rotate(-10,11,8)"/><ellipse cx="21" cy="8" rx="3.2" ry="4" transform="rotate(10,21,8)"/>
              <ellipse cx="27.5" cy="15" rx="3.2" ry="4" transform="rotate(25,27.5,15)"/>
            </svg>
            Verificado por Manada
          </span>
          <p className="t-xs" style={{ color: 'var(--text-500)' }}>Este badge lo asigna el equipo. No es editable.</p>
        </div>

        <button className="btn btn-primary pdash__save-btn" onClick={() => onSave(form)} disabled={saving}>
          <span>{saving ? 'Guardando…' : 'Guardar cambios'}</span>
        </button>
      </div>

      {/* Traducciones automáticas */}
      <div className="pdash__translations">
        <div className="pdash__translations-header">
          <h3 className="pdash__section-title" style={{ fontSize: '1.1rem' }}>
            🌐 Traducciones automáticas
          </h3>
          <p className="t-xs" style={{ color: 'var(--text-300)', marginTop: 4 }}>
            Generadas por DeepL al guardar. Puedes editarlas manualmente.
          </p>
        </div>

        {[{ suffix: 'en', flag: 'ca', lang: 'English' }, { suffix: 'fr', flag: 'ca', lang: 'Français (Canada)' }].map(({ suffix, flag, lang }) => (
          <div key={suffix} className="pdash__trans-block">
            <div className="pdash__trans-lang">
              <span className={`fi fi-${flag} pdash__trans-flag`} />
              <span className="t-sm" style={{ fontWeight: 700, color: 'var(--text-700)' }}>{lang}</span>
              {provider?.[`description_${suffix}`]
                ? <span className="pdash__badge pdash__badge--verified" style={{ fontSize: '0.65rem' }}>✔ Traducido</span>
                : <span className="pdash__badge pdash__badge--silver" style={{ fontSize: '0.65rem' }}>Pendiente</span>
              }
            </div>
            <div className="pdash__form" style={{ marginTop: 10 }}>
              <div className="pdash__field">
                <label className="pdash__label t-sm">Servicio ({suffix.toUpperCase()})</label>
                <input className="pdash__input"
                  value={form[`service_${suffix}`] ?? provider?.[`service_${suffix}`] ?? ''}
                  onChange={e => setForm(f => ({ ...f, [`service_${suffix}`]: e.target.value }))}
                  placeholder={provider?.service ?? 'Se generará automáticamente'} />
              </div>
              <div className="pdash__field pdash__field--full">
                <label className="pdash__label t-sm">Descripción ({suffix.toUpperCase()})</label>
                <textarea className="pdash__textarea" rows={3}
                  value={form[`description_${suffix}`] ?? provider?.[`description_${suffix}`] ?? ''}
                  onChange={e => setForm(f => ({ ...f, [`description_${suffix}`]: e.target.value }))}
                  placeholder={provider?.description ?? 'Se generará automáticamente al guardar'} />
              </div>
            </div>
          </div>
        ))}

        <button className="btn btn-secondary pdash__save-btn" onClick={() => onSave({ ...form })} disabled={saving}>
          <span>{saving ? 'Guardando…' : 'Guardar traducciones'}</span>
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
            <p className="t-sm"><strong>Activa Gold</strong> por $20 USD/mes y desbloquea todas las herramientas.</p>
            <a href="mailto:hola@soymanada.com?subject=Quiero Gold" className="btn btn-primary btn-sm">
              <span>Activar Gold — $20 USD/mes</span>
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
          <p className="t-sm"><strong>Activa Silver</strong> por $10 USD/mes y desbloquea tus métricas en tiempo real.</p>
          <a href="mailto:hola@soymanada.com?subject=Quiero Silver" className="btn btn-primary btn-sm">
            <span>Activar Silver — $10 USD/mes</span>
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

// ── Sección Mi Plan ──────────────────────────────────────────────
const CHECK_ICON = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="7" fill="var(--iris-100)"/>
    <path d="M5 8l2.5 2.5 4-4" stroke="var(--iris-600)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const TIERS_DEF = [
  {
    key: 'bronze', icon: '🥉', label: 'Bronze',
    price: 'Gratis', priceLocal: null,
    features: ['Perfil en el directorio', '1 categoría', 'Contacto visible a usuarios registrados', 'Badge verificado (si cumples criterios)'],
    ctaLabel: null,
  },
  {
    key: 'silver', icon: '🥈', label: 'Silver',
    price: '$10 USD', priceLocal: '$9.500 CLP',
    features: ['Perfil en el directorio', 'Hasta 2 categorías', 'Contacto visible a usuarios registrados', 'Badge verificado garantizado', 'Posición prioritaria en resultados', 'Métricas básicas (vistas y clics)', 'Soporte por email'],
    ctaLabel: 'Activar Silver — $10 USD/mes',
  },
  {
    key: 'gold', icon: '🥇', label: 'Gold',
    price: '$20 USD', priceLocal: '$19.000 CLP',
    features: ['Perfil en el directorio', 'Todas las categorías', 'Contacto visible a usuarios registrados', 'Badge verificado garantizado', 'Top 3 garantizado siempre', 'Métricas completas', 'Beneficio exclusivo para usuarios', 'Soporte prioritario', 'Herramientas de atención (agenda, email, respuestas)'],
    ctaLabel: 'Activar Gold — $20 USD/mes',
  },
]

function SectionMiPlan({ tier }) {
  const current = tier ?? 'bronze'

  return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">Mi plan</h2>
        <p className="t-sm pdash__section-sub">Tu plan actual y lo que puedes desbloquear.</p>
      </div>

      {/* Plan actual badge */}
      <div className="pdash__plan-current">
        <span className="pdash__plan-current-label t-xs">Tu plan actual</span>
        <div className={`pdash__plan-current-badge pdash__plan-current-badge--${current}`}>
          {TIERS_DEF.find(t => t.key === current)?.icon} {current.charAt(0).toUpperCase() + current.slice(1)}
        </div>
        {current === 'bronze' && (
          <p className="t-xs" style={{ color: 'var(--text-400)', marginTop: 8 }}>
            Actualiza tu plan para obtener más visibilidad, métricas y herramientas.
          </p>
        )}
        {current === 'silver' && (
          <p className="t-xs" style={{ color: 'var(--text-400)', marginTop: 8 }}>
            Estás en Silver. Pasa a Gold para desbloquear herramientas de atención y el top 3 garantizado.
          </p>
        )}
        {current === 'gold' && (
          <p className="t-xs" style={{ color: 'var(--text-400)', marginTop: 8 }}>
            Estás en el plan máximo. Tienes acceso a todas las funcionalidades.
          </p>
        )}
      </div>

      {/* Comparación de tiers */}
      <div className="pdash__plan-grid">
        {TIERS_DEF.map(t => {
          const isCurrent = t.key === current
          const isLocked  = (current === 'bronze' && t.key !== 'bronze') ||
                            (current === 'silver' && t.key === 'gold')
          return (
            <div key={t.key} className={`pdash__plan-card${isCurrent ? ' pdash__plan-card--active' : ''}${isLocked ? ' pdash__plan-card--upgrade' : ''}`}>
              {isCurrent && (
                <div className="pdash__plan-card-current-tag">Tu plan</div>
              )}
              <div className="pdash__plan-card-top">
                <span className="pdash__plan-card-icon">{t.icon}</span>
                <div>
                  <strong className="t-sm" style={{ color: 'var(--iris-900)' }}>{t.label}</strong>
                  <div className="pdash__plan-card-price">
                    <span className="pdash__plan-card-price-main">{t.price}</span>
                    {t.priceLocal && <span className="t-xs" style={{ color: 'var(--text-300)' }}> · {t.priceLocal}/mes</span>}
                  </div>
                </div>
              </div>
              <ul className="pdash__plan-card-features">
                {t.features.map(f => (
                  <li key={f} className="pdash__plan-card-feature">
                    {CHECK_ICON}
                    <span className="t-xs">{f}</span>
                  </li>
                ))}
              </ul>
              {!isCurrent && t.ctaLabel && (
                <a
                  href={`mailto:hola@soymanada.com?subject=Quiero ${t.label}`}
                  className={`btn btn-sm pdash__plan-card-cta ${t.key === 'gold' ? 'pdash__plan-card-cta--gold' : 'btn-primary'}`}
                >
                  <span>{t.ctaLabel}</span>
                </a>
              )}
            </div>
          )
        })}
      </div>

      <p className="t-xs" style={{ color: 'var(--text-300)', textAlign: 'center' }}>
        Precios en USD · Chile: Silver $9.500 CLP/mes · Gold $19.000 CLP/mes · Sin compromiso, cancela cuando quieras.{' '}
        <Link to="/planes" style={{ color: 'var(--iris-500)' }}>Ver página de planes →</Link>
      </p>
    </div>
  )
}

// ── Dashboard principal ──────────────────────────────────────────
export default function ProviderDashboard() {
  const { user, tier, signOut } = useAuth()
  const [provider,       setProvider]       = useState(null)
  const [metrics,        setMetrics]        = useState(null)
  const [activity,       setActivity]       = useState([])
  const [hourlyActivity, setHourlyActivity] = useState([])
  const [feedback,       setFeedback]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [avatarUploading,setAvatarUploading]= useState(false)
  const [toast,          setToast]          = useState(null)
  const [activeTab,      setActiveTab]      = useState('perfil')

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

  const handleAvatarUpload = async (file) => {
    if (!provider?.id) return
    setAvatarUploading(true)
    const ext = file.name.split('.').pop().toLowerCase()
    const path = `${provider.id}/avatar.${ext}`
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (error) {
      showToast('Error al subir la foto.', 'error')
    } else {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('providers').update({ avatar_url: publicUrl }).eq('id', provider.id)
      setProvider(p => ({ ...p, avatar_url: publicUrl }))
      showToast('Foto actualizada.')
    }
    setAvatarUploading(false)
  }

  const handleSave = async (form) => {
    setSaving(true)
    const { error } = await supabase
      .from('providers')
      .update({
        name:                 form.name,
        description:          form.description,
        service:              form.service,
        languages:            form.languages?.split(',').map(s => s.trim()).filter(Boolean),
        countries:            form.countries?.split(',').map(s => s.trim()).filter(Boolean),
        payment_link:         form.payment_link,
        calendar_link:        form.calendar_link,
        redirect_email:       form.redirect_email,
        predefined_responses: form.predefined_responses?.split('\n').filter(Boolean),
        // Traducciones manuales (el trigger de DeepL las sobrescribe si están vacías)
        ...(form.service_en     !== undefined && { service_en:     form.service_en }),
        ...(form.service_fr     !== undefined && { service_fr:     form.service_fr }),
        ...(form.description_en !== undefined && { description_en: form.description_en }),
        ...(form.description_fr !== undefined && { description_fr: form.description_fr }),
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
    { id: 'miplan',       label: '💎 Mi plan' },
  ]

  return (
    <main className="pdash">
      <div className="pdash__hero">
        <div className="pdash__hero-orb" aria-hidden="true" />
        <div className="container">
          <div className="pdash__hero-inner">
            <div>
              <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" width="13" height="13" aria-hidden="true">
                  <ellipse cx="16" cy="25" rx="8" ry="5.5"/>
                  <ellipse cx="4.5" cy="15" rx="3.2" ry="4" transform="rotate(-25, 4.5, 15)"/>
                  <ellipse cx="11" cy="8" rx="3.2" ry="4" transform="rotate(-10, 11, 8)"/>
                  <ellipse cx="21" cy="8" rx="3.2" ry="4" transform="rotate(10, 21, 8)"/>
                  <ellipse cx="27.5" cy="15" rx="3.2" ry="4" transform="rotate(25, 27.5, 15)"/>
                </svg>
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
                <ProviderProfileEditor provider={provider} tier={tier} onSave={handleSave} saving={saving}
                  onAvatarUpload={handleAvatarUpload} avatarUploading={avatarUploading} />
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
              {activeTab === 'miplan' && (
                <SectionMiPlan tier={tier} />
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
