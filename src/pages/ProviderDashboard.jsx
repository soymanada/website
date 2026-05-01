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
import { planUiName } from '../config/providerPlans'

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
    payment_link:        provider?.payment_link        ?? '',
  })
  const [payLinkError, setPayLinkError] = useState('')
  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (k === 'payment_link') setPayLinkError('')
  }

  const handleSave = () => {
    if (form.payment_link && !form.payment_link.startsWith('https://')) {
      setPayLinkError(t('errors.url_must_be_https'))
      return
    }
    onSave(form)
  }

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

        {/* Link de pago — disponible para todos los tiers */}
        <div className="pdash__field pdash__field--full">
          <label className="pdash__label t-sm">💳 {t('provider.payment_link_label')}</label>
          <input
            className={`pdash__input${payLinkError ? ' pdash__input--error' : ''}`}
            type="url"
            value={form.payment_link}
            onChange={e => set('payment_link', e.target.value)}
            placeholder="https://mpago.la/tu-link · https://wise.com/pay/..."
          />
          {payLinkError
            ? <p className="t-xs pdash__field-error">{payLinkError}</p>
            : <p className="t-xs" style={{ color: 'var(--text-300)', marginTop: 4 }}>{t('provider.payment_link_hint')}</p>
          }
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

        <button className="btn btn-primary pdash__save-btn" onClick={handleSave} disabled={saving}>
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
                : <span className="pdash__badge pdash__badge--silver" style={{ fontSize: '0.65rem' }}>Pendiente · Cub</span>
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

