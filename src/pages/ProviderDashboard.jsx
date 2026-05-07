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
import EndorsementsPanel   from '../components/dashboard/EndorsementsPanel'
import AvailabilityEditor  from '../components/AvailabilityEditor'
import ProviderInbox       from '../components/ProviderInbox'
import { useDashboardBookings, updateBookingStatus } from '../hooks/useBookings'
import { isGenericProviderName, hasProfanity } from '../utils/validateProviderName'
import './ProviderDashboard.css'

// ── Categorías disponibles ───────────────────────────────────────
const PROVIDER_CATEGORIES = [
  { slug: 'migracion',       label: '🛂 Asesoría migratoria' },
  { slug: 'seguros',         label: '🛡️ Seguros de viaje' },
  { slug: 'traducciones',    label: '📄 Traducciones' },
  { slug: 'comunidad',       label: '🤝 Comunidad' },
  { slug: 'banca',           label: '🏦 Banca' },
  { slug: 'salud-mental',    label: '🧠 Salud mental' },
  { slug: 'antes-de-viajar', label: '✈️ Antes de viajar' },
  { slug: 'trabajo',         label: '💼 Trabajo' },
  { slug: 'idiomas',         label: '🗣️ Idiomas' },
  { slug: 'taxes',           label: '🧾 Taxes' },
  { slug: 'remesas',         label: '💸 Remesas' },
  { slug: 'alojamiento',     label: '🏠 Alojamiento' },
  { slug: 'mascotas',        label: '🐾 Mascotas' },
  { slug: 'planes-telefono', label: '📱 Planes de teléfono' },
]

// ── Form sanitizers ──────────────────────────────────────────────
function sanitizeInstagram(raw) {
  return raw
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\s+/g, '')
    .split('?')[0]
    .split('/')[0]
}

