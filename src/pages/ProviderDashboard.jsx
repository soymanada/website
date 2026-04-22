// src/pages/ProviderDashboard.jsx
import React, { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import MetricsSummary      from '../components/dashboard/MetricsSummary'
import WeeklyActivity      from '../components/dashboard/WeeklyActivity'
import AutoRecommendations from '../components/dashboard/AutoRecommendations'
import ManualProveedor     from '../components/dashboard/ManualProveedor'
import AvailabilityEditor  from '../components/AvailabilityEditor'
import ProviderInbox       from '../components/ProviderInbox'
import { useDashboardBookings, updateBookingStatus } from '../hooks/useBookings'
import './ProviderDashboard.css'

// ── Avatar uploader ───────────────────────────────────────────────
function AvatarUploader({ provider, onUpload, uploading }) {
  const { t } = useTranslation()
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
        <p className="t-sm" style={{ fontWeight: 600, color: 'var(--text-700)' }}>{t('pdash.avatar_label')}</p>
        <p className="t-xs" style={{ color: 'var(--text-300)' }}>{t('pdash.avatar_hint')}</p>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}
          onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? t('pdash.saving') : t('pdash.avatar_change')}
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
  const { t } = useTranslation()
  const [form, setForm] = useState({
    name:                provider?.name                ?? '',
    description:         provider?.description         ?? '',
    service:             provider?.service             ?? '',
    languages:           (provider?.languages ?? []).join(', '),
    countries:           (provider?.countries ?? []).join(', '),
    whatsapp:            provider?.contact_whatsapp    ?? '',
    calendar_link:       provider?.calendar_link       ?? '',
    redirect_email:      provider?.redirect_email      ?? '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">{t('pdash.tab_perfil_label')}</h2>
        <p className="t-sm pdash__section-sub">{t('pdash.perfil_sub')}</p>
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

        <div className="pdash__field">
          <label className="pdash__label t-sm">{t('pdash.whatsapp_label')}</label>
          <PhoneInput
            international
            defaultCountry="CL"
            value={form.whatsapp}
            onChange={v => set('whatsapp', v ?? '')}
            countryOptionsOrder={['CL', 'CA', 'AR', 'CO', 'VE', 'MX', 'PE', 'ES', '|', '...']}
            className="pdash__phone-input"
          />
        </div>

        <div className="pdash__field--full pdash__verified-notice">
          <span className="pdash__badge pdash__badge--verified" style={{ gap: 6 }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" width="11" height="11" aria-hidden="true">
              <ellipse cx="16" cy="25" rx="8" ry="5.5"/><ellipse cx="4.5" cy="15" rx="3.2" ry="4" transform="rotate(-25,4.5,15)"/>
              <ellipse cx="11" cy="8" rx="3.2" ry="4" transform="rotate(-10,11,8)"/><ellipse cx="21" cy="8" rx="3.2" ry="4" transform="rotate(10,21,8)"/>
              <ellipse cx="27.5" cy="15" rx="3.2" ry="4" transform="rotate(25,27.5,15)"/>
            </svg>
            Verificado por Manada
          </span>
          <p className="t-xs" style={{ color: 'var(--text-500)' }}>{t('pdash.badge_assigned_text')}</p>
        </div>

        <button className="btn btn-primary pdash__save-btn" onClick={() => onSave(form)} disabled={saving}>
          <span>{saving ? t('pdash.saving') : t('pdash.save_changes')}</span>
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
          <span>{saving ? t('pdash.saving') : t('pdash.save_translations')}</span>
        </button>
      </div>
    </div>
  )
}

// ── Sección Herramientas (Silver/Gold) ──────────────────────────
function SectionHerramientas({ tier, provider, onSave, saving }) {
  const { t } = useTranslation()
  const isSilverPlus = tier === 'silver' || tier === 'gold'
  const isGold       = tier === 'gold'
  const [form, setForm] = useState({
    calendar_link:        provider?.calendar_link        ?? '',
    payment_link:         provider?.payment_link         ?? '',
    call_link:            provider?.call_link            ?? '',
    redirect_email:       provider?.redirect_email       ?? '',
    predefined_responses: (() => {
      const raw = provider?.predefined_responses
      if (!Array.isArray(raw) || raw.length === 0) return [{ q: '', a: '' }]
      return raw.map(item => {
        if (typeof item === 'string') {
          const [q, ...rest] = item.split('\n')
          return { q: q ?? '', a: rest.join('\n') ?? '' }
        }
        if (typeof item === 'object' && item !== null) return { q: item.q ?? '', a: item.a ?? '' }
        return { q: '', a: '' }
      })
    })(),
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">{t('pdash.tab_herramientas_label')}</h2>
        <p className="t-sm pdash__section-sub">{t('pdash.herramientas_sub')}</p>
      </div>

      {/* ── WhatsApp visibility — Silver+ ── */}
      <WAVisibilityToggle tier={tier} provider={provider} />

      {/* ── Calendario — Silver+ ── */}
      <div className="pdash__tools-block">
        <div className="pdash__tools-block-header">
          <span className="pdash__tools-block-title t-sm">📅 Calendario de citas</span>
          <span className="pdash__badge pdash__badge--silver">Silver+</span>
        </div>
        {isSilverPlus ? (
          <>
            <div className="pdash__field pdash__field--full" style={{ marginBottom: 16 }}>
              <label className="pdash__label t-sm">Link de agenda (Calendly, Cal.com, etc.)</label>
              <input
                className="pdash__input"
                value={form.calendar_link}
                onChange={e => set('calendar_link', e.target.value)}
                placeholder="https://calendly.com/tu-nombre"
              />
              <p className="t-xs" style={{ color: 'var(--text-300)', marginTop: 4 }}>
                Opcional. Si lo configuras, el migrante verá este link además de la agenda interna.
              </p>
            </div>

            {/* ── Plataforma de videollamada ── */}
            <div className="pdash__field pdash__field--full" style={{ marginBottom: 16 }}>
              <label className="pdash__label t-sm">📹 Plataforma para la llamada</label>

              {tier === 'gold' && (
                <div className="pdash__call-option pdash__call-option--gold" style={{ marginBottom: 10 }}>
                  <span>✅ <strong>Sala Jitsi de SoyManada</strong> — se genera automáticamente al confirmar una reserva.</span>
                  <p className="t-xs" style={{ color: 'var(--text-300)', marginTop: 2 }}>
                    Si configuras un link personalizado abajo, ese link tendrá prioridad sobre la sala Jitsi.
                  </p>
                </div>
              )}

              <input
                className="pdash__input"
                value={form.call_link}
                onChange={e => set('call_link', e.target.value)}
                placeholder="https://zoom.us/j/... · https://meet.google.com/... · https://wa.me/56912345678"
              />
              <p className="t-xs" style={{ color: 'var(--text-300)', marginTop: 4 }}>
                Opcional. Pega aquí el link de Zoom, Google Meet, Teams, Whereby, WhatsApp u otro.
                {tier === 'gold'
                  ? ' Si lo dejas vacío, se usará la sala Jitsi automática.'
                  : ' Este link aparecerá en el email de confirmación y en la reserva del migrante.'}
              </p>
            </div>

            <AvailabilityEditor providerId={provider?.id} />
          </>
        ) : (
          <div className="pdash__tool-card pdash__tool-card--locked">
            <span className="pdash__tool-icon">📅</span>
            <div>
              <strong className="t-sm">Agenda de llamada</strong>
              <p className="t-xs" style={{ color: 'var(--text-300)' }}>Los migrantes reservan un horario contigo directamente desde tu perfil.</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Herramientas avanzadas — Gold ── */}
      <div className="pdash__tools-block" style={{ marginTop: 24 }}>
        <div className="pdash__tools-block-header">
          <span className="pdash__tools-block-title t-sm">🛠 Herramientas avanzadas</span>
          <span className="pdash__badge pdash__badge--gold">Gold</span>
        </div>
        {isGold ? (
          <div className="pdash__form">
            <div className="pdash__field pdash__field--full">
              <label className="pdash__label t-sm">
                💳 Link de pago
                <span className="pdash__badge pdash__badge--gold" style={{ marginLeft: 6 }}>Gold</span>
              </label>
              <input
                className="pdash__input"
                value={form.payment_link}
                onChange={e => set('payment_link', e.target.value)}
                placeholder="https://wise.com/pay/... · https://link.mercadopago.com/..."
              />
              <p className="t-xs" style={{ color: 'var(--text-300)', marginTop: 4 }}>
                Aparece como botón en tu perfil público. Acepta cualquier link de cobro (Wise, MercadoPago, PayPal, etc.).
              </p>
            </div>
            <div className="pdash__field pdash__field--full">
              <label className="pdash__label t-sm">✉️ Email para redirección de consultas</label>
              <input className="pdash__input" type="email" value={form.redirect_email}
                onChange={e => set('redirect_email', e.target.value)} placeholder="tu@email.com" />
            </div>
            <div className="pdash__field pdash__field--full">
              <label className="pdash__label t-sm">
                {t('pdash.predefined_replies_label')}
              </label>
              <p className="t-xs" style={{ color: 'var(--text-300)', marginBottom: 10 }}>
                Define pares de pregunta y respuesta. Aparecerán como respuestas rápidas en tu inbox.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {form.predefined_responses.map((pair, idx) => (
                  <div key={idx} style={{
                    border: '1px solid var(--border-100)',
                    borderRadius: 8,
                    padding: '12px 14px',
                    background: 'var(--bg-100)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="t-xs" style={{ color: 'var(--text-300)', fontWeight: 600 }}>
                        Par #{idx + 1}
                      </span>
                      {form.predefined_responses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => set('predefined_responses',
                            form.predefined_responses.filter((_, i) => i !== idx)
                          )}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-300)', fontSize: 18, lineHeight: 1 }}
                          title="Eliminar par"
                        >×</button>
                      )}
                    </div>
                    <input
                      className="pdash__input"
                      placeholder="¿Cuál es tu tarifa por consulta?"
                      value={pair.q}
                      onChange={e => {
                        const updated = [...form.predefined_responses]
                        updated[idx] = { ...updated[idx], q: e.target.value }
                        set('predefined_responses', updated)
                      }}
                    />
                    <textarea
                      className="pdash__textarea"
                      rows={2}
                      placeholder="Mi consulta inicial es de $50 USD por 30 minutos."
                      value={pair.a}
                      onChange={e => {
                        const updated = [...form.predefined_responses]
                        updated[idx] = { ...updated[idx], a: e.target.value }
                        set('predefined_responses', updated)
                      }}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => set('predefined_responses', [
                  ...form.predefined_responses,
                  { q: '', a: '' }
                ])}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                Agregar pregunta y respuesta
              </button>
            </div>
          </div>
        ) : (
          <div className="pdash__locked">
            <div className="pdash__tools-preview">
              {[
                { icon: '💳', name: 'Link de pago', desc: 'Recibe pagos directamente desde tu perfil público.' },
                { icon: '💬', name: t('pdash.tool_canned_name'), desc: t('pdash.tool_canned_desc') },
                { icon: '✉️', name: t('pdash.tool_redirect_name'), desc: t('pdash.tool_redirect_desc') },
              ].map(tool => (
                <div key={tool.name} className="pdash__tool-card pdash__tool-card--locked">
                  <span className="pdash__tool-icon">{tool.icon}</span>
                  <div>
                    <strong className="t-sm">{tool.name}</strong>
                    <p className="t-xs" style={{ color: 'var(--text-300)' }}>{tool.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pdash__upgrade-cta">
              <p className="t-sm"><strong>Activa Gold</strong> por $14.990 CLP/mes y desbloquea las herramientas avanzadas.</p>
              <UpgradeButton planCode="pro" label="Activar Gold — $14.990 CLP/mes" />
            </div>
          </div>
        )}
      </div>

      {!tier && (
        <div className="pdash__upgrade-cta" style={{ marginTop: 24 }}>
          <p className="t-sm"><strong>Activa Silver</strong> por $4.990 CLP/mes para desbloquear el calendario de citas.</p>
          <UpgradeButton planCode="activa" label="Activar Silver — $4.990 CLP/mes" />
        </div>
      )}

      {(isSilverPlus) && (
        <button className="btn btn-primary pdash__save-btn" style={{ marginTop: 24 }} onClick={() => onSave({
          calendar_link:        form.calendar_link,
          payment_link:         form.payment_link,
          call_link:            form.call_link,
          redirect_email:       form.redirect_email,
          predefined_responses: form.predefined_responses
            .filter(p => p.q.trim() || p.a.trim())
            .map(p => `${p.q.trim()}\n${p.a.trim()}`),
        })} disabled={saving}>
          <span>{saving ? t('pdash.saving') : t('pdash.save_herramientas')}</span>
        </button>
      )}
    </div>
  )
}

// ── Sección métricas completa ────────────────────────────────────
function SectionMetricas({ tier, metrics, activity, hourlyActivity, feedback, provider, metricsLoading, messagingStats }) {
  const { t } = useTranslation()
  const locked = tier === 'bronze' || !tier

  if (locked) return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">
          {t('pdash.tab_metricas_label')} <span className="pdash__badge pdash__badge--silver">Silver</span>
        </h2>
        <p className="t-sm pdash__section-sub">Entiende cómo los migrantes interactúan con tu perfil.</p>
      </div>
      <div className="pdash__locked">
        <MetricsSummary metrics={null} loading={true} />
        <div className="pdash__upgrade-cta">
          <p className="t-sm"><strong>Activa Silver</strong> por $4.990 CLP/mes y desbloquea tus métricas en tiempo real.</p>
          <UpgradeButton planCode="activa" label="Activar Silver — $4.990 CLP/mes" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">{t('pdash.tab_metricas_label')}</h2>
        <p className="t-sm pdash__section-sub">{t('pdash.metricas_sub')}</p>
      </div>

      <MetricsSummary metrics={metrics} loading={metricsLoading} messagingStats={messagingStats} />

      <div className="pdash__subsection-title label" style={{ marginTop: 8 }}>{t('pdash.activity_by_day')}</div>
      <WeeklyActivity activity={activity} loading={metricsLoading} />

      <div className="pdash__subsection-title label" style={{ marginTop: 8 }}>{t('pdash.recommendations')}</div>
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

// ── Sección Reservas ─────────────────────────────────────────────
const STATUS_LABELS = {
  pending:   '⏳ Pendiente',
  confirmed: '✅ Confirmada',
  cancelled: '❌ Cancelada',
  completed: '✔ Completada',
}

// ── WhatsApp visibility toggle (Silver+) ─────────────────────────
function WAVisibilityToggle({ tier, provider }) {
  const { t }          = useTranslation()
  const { user }       = useAuth()
  const isSilverPlus   = tier === 'silver' || tier === 'gold'
  const [enabled, setEnabled] = useState(provider?.show_whatsapp ?? false)
  const [saved,   setSaved]   = useState(false)
  const [saving,  setSaving]  = useState(false)

  const toggle = async (val) => {
    setEnabled(val)
    setSaving(true)
    const { error } = await supabase
      .from('providers')
      .update({ show_whatsapp: val })
      .eq('user_id', user.id)
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      setEnabled(!val)
      console.warn('[WAVisibilityToggle]', error.message)
    }
  }

  return (
    <div className="pdash__tools-block">
      <div className="pdash__tools-block-header">
        <span className="pdash__tools-block-title t-sm">📱 {t('messaging.whatsapp_toggle_section')}</span>
        <span className="pdash__badge pdash__badge--silver">Silver+</span>
      </div>
      {isSilverPlus ? (
        <div className="pdash__wa-toggle-row">
          <div>
            <strong className="t-sm">{t('messaging.whatsapp_toggle')}</strong>
            <p className="t-xs" style={{ color: 'var(--text-300)', marginTop: 2 }}>
              {t('messaging.whatsapp_toggle_hint')}
            </p>
          </div>
          <div className="pdash__wa-toggle-right">
            {saved && <span className="t-xs pdash__saved-tag">✓ {t('messaging.saved')}</span>}
            <label className="pdash__switch-label">
              <input type="checkbox" checked={enabled} onChange={e => toggle(e.target.checked)}
                style={{ display: 'none' }} />
              <span className={`pdash__switch${enabled ? ' pdash__switch--on' : ''}`}
                onClick={() => toggle(!enabled)}>
                <span className="pdash__switch-thumb" />
              </span>
            </label>
          </div>
        </div>
      ) : (
        <div className="pdash__tool-card pdash__tool-card--locked">
          <span className="pdash__tool-icon">📱</span>
          <div>
            <strong className="t-sm">{t('messaging.whatsapp_toggle')}</strong>
            <p className="t-xs" style={{ color: 'var(--text-300)' }}>{t('messaging.whatsapp_tier_lock')}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Mensajes tab ──────────────────────────────────────────────────
function SectionMensajes({ provider }) {
  const { t } = useTranslation()
  return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">{t('messaging.inbox_title')}</h2>
        <p className="t-sm pdash__section-sub">{t('messaging.inbox_sub')}</p>
      </div>
      <ProviderInbox providerId={provider?.id} />
    </div>
  )
}

function SectionReservas({ provider, tier }) {
  const { t } = useTranslation()
  const { bookings, loading, reload } = useDashboardBookings(provider?.id)
  const [updating, setUpdating] = useState(null)
  const isSilverPlus = tier === 'silver' || tier === 'gold'

  if (!isSilverPlus) return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">{t('pdash.tab_reservas_label')}</h2>
        <p className="t-sm pdash__section-sub">{t('pdash.reservas_manage_sub')}</p>
      </div>
      <div className="pdash__locked">
        <div className="pdash__upgrade-cta">
          <p className="t-sm"><strong>Activa Silver</strong> por $4.990 CLP/mes para recibir y gestionar reservas de citas.</p>
          <UpgradeButton planCode="activa" label="Activar Silver — $4.990 CLP/mes" />
        </div>
      </div>
    </div>
  )

  const handleStatus = async (id, newStatus) => {
    setUpdating(id)

    try {
      await updateBookingStatus(id, newStatus)

      const booking = bookings.find(b => b.id === id)

      if (newStatus === 'confirmed' && booking?.user_id && provider?.id) {
        const callLink = provider.call_link
          || (tier === 'gold' ? `https://meet.jit.si/soymanada-${booking.id}` : null)

        supabase.functions.invoke('notify-booking', {
          body: {
            event:         'confirmed',
            booking_id:    booking.id,
            provider_id:   provider.id,
            provider_name: provider.name,
            migrant_id:    booking.user_id,
            start_at:      booking.start_at,
            notes:         booking.notes,
            call_link:     callLink,
          }
        }).catch(() => {})
      }

      if (newStatus === 'completed' && booking?.user_id && provider?.slug && provider?.name) {
        const bookingDate = new Date(booking.start_at).toLocaleDateString('es-CL', {
          weekday: 'long', day: 'numeric', month: 'long',
        })
        supabase.functions.invoke('send-review-request', {
          body: {
            migrant_id:    booking.user_id,
            provider_name: provider.name,
            provider_slug: provider.slug,
            booking_date:  bookingDate,
          }
        }).catch(() => {})
      }

      await reload()
    } finally {
      setUpdating(null)
    }
  }

  const fmtDt = (dt) => new Date(dt).toLocaleDateString('es-CL', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const pending   = bookings.filter(b => b.status === 'pending')
  const confirmed = bookings.filter(b => b.status === 'confirmed')
  const past      = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled')

  if (loading) return (
    <div className="pdash__section">
      <div className="pdash__spinner" style={{ margin: '40px auto' }} />
    </div>
  )

  return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">{t('pdash.tab_reservas_label')}</h2>
        <p className="t-sm pdash__section-sub">{t('pdash.reservas_sub')}</p>
      </div>

      {bookings.length === 0 ? (
        <p className="t-sm" style={{ color: 'var(--text-300)', textAlign: 'center', padding: '40px 0' }}>
          Aún no tienes reservas. Configura tu disponibilidad en la pestaña <strong>Herramientas</strong>.
        </p>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="pdash__bookings-group">
              <h3 className="pdash__bookings-group-title t-sm">⏳ {t('pdash.reservas_pending', { count: pending.length })}</h3>
              {pending.map(b => (
                <div key={b.id} className="pdash__booking-card pdash__booking-card--pending">
                  <div className="pdash__booking-info">
                    <strong className="t-sm">{fmtDt(b.start_at)}</strong>
                    {b.notes && <p className="t-xs pdash__booking-notes">"{b.notes}"</p>}
                  </div>
                  <div className="pdash__booking-actions">
                    <button className="btn btn-primary btn-sm" disabled={updating === b.id}
                      onClick={() => handleStatus(b.id, 'confirmed')}>
                      <span>{t('pdash.reservas_confirm')}</span>
                    </button>
                    <button className="btn btn-ghost btn-sm" disabled={updating === b.id}
                      onClick={() => handleStatus(b.id, 'cancelled')}>
                      <span>{t('pdash.reservas_reject')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {confirmed.length > 0 && (
            <div className="pdash__bookings-group">
              <h3 className="pdash__bookings-group-title t-sm">✅ {t('pdash.reservas_confirmed', { count: confirmed.length })}</h3>
              {confirmed.map(b => (
                <div key={b.id} className="pdash__booking-card pdash__booking-card--confirmed">
                  <div className="pdash__booking-info">
                    <strong className="t-sm">{fmtDt(b.start_at)}</strong>
                    {b.notes && <p className="t-xs pdash__booking-notes">"{b.notes}"</p>}
                  </div>
                  <div className="pdash__booking-actions">
                    <button className="btn btn-ghost btn-sm" disabled={updating === b.id}
                      onClick={() => handleStatus(b.id, 'completed')}>
                      <span>{t('pdash.reservas_complete')}</span>
                    </button>
                    <button className="btn btn-ghost btn-sm" disabled={updating === b.id}
                      onClick={() => handleStatus(b.id, 'cancelled')}>
                      <span>{t('pdash.reservas_cancel')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {past.length > 0 && (
            <div className="pdash__bookings-group">
              <h3 className="pdash__bookings-group-title t-sm">{t('pdash.reservas_past', { count: past.length })}</h3>
              {past.map(b => (
                <div key={b.id} className={`pdash__booking-card pdash__booking-card--${b.status}`}>
                  <div className="pdash__booking-info">
                    <strong className="t-sm">{fmtDt(b.start_at)}</strong>
                    <span className="pdash__booking-status t-xs">{STATUS_LABELS[b.status]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Upgrade button ────────────────────────────────────────────────
function UpgradeButton({ planCode, label }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan_code: planCode, user_id: user?.id },
      })
      if (error) throw error
      if (data?.url) window.location.href = data.url
    } catch (err) {
      console.error('[UpgradeButton]', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button className="btn btn-primary" onClick={handleUpgrade} disabled={loading}>
      <span>{loading ? 'Redirigiendo…' : label}</span>
    </button>
  )
}

// ── Main dashboard ────────────────────────────────────────────────
export default function ProviderDashboard() {
  const { t }    = useTranslation()
  const { user, loading: authLoading } = useAuth()

  const [provider,        setProvider]        = useState(null)
  const [tier,            setTier]            = useState(null)
  const [providerLoading, setProviderLoading] = useState(true)
  const [saving,          setSaving]          = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [saveMsg,         setSaveMsg]         = useState('')
  const [activeTab,       setActiveTab]       = useState('perfil')

  // metrics
  const [metrics,         setMetrics]         = useState(null)
  const [activity,        setActivity]        = useState([])
  const [hourlyActivity,  setHourlyActivity]  = useState([])
  const [feedback,        setFeedback]        = useState([])
  const [metricsLoading,  setMetricsLoading]  = useState(false)
  const [messagingStats,  setMessagingStats]  = useState(null)

  // ── load provider ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    ;(async () => {
      setProviderLoading(true)
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (!error && data) {
        setProvider(data)
        setTier(data.tier ?? null)
      }
      setProviderLoading(false)
    })()
  }, [user])

  // ── load metrics ────────────────────────────────────────────────
  useEffect(() => {
    if (!provider?.id) return
    ;(async () => {
      setMetricsLoading(true)
      const [viewsRes, actRes, hourRes, fbRes, msgRes] = await Promise.all([
        supabase.rpc('get_provider_metrics',      { p_provider_id: provider.id }),
        supabase.rpc('get_provider_weekly_activity', { p_provider_id: provider.id }),
        supabase.rpc('get_provider_hourly_activity', { p_provider_id: provider.id }),
        supabase.from('provider_feedback').select('rating,comment,created_at').eq('provider_id', provider.id).order('created_at', { ascending: false }).limit(10),
        supabase.rpc('get_provider_messaging_stats', { p_provider_id: provider.id }),
      ])
      if (!viewsRes.error)  setMetrics(viewsRes.data?.[0] ?? null)
      if (!actRes.error)    setActivity(actRes.data ?? [])
      if (!hourRes.error)   setHourlyActivity(hourRes.data ?? [])
      if (!fbRes.error)     setFeedback(fbRes.data ?? [])
      if (!msgRes.error)    setMessagingStats(msgRes.data?.[0] ?? null)
      setMetricsLoading(false)
    })()
  }, [provider?.id])

  // ── save handler ─────────────────────────────────────────────────
  const handleSave = async (formData) => {
    if (!user) return
    setSaving(true)
    setSaveMsg('')

    const payload = { ...formData }

    if (typeof payload.languages === 'string')
      payload.languages = payload.languages.split(',').map(s => s.trim()).filter(Boolean)
    if (typeof payload.countries === 'string')
      payload.countries = payload.countries.split(',').map(s => s.trim()).filter(Boolean)

    if ('whatsapp' in payload) {
      payload.contact_whatsapp = payload.whatsapp
      delete payload.whatsapp
    }

    const { error } = await supabase
      .from('providers')
      .update(payload)
      .eq('user_id', user.id)

    setSaving(false)
    if (error) {
      setSaveMsg('❌ ' + error.message)
    } else {
      setProvider(prev => ({ ...prev, ...payload }))
      setSaveMsg('✓ ' + t('pdash.saved_ok'))
      setTimeout(() => setSaveMsg(''), 3000)

      if (payload.description || payload.service) {
        supabase.functions.invoke('translate-provider', {
          body: { provider_id: provider.id }
        }).catch(() => {})
      }
    }
  }

  // ── avatar upload ─────────────────────────────────────────────────
  const handleAvatarUpload = async (file) => {
    if (!user || !provider) return
    setAvatarUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: upErr } = await supabase.storage
      .from('provider-avatars')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (upErr) { setAvatarUploading(false); return }

    const { data: { publicUrl } } = supabase.storage
      .from('provider-avatars')
      .getPublicUrl(path)

    const bust = `${publicUrl}?v=${Date.now()}`
    await supabase.from('providers').update({ avatar_url: bust }).eq('user_id', user.id)
    setProvider(prev => ({ ...prev, avatar_url: bust }))
    setAvatarUploading(false)
  }

  // ── guards ───────────────────────────────────────────────────────
  if (authLoading || providerLoading) return (
    <div className="pdash__loading">
      <div className="pdash__spinner" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (!provider) return (
    <div className="pdash__empty">
      <p>{t('pdash.no_provider')}</p>
      <Link to="/registro-proveedor" className="btn btn-primary">{t('pdash.register_cta')}</Link>
    </div>
  )

  // ── tabs config ──────────────────────────────────────────────────
  const TABS = [
    { id: 'perfil',       icon: '👤', label: t('pdash.tab_perfil_label') },
    { id: 'herramientas', icon: '🛠',  label: t('pdash.tab_herramientas_label') },
    { id: 'metricas',     icon: '📊', label: t('pdash.tab_metricas_label') },
    { id: 'reservas',     icon: '📅', label: t('pdash.tab_reservas_label') },
    { id: 'mensajes',     icon: '💬', label: t('pdash.tab_mensajes_label') },
    { id: 'manual',       icon: '📖', label: 'Manual' },
  ]

  const tierLabel = tier
    ? tier.charAt(0).toUpperCase() + tier.slice(1)
    : null

  return (
    <div className="pdash">

      {/* ── Hero ── */}
      <div className="pdash__hero">
        <div className="pdash__hero-orb" />
        <div className="pdash__hero-inner">
          <div>
            <h1 className="pdash__hero-title d-lg">
              {provider.name || t('pdash.unnamed')}
            </h1>
            {tierLabel && (
              <span className="pdash__tier-badge">
                <span className="pdash__tier-dot" />
                {tierLabel}
              </span>
            )}
          </div>
          <div className="pdash__hero-right">
            {provider.slug && (
              <a
                href={`/proveedor/${provider.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pdash__signout"
              >
                Ver perfil público ↗
              </a>
            )}
            <button
              className="pdash__signout"
              onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Tabs dentro del hero */}
        <div className="pdash__tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`pdash__tab${activeTab === tab.id ? ' pdash__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="pdash__tab-icon">{tab.icon}</span>
              <span className="pdash__tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Save message */}
      {saveMsg && (
        <div className={`pdash__save-msg${saveMsg.startsWith('❌') ? ' pdash__save-msg--error' : ''}`}>
          {saveMsg}
        </div>
      )}

      {/* ── Content ── */}
      <div className="pdash__body">
        <div className="pdash__container">
          {activeTab === 'perfil' && (
            <ProviderProfileEditor
              provider={provider}
              tier={tier}
              onSave={handleSave}
              saving={saving}
              onAvatarUpload={handleAvatarUpload}
              avatarUploading={avatarUploading}
            />
          )}
          {activeTab === 'herramientas' && (
            <SectionHerramientas
              tier={tier}
              provider={provider}
              onSave={handleSave}
              saving={saving}
            />
          )}
          {activeTab === 'metricas' && (
            <SectionMetricas
              tier={tier}
              metrics={metrics}
              activity={activity}
              hourlyActivity={hourlyActivity}
              feedback={feedback}
              provider={provider}
              metricsLoading={metricsLoading}
              messagingStats={messagingStats}
            />
          )}
          {activeTab === 'reservas' && (
            <SectionReservas provider={provider} tier={tier} />
          )}
          {activeTab === 'mensajes' && (
            <SectionMensajes provider={provider} />
          )}
          {activeTab === 'manual' && (
            <ManualProveedor provider={provider} />
          )}
        </div>
      </div>

    </div>
  )
}