// ── Stripe Connect block (Wolf) ──────────────────────────────────
function StripeConnectBlock({ provider }) {
  // Estados de onboarding leídos directamente desde la DB (vía provider)
  const accountId      = provider?.stripe_account_id
  const onboardingDone = provider?.stripe_onboarding_complete
  const chargesEnabled = provider?.stripe_charges_enabled
  const payoutsEnabled = provider?.stripe_payouts_enabled

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // Deriva el estado visual
  const stripeStatus = !accountId
    ? 'unconnected'                   // nunca inició onboarding
    : chargesEnabled
      ? 'enabled'                     // puede cobrar
      : onboardingDone
        ? 'requirements_pending'      // completó flujo pero Stripe pide más datos
        : 'onboarding_incomplete'     // tiene cuenta pero no terminó el flujo

  const handleConnect = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('stripe-create-account-link', {
        body: {
          provider_id:  provider?.id,
          return_url:   `${window.location.origin}/mi-perfil?stripe=return`,
          refresh_url:  `${window.location.origin}/mi-perfil?stripe=refresh`,
        },
      })
      // Soportamos dos shapes de respuesta:
      //   { url: "https://..." }                — formato que esperamos del edge fn
      //   { account_link: { url: "..." } }      — shape raw de la API de Stripe
      const redirectUrl = data?.url ?? data?.account_link?.url
      if (fnErr || !redirectUrl) {
        // Distinguimos "función no deployada aún" de error real
        const isNotDeployed =
          fnErr?.message?.toLowerCase().includes('not found') ||
          fnErr?.status === 404 ||
          String(fnErr?.message).includes('404')
        setError(isNotDeployed
          ? 'La conexión con Stripe está siendo habilitada. Estará disponible pronto — escríbenos a hola@soymanada.com si tienes urgencia.'
          : 'No pudimos iniciar la verificación en este momento. Inténtalo de nuevo.'
        )
        return
      }
      window.location.href = redirectUrl
    } catch {
      setError('No pudimos conectar con Stripe. Inténtalo de nuevo en unos minutos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pdash__stripe-block">
      <p className="t-xs" style={{ color: 'var(--text-300)', marginBottom: 14 }}>
        Usamos <strong>Stripe</strong> para procesar pagos de forma segura.
        Tu dinero llega directo a tu cuenta bancaria.
      </p>

      {/* Estado: sin cuenta */}
      {stripeStatus === 'unconnected' && (
        <div className="pdash__stripe-state">
          <div className="pdash__stripe-status pdash__stripe-status--idle">
            <span>🔗</span>
            <div>
              <strong className="t-sm">Configura tus cobros seguros</strong>
              <p className="t-xs" style={{ color: 'var(--text-300)', marginTop: 2 }}>
                Conecta tu cuenta bancaria a través de Stripe. Es rápido y seguro.
              </p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleConnect} disabled={loading}>
            <span>{loading ? 'Redirigiendo a Stripe…' : '🔐 Conectar mi cuenta Stripe'}</span>
          </button>
        </div>
      )}

      {/* Estado: onboarding incompleto */}
      {stripeStatus === 'onboarding_incomplete' && (
        <div className="pdash__stripe-state">
          <div className="pdash__stripe-status pdash__stripe-status--warn">
            <span>⚠️</span>
            <div>
              <strong className="t-sm">Verifica tu cuenta para recibir pagos</strong>
              <p className="t-xs" style={{ color: 'var(--text-300)', marginTop: 2 }}>
                Iniciaste el proceso pero aún no lo completaste. Vuelve a Stripe para terminar.
              </p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleConnect} disabled={loading}>
            <span>{loading ? 'Redirigiendo a Stripe…' : '→ Completar verificación de pagos'}</span>
          </button>
        </div>
      )}

      {/* Estado: requisitos pendientes (Stripe pide más info) */}
      {stripeStatus === 'requirements_pending' && (
        <div className="pdash__stripe-state">
          <div className="pdash__stripe-status pdash__stripe-status--warn">
            <span>📋</span>
            <div>
              <strong className="t-sm">Stripe necesita más información</strong>
              <p className="t-xs" style={{ color: 'var(--text-300)', marginTop: 2 }}>
                Completaste el flujo pero hay requisitos adicionales pendientes. Entra a Stripe para resolverlos.
              </p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleConnect} disabled={loading}>
            <span>{loading ? 'Redirigiendo a Stripe…' : '→ Ver requisitos pendientes'}</span>
          </button>
        </div>
      )}

      {/* Estado: habilitado */}
      {stripeStatus === 'enabled' && (
        <div className="pdash__stripe-state">
          <div className="pdash__stripe-status pdash__stripe-status--ok">
            <span>✅</span>
            <div>
              <strong className="t-sm">Listo para recibir pagos</strong>
              <p className="t-xs" style={{ marginTop: 2 }}>
                Tu cuenta Stripe está verificada.
                {payoutsEnabled
                  ? ' Los depósitos se activan automáticamente.'
                  : ' Los depósitos estarán disponibles pronto.'}
              </p>
            </div>
          </div>
          <div className="pdash__stripe-caps">
            <span className={`pdash__stripe-cap${chargesEnabled ? ' pdash__stripe-cap--on' : ''}`}>
              {chargesEnabled ? '✓' : '○'} Cobros
            </span>
            <span className={`pdash__stripe-cap${payoutsEnabled ? ' pdash__stripe-cap--on' : ''}`}>
              {payoutsEnabled ? '✓' : '○'} Depósitos
            </span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleConnect} disabled={loading}>
            <span>Gestionar cuenta en Stripe ↗</span>
          </button>
        </div>
      )}

      {error && (
        <div className={`pdash__stripe-error-msg${error.includes('siendo habilitada') ? ' pdash__stripe-error-msg--info' : ''}`}>
          {error}
        </div>
      )}

      <p className="t-xs pdash__stripe-disclaimer">
        SoyManada usa Stripe para el procesamiento. No almacenamos datos de tu cuenta bancaria.
      </p>
    </div>
  )
}