function sanitizeUrl(raw) {
  const v = raw.trim()
  if (v && !v.startsWith('http://') && !v.startsWith('https://')) {
    return 'https://' + v
  }
  return v
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

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
function ProviderProfileEditor({ provider, onSave, saving, onAvatarUpload, avatarUploading }) {
  const { t }    = useTranslation()
  const { user } = useAuth()

  // Cambio de contraseña
  const isOAuthUser = user?.app_metadata?.provider !== 'email'
  const [changingPw, setChangingPw] = useState(false)
  const [pwNew,      setPwNew]      = useState('')
  const [pwConfirm,  setPwConfirm]  = useState('')
  const [pwSaving,   setPwSaving]   = useState(false)
  const [pwMsg,      setPwMsg]      = useState(null) // { ok: bool, text: string }

  const cancelPw = () => { setChangingPw(false); setPwNew(''); setPwConfirm(''); setPwMsg(null) }
  const savePw = async () => {
    if (pwNew.length < 6) { setPwMsg({ ok: false, text: 'Mínimo 6 caracteres.' }); return }
    if (pwNew !== pwConfirm) { setPwMsg({ ok: false, text: t('pdash.password_mismatch') }); return }
    setPwSaving(true); setPwMsg(null)
    const { error } = await supabase.auth.updateUser({ password: pwNew })
    setPwSaving(false)
    if (error) setPwMsg({ ok: false, text: '{t('pdash.password_error')}' })
    else { setPwMsg({ ok: true, text: '{t('pdash.password_ok')}' }); setTimeout(cancelPw, 2000) }
  }

  const [form, setForm] = useState({
    name:                provider?.name                ?? '',
    description:         provider?.description         ?? '',
    service:             provider?.service             ?? '',
    languages:           (provider?.languages ?? []).join(', '),
    countries:           (provider?.countries ?? []).join(', '),
    whatsapp:            provider?.contact_whatsapp    ?? '',
    contact_instagram:   provider?.contact_instagram   ?? '',
    calendar_link:       provider?.calendar_link       ?? '',
    redirect_email:      provider?.redirect_email      ?? '',
    payment_link:        provider?.payment_link        ?? '',
    category_slugs:      provider?.category_slugs?.length
      ? provider.category_slugs
      : [provider?.category_slug].filter(Boolean),
  })
  const [payLinkError, setPayLinkError] = useState('')
  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (k === 'payment_link') setPayLinkError('')
  }

  const handleSave = () => {
    if (hasProfanity(form.name)) return
    if (isGenericProviderName(form.name)) return
    if (form.category_slugs.length === 0) return
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
          <label className="pdash__label t-sm">{t('pdash.perfil_nombre_label')}</label>
          <input className="pdash__input" value={form.name}
            onChange={e => set('name', e.target.value)} placeholder={t('pdash.perfil_nombre_placeholder')} />
          {hasProfanity(form.name) && (
            <p className="t-xs pdash__field-error" style={{ marginTop: 4 }}>
              ⚠️ El nombre contiene lenguaje inapropiado.
            </p>
          )}
          {!hasProfanity(form.name) && isGenericProviderName(form.name) && (
            <p className="t-xs" style={{ color: '#92400E', marginTop: 4 }}>
              ⚠️ Este nombre es muy genérico. Usa tu nombre real o el de tu marca para diferenciarte.
            </p>
          )}
        </div>
        <div className="pdash__field">
          <label className="pdash__label t-sm">{t('pdash.perfil_servicio_label')}</label>
          <input className="pdash__input" value={form.service}
            onChange={e => set('service', e.target.value)} placeholder={t('pdash.perfil_servicio_placeholder')} />
        </div>
        <div className="pdash__field pdash__field--full">
          <label className="pdash__label t-sm">{t('pdash.perfil_desc_label')}</label>
          <textarea className="pdash__textarea" rows={4} value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder={t('pdash.perfil_desc_placeholder')} />
        </div>
        <div className="pdash__field">
          <label className="pdash__label t-sm">{t('pdash.perfil_paises_label')}</label>
          <input className="pdash__input" value={form.countries}
            onChange={e => set('countries', e.target.value)} placeholder="Canadá, Chile (separados por coma)" />
        </div>
        <div className="pdash__field">
          <label className="pdash__label t-sm">{t('pdash.perfil_idiomas_label')}</label>
          <input className="pdash__input" value={form.languages}
            onChange={e => set('languages', e.target.value)} placeholder="Español, Inglés" />
        </div>

        <div className="pdash__field pdash__field--full">
          <label className="pdash__label t-sm">{t('pdash.perfil_categorias_label')}</label>
          <div className="pdash__category-checks">
            {PROVIDER_CATEGORIES.map(cat => (
              <label key={cat.slug} className="pdash__check-label">
                <input
                  type="checkbox"
                  checked={form.category_slugs.includes(cat.slug)}
                  onChange={e => {
                    const next = e.target.checked
                      ? [...form.category_slugs, cat.slug]
                      : form.category_slugs.filter(s => s !== cat.slug)
                    set('category_slugs', next)
                  }}
                />
                <span>{cat.label}</span>
              </label>
            ))}
          </div>
          {form.category_slugs.length === 0 && (
            <p className="t-xs pdash__field-error">
              Selecciona al menos una categoría.
            </p>
          )}
        </div>

        <div className="pdash__field pdash__field--full pdash__divider-section">
          <p className="label pdash__section-label">{t('pdash.perfil_contacto_label')}</p>
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

        {/* Instagram */}
        <div className="pdash__field">
          <label className="pdash__label t-sm">{t('pdash.perfil_instagram_label')}</label>
          <div className="pdash__input-prefix-wrap">
            <span className="pdash__input-prefix">instagram.com/</span>
            <input
              className="pdash__input pdash__input--prefixed"
              value={form.contact_instagram}
              onChange={e => set('contact_instagram', sanitizeInstagram(e.target.value))}
              placeholder="tu_usuario"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <p className="t-xs" style={{ color: 'var(--text-300)', marginTop: 4 }}>
            {t('pdash.perfil_instagram_hint')}
          </p>
        </div>

        {/* Link de pago — disponible para todos los tiers */}
        <div className="pdash__field pdash__field--full">
          <label className="pdash__label t-sm">💳 {t('provider.payment_link_label')}</label>
          <input
            className={`pdash__input${payLinkError ? ' pdash__input--error' : ''}`}
            type="url"
            value={form.payment_link}
            onChange={e => set('payment_link', e.target.value)}
            onBlur={e => set('payment_link', sanitizeUrl(e.target.value))}
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

        <button className="btn btn-primary pdash__save-btn" onClick={handleSave}
          disabled={saving || hasProfanity(form.name) || isGenericProviderName(form.name) || form.category_slugs.length === 0}>
          <span>{saving ? t('pdash.saving') : t('pdash.save_changes')}</span>
        </button>
      </div>

      {/* Cambio de contraseña — solo para usuarios email/password */}
      {!isOAuthUser && (
        <div className="pdash__pw-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p className="label pdash__section-label" style={{ margin: 0 }}>Contraseña</p>
            {!changingPw && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setChangingPw(true)}>
                Cambiar contraseña
              </button>
            )}
          </div>

          {changingPw ? (
            <div className="pdash__form">
              <div className="pdash__field">
                <label className="pdash__label t-sm">{t('pdash.password_new_label')}</label>
                <input className="pdash__input" type="password" value={pwNew}
                  onChange={e => setPwNew(e.target.value)}
                  placeholder="Mínimo 6 caracteres" autoFocus disabled={pwSaving} />
              </div>
              <div className="pdash__field">
                <label className="pdash__label t-sm">{t('pdash.password_confirm_label')}</label>
                <input className="pdash__input" type="password" value={pwConfirm}
                  onChange={e => setPwConfirm(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') savePw(); if (e.key === 'Escape') cancelPw() }}
                  placeholder="Repite la nueva contraseña" disabled={pwSaving} />
              </div>
              {pwMsg && (
                <p className="t-xs" style={{ color: pwMsg.ok ? 'var(--green-700, #15803d)' : '#dc2626', marginTop: 4 }}>
                  {pwMsg.text}
                </p>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={savePw}
                  disabled={pwSaving || !pwNew || !pwConfirm}>
                  <span>{pwSaving ? 'Guardando…' : 'Guardar contraseña'}</span>
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={cancelPw} disabled={pwSaving}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <p className="t-xs" style={{ color: 'var(--text-300)' }}>••••••••</p>
          )}
        </div>
      )}

      {/* Traducciones automáticas */}
      <div className="pdash__translations">
        <div className="pdash__translations-header">
          <h3 className="pdash__section-title" style={{ fontSize: '1.1rem' }}>
            🌐 Traducciones automáticas
          </h3>
          <p className="t-xs" style={{ color: 'var(--text-300)', marginTop: 4 }}>
            {t('pdash.traducciones_hint')}
          </p>
        </div>

        {[{ suffix: 'en', flag: 'ca', lang: 'English' }, { suffix: 'fr', flag: 'ca', lang: 'Français (Canada)' }].map(({ suffix, flag, lang }) => (
          <div key={suffix} className="pdash__trans-block">
            <div className="pdash__trans-lang">
              <span className={`fi fi-${flag} pdash__trans-flag`} />
              <span className="t-sm" style={{ fontWeight: 700, color: 'var(--text-700)' }}>{lang}</span>
              {provider?.[`description_${suffix}`]
                ? <span className="pdash__badge pdash__badge--verified" style={{ fontSize: '0.65rem' }}>{t('pdash.traducciones_status_done')}</span>
                : <span className="pdash__badge" style={{ fontSize: '0.65rem' }}>{t('pdash.traducciones_status_pending')}</span>
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
    // Guard: si provider.id no está disponible, no llamamos a Supabase
    if (!provider?.id) {
      setError('No se pudo identificar tu perfil. Recarga la página e inténtalo de nuevo.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('stripe-create-account-link', {
        body: {
          provider_id:  provider.id,   // UUID del proveedor (requerido por la Edge Function)
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
function SectionHerramientas({ provider, onSave, saving }) {
  const { t } = useTranslation()

  const [form, setForm] = useState({
    calendar_link:        provider?.calendar_link        ?? '',
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
  const [emailError, setEmailError] = useState('')

  return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">{t('pdash.herramientas_title')}</h2>
        <p className="t-sm pdash__section-sub">{t('pdash.herramientas_config_sub')}</p>
      </div>

      {/* Link de pago externo */}
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

      {/* WhatsApp */}
      <WAVisibilityToggle provider={provider} />

      {/* Calendario y videollamada */}
      <div className="pdash__tools-block">
        <div className="pdash__tools-block-header">
          <span className="pdash__tools-block-title t-sm">{t('pdash.herramientas_agenda_title')}</span>
        </div>

        <div className="pdash__field pdash__field--full" style={{ marginBottom: 16 }}>
          <label className="pdash__label t-sm">{t('pdash.herramientas_agenda_label')}</label>
          <input
            className="pdash__input"
            value={form.calendar_link}
            onChange={e => set('calendar_link', e.target.value)}
            onBlur={e => set('calendar_link', sanitizeUrl(e.target.value))}
            placeholder="https://calendly.com/tu-nombre"
          />
          <p className="t-xs" style={{ color: 'var(--text-300)', marginTop: 4 }}>
            Opcional. Si lo configuras, el migrante verá este link además de la agenda interna.
          </p>
        </div>

        <div className="pdash__field pdash__field--full" style={{ marginBottom: 16 }}>
          <label className="pdash__label t-sm">{t('pdash.herramientas_video_title')}</label>
          <div className="pdash__call-option pdash__call-option--gold" style={{ marginBottom: 10 }}>
            <span>✅ <strong>Sala Jitsi de SoyManada</strong> — se genera automáticamente al confirmar una reserva.</span>
            <p className="t-xs" style={{ color: 'var(--text-300)', marginTop: 2 }}>
              Si configuras un link personalizado abajo, ese link tendrá prioridad sobre la sala Jitsi.
            </p>
          </div>
          <input
            className="pdash__input"
            value={form.call_link}
            onChange={e => set('call_link', e.target.value)}
            onBlur={e => set('call_link', sanitizeUrl(e.target.value))}
            placeholder="https://zoom.us/j/... · https://meet.google.com/... · https://wa.me/56912345678"
          />
          <p className="t-xs" style={{ color: 'var(--text-300)', marginTop: 4 }}>
            Opcional. Pega aquí el link de Zoom, Google Meet, Teams, Whereby, WhatsApp u otro.
            Si lo dejas vacío, se usará la sala Jitsi automática.
          </p>
        </div>

        <AvailabilityEditor providerId={provider?.id} />
      </div>

      {/* Herramientas avanzadas */}
      <div className="pdash__tools-block" style={{ marginTop: 24 }}>
        <div className="pdash__tools-block-header">
          <span className="pdash__tools-block-title t-sm">{t('pdash.herramientas_advanced_title')}</span>
        </div>
        <div className="pdash__form">
          <div className="pdash__field pdash__field--full">
            <label className="pdash__label t-sm">{t('pdash.herramientas_email_title')}</label>
            <input
              className={`pdash__input${emailError ? ' pdash__input--error' : ''}`}
              type="email"
              value={form.redirect_email}
              onChange={e => { set('redirect_email', e.target.value); setEmailError('') }}
              onBlur={e => {
                const v = e.target.value.trim()
                if (v && !isValidEmail(v)) setEmailError('Revisa el formato del email.')
              }}
              placeholder="tu@email.com"
            />
            {emailError && <p className="t-xs pdash__field-error">{emailError}</p>}
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

      {/* Botón guardar */}
      <button className="btn btn-primary pdash__save-btn" style={{ marginTop: 24 }} onClick={() => onSave({
        calendar_link:        form.calendar_link,
        call_link:            form.call_link,
        redirect_email:       form.redirect_email,
        predefined_responses: form.predefined_responses
          .filter(p => p.q.trim() || p.a.trim())
          .map(p => `${p.q.trim()}\n${p.a.trim()}`),
      })} disabled={saving}>
        <span>{saving ? t('pdash.saving') : t('pdash.save_herramientas')}</span>
      </button>
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
      {t('pdash.resenas_empty')}
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
function SectionMetricas({ metrics, activity, hourlyActivity, feedback, provider, metricsLoading, messagingStats }) {
  const { t } = useTranslation()

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

// ── WhatsApp visibility toggle ────────────────────────────────────
function WAVisibilityToggle({ provider }) {
  const { t }    = useTranslation()
  const { user } = useAuth()
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
      </div>
      <div className="pdash__wa-toggle-row">
        <div>
          <strong className="t-sm">{t('messaging.whatsapp_toggle')}</strong>
          <p className="t-xs" style={{ color: 'var(--text-300)', marginTop: 2 }}>
            {t('messaging.whatsapp_toggle_hint')}
          </p>
        </div>
        <div className="pdash__wa-toggle-right">
          {saved   && <span className="t-xs pdash__saved-tag">✓ {t('messaging.saved')}</span>}
          {saving  && <span className="t-xs" style={{ color: 'var(--text-300)' }}>Guardando…</span>}
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
    </div>
  )
}

// ── Reseñas tab ──────────────────────────────────────────────────
function SectionReseñas({ provider }) {
  return (
    <div className="pdash__section">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">{t('pdash.resenas_title')}</h2>
        <p className="t-sm pdash__section-sub">
          {t('pdash.resenas_lead')}
        </p>
      </div>
      <ReviewReplies provider={provider} />
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

function SectionReservas({ provider }) {
  const { t } = useTranslation()
  const { bookings, loading, reload } = useDashboardBookings(provider?.id)
  const [updating, setUpdating] = useState(null)

  const handleStatus = async (id, newStatus) => {
    setUpdating(id)

    try {
      await updateBookingStatus(id, newStatus)

      const booking = bookings.find(b => b.id === id)

      if (newStatus === 'confirmed' && booking?.user_id && provider?.id) {
        const callLink = provider.call_link || `https://meet.jit.si/soymanada-${booking.id}`

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


// ── Main dashboard ────────────────────────────────────────────────
export default function ProviderDashboard() {
  const { t }    = useTranslation()
  const { user, loading: authLoading, isAdmin } = useAuth()

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

  // ── load metrics ─────────────────────────────────────────────────
  useEffect(() => {
    if (!provider?.id) return
    ;(async () => {
      setMetricsLoading(true)
      // Nombres sin prefijo get_ — coinciden con las funciones creadas en Supabase
      // pilot_opinions es la tabla real de reseñas (provider_feedback no existe)
      const [viewsRes, actRes, hourRes, fbRes, msgRes] = await Promise.all([
        supabase.rpc('provider_metrics',         { p_provider_id: provider.id }),
        supabase.rpc('provider_weekly_activity', { p_provider_id: provider.id }),
        supabase.rpc('provider_hourly_activity', { p_provider_id: provider.id }),
        supabase.from('pilot_opinions').select('rating, text, created_at').eq('provider_id', provider.id).order('created_at', { ascending: false }).limit(10),
        supabase.rpc('provider_messaging_stats', { p_provider_id: provider.id }),
      ])
      if (!viewsRes.error)  setMetrics(viewsRes.data?.[0] ?? null)
      if (!actRes.error)    setActivity(actRes.data ?? [])
      if (!hourRes.error)   setHourlyActivity(hourRes.data ?? [])
      // pilot_opinions usa 'text' como campo de reseña — mapeamos a 'comment' para AutoRecommendations
      if (!fbRes.error)     setFeedback((fbRes.data ?? []).map(f => ({ rating: f.rating, comment: f.text, created_at: f.created_at })))
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

    // Multi-categoría: sincronizar legacy category_slug con el primer elemento del array
    if (Array.isArray(payload.category_slugs)) {
      payload.category_slug = payload.category_slugs[0] ?? provider?.category_slug ?? null
    }

    // Constraint payment_link_must_be_https: null es válido, string vacío no
    if ('payment_link' in payload && !payload.payment_link) {
      payload.payment_link = null
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
    // Timestamp en el nombre → URL nueva en cada upload, rompe caché de browser Y CDN
    const path = `${provider.id}/avatar-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('provider-avatars')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (upErr) { setAvatarUploading(false); return }

    const { data: { publicUrl } } = supabase.storage
      .from('provider-avatars')
      .getPublicUrl(path)

label: t('pdash.tab_reseñas_label')    const { error: updateErr } = await supabase
      .from('providers')
      .update({ avatar_url: publicUrl })
      .eq('user_id', user.id)
    if (updateErr) { setAvatarUploading(false); return }

    setProvider(prev => ({ ...prev, avatar_url: publicUrl }))
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
    { id: 'reseñas',      icon: '💬', label: t('pdash.tab_reseñas_label') },
    { id: 'reservas',        icon: '📅', label: t('pdash.tab_reservas_label') },
    { id: 'mensajes',        icon: '✉️',  label: t('pdash.tab_mensajes_label') },
    { id: 'recomendaciones', icon: '🤝', label: t('pdash.tab_recomendaciones_label') },
    { id: 'ayuda',           icon: '📖', label: t('pdash.tab_ayuda_label') },
  ]

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

          <h1 className="pdash__hero-title d-lg">
            {provider.name || t('pdash.unnamed')}
          </h1>

          {/* Links rápidos */}
          <div className="pdash__hero-links">
            {provider.slug && (
              <a
                href={`/proveedor/${provider.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pdash__hero-link"
              >
                {t('pdash.view_public_profile')}
              </a>
            )}
            {isAdmin && (
              <a href="/admin" className="pdash__hero-link pdash__hero-link--admin">
                {t('pdash.admin_panel')}
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
              onSave={handleSave}
              saving={saving}
              onAvatarUpload={handleAvatarUpload}
              avatarUploading={avatarUploading}
            />
          )}
          {activeTab === 'herramientas' && (
            <SectionHerramientas
              provider={provider}
              onSave={handleSave}
              saving={saving}
            />
          )}
          {activeTab === 'metricas' && (
            <SectionMetricas
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
            <SectionReseñas provider={provider} />
          )}
          {activeTab === 'reservas' && (
            <SectionReservas provider={provider} />
          )}
          {activeTab === 'mensajes' && (
            <SectionMensajes provider={provider} />
          )}
          {activeTab === 'recomendaciones' && (
            <EndorsementsPanel myProviderId={provider.id} />
          )}
          {activeTab === 'ayuda' && (
            <ManualProveedor provider={provider} onNavigate={setActiveTab} />
          )}
        </div>
      </div>

    </div>
  )
}