// ── Sección Herramientas ─────────────────────────────────────────
// Diseñada desde la abundancia: muestra lo que TIENES, no lo que te falta.
// Un único bloque de upgrade al fondo, nunca intercalado.
function SectionHerramientas({ tier, provider, onSave, saving }) {
  const { t } = useTranslation()
  const isCobPlus = tier === 'cob' || tier === 'wolf'
  const isWolf    = tier === 'wolf'
  const isBronze  = !isCobPlus

  const [form, setForm] = useState({
    calendar_link:        provider?.calendar_link        ?? '',
    call_link:            provider?.call_link            ?? '',
    redirect_email:       provider?.redirect_email       ?? '',
    service_description:  provider?.service_description  ?? '',
    service_amount_clp:   provider?.service_amount_clp   ?? '',
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

  // Título y subtítulo por tier (de posesión, no de carencia)
  const sectionTitle = isWolf
    ? 'Tus herramientas'
    : isCobPlus
      ? 'Tus herramientas activas'
      : 'Herramientas disponibles'
  const sectionSub = isWolf
    ? 'Configura tus canales de contacto, agenda y cobros.'
    : isCobPlus
      ? 'Todo lo que tienes activo en tu plan Cub.'
      : 'Las herramientas incluidas en tu plan Wonderer.'

  return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">{sectionTitle}</h2>
        <p className="t-sm pdash__section-sub">{sectionSub}</p>
      </div>

      {/* ── Bronze: herramienta activa disponible ── */}
      {isBronze && (
        <div className="pdash__tool-active">
          <span className="pdash__tool-icon">💳</span>
          <div>
            <strong className="t-sm">Link de pago externo</strong>
            <p className="t-xs" style={{
              color: provider?.payment_link ? 'var(--green-700, #15803d)' : 'var(--text-300)',
              marginTop: 3,
            }}>
              {provider?.payment_link
                ? '✓ Configurado — visible en tu perfil público.'
                : 'Aún no configurado. Puedes añadirlo desde la pestaña Perfil.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Cub+: WhatsApp toggle ── */}
      {isCobPlus && <WAVisibilityToggle tier={tier} provider={provider} />}

      {/* ── Cub+: Calendario y videollamada ── */}
      {isCobPlus && (
        <div className="pdash__tools-block">
          <div className="pdash__tools-block-header">
            <span className="pdash__tools-block-title t-sm">📅 Calendario de citas</span>
          </div>

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

          <div className="pdash__field pdash__field--full" style={{ marginBottom: 16 }}>
            <label className="pdash__label t-sm">📹 Plataforma para la llamada</label>
            {isWolf && (
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
              {isWolf
                ? ' Si lo dejas vacío, se usará la sala Jitsi automática.'
                : ' Este link aparecerá en el email de confirmación y en la reserva del migrante.'}
            </p>
          </div>

          <AvailabilityEditor providerId={provider?.id} />
        </div>
      )}

      {/* ── Wolf: Cobro gestionado ── */}
      {isWolf && (
        <div className="pdash__tools-block" style={{ marginTop: 24 }}>
          <div className="pdash__tools-block-header">
            <span className="pdash__tools-block-title t-sm">💳 Cobro gestionado por SoyManada</span>
          </div>
          <div className="pdash__form">
            <p className="t-xs" style={{ color: 'var(--text-300)', marginBottom: 14 }}>
              Define un servicio con precio fijo. Tus clientes podrán pagarlo directamente desde tu perfil
              con tarjeta de crédito.
            </p>
            <div className="pdash__field pdash__field--full">
              <label className="pdash__label t-sm">Nombre del servicio</label>
              <input
                className="pdash__input"
                value={form.service_description}
                onChange={e => set('service_description', e.target.value)}
                placeholder="ej. Asesoría inicial 1h · Traducción certificada 1 documento"
                maxLength={120}
              />
            </div>
            <div className="pdash__field">
              <label className="pdash__label t-sm">Precio (CLP)</label>
              <input
                className="pdash__input"
                type="number"
                min="1000"
                step="100"
                value={form.service_amount_clp}
                onChange={e => set('service_amount_clp', e.target.value)}
                placeholder="ej. 25000"
              />
              <p className="t-xs" style={{ color: 'var(--text-300)', marginTop: 4 }}>
                El cliente elige cuántas cuotas desde su tarjeta.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Wolf: Cobros seguros con Stripe ── */}
      {isWolf && (
        <div className="pdash__tools-block" style={{ marginTop: 24 }}>
          <div className="pdash__tools-block-header">
            <span className="pdash__tools-block-title t-sm">🔐 Cobros seguros con Stripe</span>
          </div>
          <StripeConnectBlock provider={provider} />
        </div>
      )}

      {/* ── Wolf: Herramientas avanzadas ── */}
      {isWolf && (
        <div className="pdash__tools-block" style={{ marginTop: 24 }}>
          <div className="pdash__tools-block-header">
            <span className="pdash__tools-block-title t-sm">🛠 Herramientas avanzadas</span>
          </div>
          <div className="pdash__form">
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
                      <span className="t-xs" style={{ color: 'var(--text-300)', fontWeight: 600 }}>Par #{idx + 1}</span>
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
                onClick={() => set('predefined_responses', [...form.predefined_responses, { q: '', a: '' }])}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                Agregar pregunta y respuesta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Botón guardar (Cub+) ── */}
      {isCobPlus && (
        <button className="btn btn-primary pdash__save-btn" style={{ marginTop: 24 }} onClick={() => onSave({
          calendar_link:        form.calendar_link,
          call_link:            form.call_link,
          redirect_email:       form.redirect_email,
          service_description:  form.service_description.trim() || null,
          service_amount_clp:   form.service_amount_clp ? parseInt(form.service_amount_clp, 10) : null,
          predefined_responses: form.predefined_responses
            .filter(p => p.q.trim() || p.a.trim())
            .map(p => `${p.q.trim()}\n${p.a.trim()}`),
        })} disabled={saving}>
          <span>{saving ? t('pdash.saving') : t('pdash.save_herramientas')}</span>
        </button>
      )}

      {/* ── Planes integrados — siempre al fondo, nunca intercalado ── */}

      {/* Bronze: comparación completa de los 3 planes */}
      {isBronze && (
        <div className="pdash__upgrade-solo" style={{ marginTop: 40 }}>
          <p className="pdash__upgrade-solo-title">Planes y beneficios</p>
          <p className="t-xs" style={{ color: 'var(--text-400)', marginBottom: 20 }}>
            Compara lo que incluye cada plan y actualiza cuando quieras.
          </p>
          <PlanCompare tier={tier} />
        </div>
      )}

      {/* Cub: tarjeta Wolf con lo que suma */}
      {isCobPlus && !isWolf && (
        <div className="pdash__upgrade-wolf-teaser" style={{ marginTop: 40 }}>
          <div className="pdash__upgrade-wolf-icon">🐺</div>
          <div className="pdash__upgrade-wolf-body">
            <p className="t-sm pdash__upgrade-wolf-name">Plan Wolf — $9.990 CLP/mes</p>
            <p className="t-xs pdash__upgrade-wolf-perks">
              Cobros con Stripe · Responder reseñas · Respuestas predefinidas · Badge destacado en búsquedas
            </p>
            <UpgradeButton planCode="pro" label="Activar Wolf" variant="secondary" />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Responder reseñas (Wolf) ──────────────────────────────────────
function ReviewReplies({ provider }) {
  const [opinions,  setOpinions]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [replyText, setReplyText] = useState({})  // { [id]: string }
  const [editing,   setEditing]   = useState({})  // { [id]: bool }
  const [saving,    setSaving]    = useState({})  // { [id]: bool }
  const [saved,     setSaved]     = useState({})  // { [id]: bool }

  useEffect(() => {
    if (!provider?.id) return
    supabase
      .from('pilot_opinions')
      .select('id, author_name, text, rating, created_at, provider_response, provider_response_at')
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOpinions(data ?? [])
        setLoading(false)
      })
  }, [provider?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (opId) => {
    const text = replyText[opId]?.trim()
    if (!text) return
    setSaving(s => ({ ...s, [opId]: true }))
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('pilot_opinions')
      .update({ provider_response: text, provider_response_at: now })
      .eq('id', opId)
    setSaving(s => ({ ...s, [opId]: false }))
    if (!error) {
      setOpinions(ops => ops.map(o =>
        o.id === opId ? { ...o, provider_response: text, provider_response_at: now } : o
      ))
      setEditing(e => ({ ...e, [opId]: false }))
      setReplyText(r => ({ ...r, [opId]: '' }))
      setSaved(s => ({ ...s, [opId]: true }))
      setTimeout(() => setSaved(s => ({ ...s, [opId]: false })), 2500)
    }
  }

  const startEdit = (op) => {
    setReplyText(r => ({ ...r, [op.id]: op.provider_response ?? '' }))
    setEditing(e => ({ ...e, [op.id]: true }))
  }

  if (loading) return (
    <p className="t-sm" style={{ color: 'var(--text-300)', padding: '8px 0' }}>Cargando reseñas…</p>
  )
  if (opinions.length === 0) return (
    <p className="t-sm" style={{ color: 'var(--text-300)', padding: '8px 0' }}>
      Aún no tienes reseñas de clientes.
    </p>
  )

  return (
    <div className="pdash__review-replies">
      {opinions.map(op => {
        const hasResponse = op.provider_response && !editing[op.id]
        return (
          <div key={op.id} className="pdash__reply-card">
            <div className="pdash__reply-meta">
              <span className="t-sm pdash__reply-author">{op.author_name ?? 'Anónimo'}</span>
              {op.rating && (
                <span className="pdash__reply-stars">{'🐾'.repeat(op.rating)}</span>
              )}
              <span className="pdash__reply-date t-xs">
                {new Date(op.created_at).toLocaleDateString('es-CL')}
              </span>
            </div>

            {op.text && (
              <p className="pdash__reply-text t-sm">"{op.text}"</p>
            )}

            {hasResponse ? (
              <div className="pdash__reply-response">
                <span className="pdash__reply-response-label t-xs">Tu respuesta:</span>
                <p className="t-sm pdash__reply-response-text">{op.provider_response}</p>
                <button className="btn btn-ghost btn-sm" onClick={() => startEdit(op)}>
                  Editar respuesta
                </button>
              </div>
            ) : (
              <div className="pdash__reply-form">
                <textarea
                  className="pdash__reply-input"
                  placeholder="Escribe tu respuesta para este cliente…"
                  value={replyText[op.id] ?? ''}
                  onChange={e => setReplyText(r => ({ ...r, [op.id]: e.target.value }))}
                  rows={2}
                />
                <div className="pdash__reply-actions">
                  {editing[op.id] && (
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => setEditing(e => ({ ...e, [op.id]: false }))}>
                      Cancelar
                    </button>
                  )}
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSave(op.id)}
                    disabled={saving[op.id] || !replyText[op.id]?.trim()}
                  >
                    {saving[op.id] ? 'Guardando…' : saved[op.id] ? '✓ Guardado' : 'Responder'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
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
          {t('pdash.tab_metricas_label')} <span className="pdash__badge pdash__badge--silver">Cub</span>
        </h2>
        <p className="t-sm pdash__section-sub">Entiende cómo los migrantes interactúan con tu perfil.</p>
      </div>
      <div className="pdash__locked">
        <MetricsSummary metrics={null} loading={true} />
        <div className="pdash__upgrade-cta">
          <p className="t-sm"><strong>Activa Cub</strong> por $4.990 CLP/mes y desbloquea tus métricas en tiempo real.</p>
          <UpgradeButton planCode="activo" label="Activar Cub — $4.990 CLP/mes" />
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

// ── WhatsApp visibility toggle (Silver+) + Gold addon ────────────
function WAVisibilityToggle({ tier, provider }) {
  const { t }        = useTranslation()
  const { user }     = useAuth()
  const isCob  = tier === 'cob'
  const isWolf = tier === 'wolf'

  // Silver toggle (show_whatsapp — free)
  const [enabled, setEnabled] = useState(provider?.show_whatsapp ?? false)
  const [saved,   setSaved]   = useState(false)
  const [saving,  setSaving]  = useState(false)

  // Gold addon state (whatsapp_addon — paid)
  const addonActive = provider?.whatsapp_addon ?? false

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
        <span className="pdash__badge pdash__badge--silver">Cub+</span>
      </div>

      {/* Locked for Wonderer */}
      {!isCob && !isWolf && (
        <>
          <div className="pdash__tool-card pdash__tool-card--locked">
            <span className="pdash__tool-icon">📱</span>
            <div>
              <strong className="t-sm">{t('messaging.whatsapp_toggle')}</strong>
              <p className="t-xs" style={{ color: 'var(--text-300)' }}>{t('messaging.whatsapp_tier_lock')}</p>
            </div>
          </div>
          <div className="pdash__upgrade-cta">
            <p className="t-sm"><strong>Activa Cub</strong> por $4.990 CLP/mes para mostrar tu WhatsApp en tu perfil público.</p>
            <UpgradeButton planCode="activo" label="Activar Cub — $4.990 CLP/mes" />
          </div>
        </>
      )}

      {/* Silver: free toggle */}
      {isCob && (
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
      )}

      {/* Gold: paid addon */}
      {isWolf && (
        <div className="pdash__wa-addon-block">
          {addonActive ? (
            <div className="pdash__wa-addon-active">
              <span className="pdash__wa-addon-check">✓</span>
              <div>
                <strong className="t-sm">WhatsApp visible en tu tarjeta</strong>
                <p className="t-xs" style={{ color: 'var(--text-300)', marginTop: 2 }}>
                  Los usuarios ven tu número directamente desde la categoría y tu perfil.
                </p>
              </div>
            </div>
          ) : (
            <div className="pdash__wa-addon-cta">
              <div>
                <strong className="t-sm">Activa WhatsApp en tu tarjeta pública</strong>
                <p className="t-xs" style={{ color: 'var(--text-400)', marginTop: 4 }}>
                  Por <strong>$2.000 CLP/mes</strong> tu número aparece visible en las vistas de categoría y tu perfil. Sin intermediarios.
                </p>
              </div>
              <UpgradeButton planCode="whatsapp_addon" label="Activar por $2.000 CLP/mes" variant="secondary" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Reseñas tab (Wolf) ───────────────────────────────────────────
function SectionReseñas({ provider, tier }) {
  const isWolf = tier === 'wolf'
  return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">
          Reseñas de clientes
          <span className="pdash__badge pdash__badge--gold" style={{ marginLeft: 10 }}>Wolf</span>
        </h2>
        <p className="t-sm pdash__section-sub">
          Lee lo que tus clientes dicen de ti y responde públicamente desde aquí.
        </p>
      </div>

      {isWolf ? (
        <ReviewReplies provider={provider} />
      ) : (
        <div className="pdash__locked">
          {/* Preview borroso */}
          <div className="pdash__reseñas-preview">
            {[1,2,3].map(i => (
              <div key={i} className="pdash__reply-card pdash__reply-card--blur">
                <div className="pdash__reply-meta">
                  <span className="t-sm pdash__reply-author">Cliente {i}</span>
                  <span className="pdash__reply-stars">🐾🐾🐾🐾🐾</span>
                </div>
                <p className="pdash__reply-text t-sm">"Excelente servicio, muy recomendado."</p>
              </div>
            ))}
          </div>
          <div className="pdash__upgrade-cta">
            <p className="t-sm">
              <strong>Con Wolf</strong> puedes responder las reseñas que dejan tus clientes.
              Muestra profesionalismo y fideliza tu comunidad migrante.
            </p>
            <UpgradeButton planCode="pro" label="Activar Wolf — $9.990 CLP/mes" />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Grid de comparación de planes (reutilizable) ─────────────────
const PLAN_FEATURES = {
  bronze: [
    { label: 'Perfil público en el directorio', included: true },
    { label: 'Descripción y foto de perfil',    included: true },
    { label: 'Redes sociales e Instagram',       included: true },
    { label: 'Métricas de visitas en tiempo real', included: false },
    { label: 'WhatsApp visible en perfil',        included: false },
    { label: 'Calendario de reservas',            included: false },
    { label: 'Inbox de mensajes directos',        included: false },
    { label: 'Cobro gestionado por SoyManada',    included: false },
    { label: 'Responder reseñas públicamente',    included: false },
    { label: 'Badge destacado en búsquedas',      included: false },
  ],
  cob: [
    { label: 'Perfil público en el directorio', included: true },
    { label: 'Descripción y foto de perfil',    included: true },
    { label: 'Redes sociales e Instagram',       included: true },
    { label: 'Métricas de visitas en tiempo real', included: true },
    { label: 'WhatsApp visible en perfil',        included: true },
    { label: 'Calendario de reservas',            included: true },
    { label: 'Inbox de mensajes directos',        included: true },
    { label: 'Cobro gestionado por SoyManada',    included: false },
    { label: 'Responder reseñas públicamente',    included: false },
    { label: 'Badge destacado en búsquedas',      included: false },
  ],
  wolf: [
    { label: 'Perfil público en el directorio', included: true },
    { label: 'Descripción y foto de perfil',    included: true },
    { label: 'Redes sociales e Instagram',       included: true },
    { label: 'Métricas de visitas en tiempo real', included: true },
    { label: 'WhatsApp visible en perfil',        included: true },
    { label: 'Calendario de reservas',            included: true },
    { label: 'Inbox de mensajes directos',        included: true },
    { label: 'Cobro gestionado por SoyManada',    included: true },
    { label: 'Responder reseñas públicamente',    included: true },
    { label: 'Badge destacado en búsquedas',      included: true },
  ],
}

// PlanCompare — grid de 3 columnas, usable inline en Herramientas
function PlanCompare({ tier }) {
  const PLANS = [
    { code: 'bronze', name: 'Wonderer', icon: '✨', price: 'Gratis',         planCode: null },
    { code: 'cob',    name: 'Cob',      icon: '🐾', price: '$4.990 CLP/mes', planCode: 'activo' },
    { code: 'wolf',   name: 'Wolf',     icon: '🐺', price: '$9.990 CLP/mes', planCode: 'pro' },
  ]
  return (
    <div className="pdash__plans-grid">
      {PLANS.map(plan => {
        const isCurrent = tier === plan.code
        const features  = PLAN_FEATURES[plan.code]
        return (
          <div
            key={plan.code}
            className={`pdash__plan-card${isCurrent ? ' pdash__plan-card--current' : ''}${plan.code === 'wolf' ? ' pdash__plan-card--featured' : ''}`}
          >
            {isCurrent && <div className="pdash__plan-badge">Tu plan actual</div>}
            {plan.code === 'wolf' && !isCurrent && (
              <div className="pdash__plan-badge pdash__plan-badge--featured">Más popular</div>
            )}
            <div className="pdash__plan-header">
              <span className="pdash__plan-icon">{plan.icon}</span>
              <h3 className="pdash__plan-name">{plan.name}</h3>
              <p className="pdash__plan-price">{plan.price}</p>
            </div>
            <ul className="pdash__plan-features">
              {features.map((f, i) => (
                <li key={i} className={`pdash__plan-feature${f.included ? '' : ' pdash__plan-feature--off'}`}>
                  <span className="pdash__plan-check">{f.included ? '✓' : '✕'}</span>
                  {f.label}
                </li>
              ))}
            </ul>
            {!isCurrent && plan.planCode && (
              <div style={{ marginTop: 16 }}>
                <UpgradeButton planCode={plan.planCode} label={`Activar ${plan.name}`} variant="primary" />
              </div>
            )}
            {isCurrent && (
              <p className="t-xs" style={{ color: 'var(--iris-500)', fontWeight: 600, marginTop: 16, textAlign: 'center' }}>
                ✓ Plan activo
              </p>
            )}
          </div>
        )
      })}
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
  const isCobPlus = tier === 'cob' || tier === 'wolf'

  if (!isCobPlus) return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">{t('pdash.tab_reservas_label')}</h2>
        <p className="t-sm pdash__section-sub">{t('pdash.reservas_manage_sub')}</p>
      </div>
      <div className="pdash__locked">
        <div className="pdash__upgrade-cta">
          <p className="t-sm"><strong>Activa Cub</strong> por $4.990 CLP/mes para recibir y gestionar reservas de citas.</p>
          <UpgradeButton planCode="activo" label="Activar Cub — $4.990 CLP/mes" />
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
          || (tier === 'wolf' ? `https://meet.jit.si/soymanada-${booking.id}` : null)

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
function UpgradeButton({ planCode, label, variant = 'primary' }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState(null)

  const handleUpgrade = async () => {
    setLoading(true)
    setErr(null)
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan_code: planCode, user_id: user?.id },
      })
      if (error || !data?.init_point) {
        setErr('No pudimos iniciar el pago en este momento. Inténtalo de nuevo en unos minutos.')
        return
      }
      window.location.href = data.init_point
    } catch (err) {
      console.error('[UpgradeButton]', err)
      setErr('No pudimos iniciar el pago en este momento. Inténtalo de nuevo en unos minutos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pdash__upgrade-btn-wrap">
      <button className={`btn btn-${variant}`} onClick={handleUpgrade} disabled={loading}>
        <span>{loading ? 'Redirigiendo a MercadoPago…' : label}</span>
      </button>
      {err && <p className="pdash__upgrade-error t-xs">{err}</p>}
    </div>
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

  // ── título de pestaña ───────────────────────────────────────────
  useEffect(() => {
    document.title = provider?.name
      ? `${provider.name} — Mi perfil | SoyManada`
      : 'Mi perfil | SoyManada'
  }, [provider?.name])

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
      <Link to="/registro-proveedores" className="btn btn-primary">{t('pdash.register_cta')}</Link>
    </div>
  )

  // ── tabs config ──────────────────────────────────────────────────
  const TABS = [
    { id: 'perfil',       icon: '👤', label: t('pdash.tab_perfil_label') },
    { id: 'herramientas', icon: '🛠',  label: t('pdash.tab_herramientas_label') },
    { id: 'metricas',     icon: '📊', label: t('pdash.tab_metricas_label') },
    { id: 'reseñas',      icon: '💬', label: 'Reseñas' },
    { id: 'reservas',     icon: '📅', label: t('pdash.tab_reservas_label') },
    { id: 'mensajes',     icon: '✉️',  label: t('pdash.tab_mensajes_label') },
    { id: 'ayuda',        icon: '📖', label: 'Ayuda' },
  ]

  const tierLabel = planUiName(tier)

  return (
    <div className="pdash">

      {/* ── Hero ── */}
      <div className="pdash__hero">
        <div className="pdash__hero-orb" />
        <div className="pdash__hero-center">

          {/* Avatar */}
          {provider.avatar_url
            ? <img src={provider.avatar_url} alt="" className="pdash__hero-avatar" />
            : (
              <div className="pdash__hero-avatar-placeholder">
                {(provider.name || '?')[0].toUpperCase()}
              </div>
            )
          }

          {/* Nombre + tier */}
          <h1 className="pdash__hero-title d-lg">
            {provider.name || t('pdash.unnamed')}
          </h1>
          {tierLabel && (
            <span className="pdash__tier-badge">
              <span className="pdash__tier-dot" />
              {tierLabel}
            </span>
          )}

          {/* Links rápidos */}
          <div className="pdash__hero-links">
            {provider.slug && (
              <a
                href={`/proveedor/${provider.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pdash__hero-link"
              >
                Ver perfil público ↗
              </a>
            )}
            <button
              className="pdash__hero-link"
              onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Tabs — envueltos en wrapper para fades laterales */}
        <div className="pdash__tabs-wrap">
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
          {activeTab === 'reseñas' && (
            <SectionReseñas provider={provider} tier={tier} />
          )}
          {activeTab === 'reservas' && (
            <SectionReservas provider={provider} tier={tier} />
          )}
          {activeTab === 'mensajes' && (
            <SectionMensajes provider={provider} />
          )}
          {activeTab === 'ayuda' && (
            <ManualProveedor provider={provider} />
          )}
        </div>
      </div>

    </div>
  )
}
