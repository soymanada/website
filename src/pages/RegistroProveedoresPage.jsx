import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { trackEvent, Events } from '../utils/analytics'
import { isGenericProviderName } from '../utils/validateProviderName'
import { supabase } from '../lib/supabase'
import PawIcon from '../components/PawIcon'
import './RegistroProveedoresPage.css'

// value = stored in Supabase (always Spanish), labelKey = i18n display key
const CATEGORIES = [
  { value: 'Seguros',             labelKey: 'categories.seguros' },
  { value: 'Asesoría migratoria', labelKey: 'categories.migracion' },
  { value: 'Traducciones',        labelKey: 'categories.traducciones' },
  { value: 'Trabajo',             labelKey: 'categories.trabajo' },
  { value: 'Alojamiento',         labelKey: 'categories.alojamiento' },
  { value: 'Idiomas',             labelKey: 'categories.idiomas' },
  { value: 'Banca',               labelKey: 'categories.banca' },
  { value: 'Bienestar',           labelKey: 'categories.salud-mental' },
  { value: 'Taxes',               labelKey: 'categories.taxes' },
  { value: 'Antes de viajar',     labelKey: 'categories.antes-de-viajar' },
  { value: 'Comunidad',           labelKey: 'categories.comunidad' },
  { value: 'Remesas',             labelKey: 'categories.remesas' },
]

const LANGUAGES = [
  { value: 'Español',   labelKey: 'registro.lang_es' },
  { value: 'Inglés',    labelKey: 'registro.lang_en' },
  { value: 'Portugués', labelKey: 'registro.lang_pt' },
  { value: 'Francés',   labelKey: 'registro.lang_fr' },
  { value: 'Otro',      labelKey: 'registro.lang_otro' },
]

const COUNTRIES = [
  { value: 'Alemania',        labelKey: 'registro.pais_alemania' },
  { value: 'Australia',       labelKey: 'registro.pais_australia' },
  { value: 'Austria',         labelKey: 'registro.pais_austria' },
  { value: 'Canadá',          labelKey: 'registro.pais_canada' },
  { value: 'Chile',           labelKey: 'registro.pais_chile' },
  { value: 'Corea del Sur',   labelKey: 'registro.pais_corea' },
  { value: 'Dinamarca',       labelKey: 'registro.pais_dinamarca' },
  { value: 'Francia',         labelKey: 'registro.pais_francia' },
  { value: 'Hungría',         labelKey: 'registro.pais_hungria' },
  { value: 'Irlanda',         labelKey: 'registro.pais_irlanda' },
  { value: 'Islandia',        labelKey: 'registro.pais_islandia' },
  { value: 'Japón',           labelKey: 'registro.pais_japon' },
  { value: 'Luxemburgo',      labelKey: 'registro.pais_luxemburgo' },
  { value: 'Nueva Zelanda',   labelKey: 'registro.pais_nueva_zelanda' },
  { value: 'Polonia',         labelKey: 'registro.pais_polonia' },
  { value: 'Portugal',        labelKey: 'registro.pais_portugal' },
  { value: 'República Checa', labelKey: 'registro.pais_rep_checa' },
  { value: 'Suecia',          labelKey: 'registro.pais_suecia' },
  { value: 'Otro',            labelKey: 'registro.pais_otro' },
]

const EMPTY = {
  business_name: '', service_title: '', categories: [], description: '',
  languages: [], countries: [], modality: '',
  whatsapp: '', instagram: '', website: '', profile_link: '',
  contact_name: '', contact_email: '', terms_accepted: false,
}

export default function RegistroProveedoresPage() {
  const { t } = useTranslation()
  const formRef = useRef(null)
  const [form, setForm]             = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [nameGenericWarning, setNameGenericWarning] = useState(false)

  const clearErr = (field) => setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n })

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Registro de proveedores | SoyManada'
    return () => { document.title = 'SoyManada – Directorio para la comunidad migrante' }
  }, [])

  const scrollToForm = () => {
    trackEvent(Events.CLICK_APPLY_PROVIDER, { from: 'providers_page' })
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const set    = (f, v) => setForm(prev => ({ ...prev, [f]: v }))
  const toggle = (f, v) => setForm(prev => ({
    ...prev,
    [f]: prev[f].includes(v) ? prev[f].filter(x => x !== v) : [...prev[f], v],
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.business_name.trim())   errs.business_name  = 'Este campo es obligatorio'
    if (!form.service_title.trim())   errs.service_title  = 'Este campo es obligatorio'
    if (!form.description.trim())     errs.description    = 'Este campo es obligatorio'
    if (form.categories.length === 0) errs.categories     = 'Selecciona al menos una categoría'
    if (form.languages.length  === 0) errs.languages      = 'Selecciona al menos un idioma'
    if (form.countries.length  === 0) errs.countries      = 'Selecciona al menos un país'
    if (!form.modality)               errs.modality       = 'Selecciona una modalidad'
    if (!form.whatsapp?.trim())       errs.whatsapp       = 'El número de WhatsApp es obligatorio'
    if (!form.profile_link.trim())    errs.profile_link   = 'Este campo es obligatorio'
    if (!form.contact_name.trim())    errs.contact_name   = 'Este campo es obligatorio'
    if (!form.contact_email.trim())   errs.contact_email  = 'El email es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) errs.contact_email = 'Ingresa un email válido'
    if (!form.terms_accepted)         errs.terms_accepted = 'Debes aceptar los términos para continuar'

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      setError('Por favor completa todos los campos obligatorios.')
      setTimeout(() => {
        document.querySelector('.ppg-form__field--error')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
      return
    }
    setFieldErrors({})
    setSubmitting(true)
    setError('')
    const { error: dbErr } = await supabase.from('provider_applications').insert({
      business_name:  form.business_name,
      service_title:  form.service_title,
      categories:     form.categories,
      description:    form.description,
      languages:      form.languages,
      countries:      form.countries,
      modality:       form.modality,
      whatsapp:       form.whatsapp,
      instagram:      form.instagram   || null,
      website:        form.website     || null,
      profile_link:   form.profile_link,
      contact_name:   form.contact_name,
      contact_email:  form.contact_email,
      terms_accepted: form.terms_accepted,
    })
    if (dbErr) {
      setError(`${t('registro.error_generico')} (${dbErr.message})`)
      setSubmitting(false)
    } else {
      // Notify admin (fire-and-forget)
      supabase.functions.invoke('notify-admin', {
        body: {
          type: 'new_provider_application',
          payload: {
            business_name:  form.business_name,
            service_title:  form.service_title,
            categories:     form.categories,
            contact_name:   form.contact_name,
            contact_email:  form.contact_email,
          },
        },
      }).catch(console.error)
      // Confirmation email to the applicant (fire-and-forget)
      supabase.auth.getSession().then(({ data: { session } }) => {
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-application-confirmation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({
            contact_email: form.contact_email,
            business_name: form.business_name,
            contact_name:  form.contact_name,
            languages:     form.languages ?? [],
          }),
        }).catch(err => console.warn('[confirmation-email] failed silently:', err))
      })
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const benefits = [
    { icon: '🌍', title: t('registro_proveedores.benefit1_title'), body: t('registro_proveedores.benefit1_body') },
    { icon: '⚡',  title: t('registro_proveedores.benefit2_title'), body: t('registro_proveedores.benefit2_body') },
    { icon: 'PAW', title: t('registro_proveedores.benefit3_title'), body: t('registro_proveedores.benefit3_body') },
    { icon: '🆓',  title: t('registro_proveedores.benefit4_title'), body: t('registro_proveedores.benefit4_body') },
  ]

  const steps = [
    { n: '01', title: t('registro_proveedores.step1_title'), body: t('registro_proveedores.step1_body') },
    { n: '02', title: t('registro_proveedores.step2_title'), body: t('registro_proveedores.step2_body') },
    { n: '03', title: t('registro_proveedores.step3_title'), body: t('registro_proveedores.step3_body') },
  ]

  const now = new Date()
  const EARLY_BIRD_END = new Date('2026-06-30T23:59:59Z')
  const isEarlyBird = now < EARLY_BIRD_END
  const earlyBirdDays = Math.max(0, Math.ceil((EARLY_BIRD_END - now) / 86400000))

  return (
    <main className="ppg">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="ppg-hero">
        <div className="ppg-hero__orb ppg-hero__orb--1" aria-hidden="true" />
        <div className="ppg-hero__orb ppg-hero__orb--2" aria-hidden="true" />
        <div className="container">
          <div className="ppg-hero__inner">
            <div className="ppg-hero__content">
              {(isEarlyBird || true) && (
                <div className="ppg-hero__promo">
                  <span className="ppg-hero__promo-badge">
                    {isEarlyBird ? '🚀 Early Bird' : '🎁 Bienvenida'}
                  </span>
                  <p className="ppg-hero__promo-text">
                    {isEarlyBird
                      ? <><strong>3 meses Gold GRATIS</strong> · Solo quedan <strong>{earlyBirdDays} días</strong> (hasta el 30 de junio)</>
                      : <><strong>1 mes Gold GRATIS</strong> para nuevos proveedores</>
                    }
                  </p>
                </div>
              )}
              <p className="eyebrow">{t('registro_proveedores.eyebrow')}</p>
              <h1 className="d-2xl ppg-hero__title">
                {t('registro_proveedores.title')}<br />
                <em>{t('registro_proveedores.title_em')}</em>
              </h1>
              <p className="t-lg ppg-hero__sub">{t('registro_proveedores.subtitle')}</p>
              <div className="ppg-hero__actions">
                <button className="btn btn-primary btn-lg" onClick={scrollToForm}>
                  <span>{t('registro_proveedores.cta_primary')}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <p className="t-sm ppg-hero__note">{t('registro_proveedores.cta_note')}</p>
              </div>
            </div>

            <div className="ppg-hero__visual" aria-hidden="true">
              <div className="ppg-card">
                <div className="ppg-card__header">
                  <div className="ppg-card__avatar">M</div>
                  <div className="ppg-card__info">
                    <strong>María Fernández</strong>
                    <span>Corredora de seguros</span>
                  </div>
                  <div className="ppg-card__badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <PawIcon size={11} /> Verificado
                  </div>
                </div>
                <div className="ppg-card__stats">
                  <div className="ppg-card__stat">
                    <span className="ppg-card__stat-n">47</span>
                    <span>contactos este mes</span>
                  </div>
                  <div className="ppg-card__stat">
                    <span className="ppg-card__stat-n">5</span>
                    <span>países atendidos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────── */}
      <section className="ppg-benefits section">
        <div className="container">
          <div className="ppg-benefits__header">
            <p className="eyebrow">{t('registro_proveedores.section_benefits')}</p>
            <h2 className="d-xl ppg-benefits__title">{t('registro_proveedores.benefits_title')}</h2>
          </div>
          <div className="ppg-benefits__grid">
            {benefits.map((b, i) => (
              <div key={i} className="ppg-benefit">
                <div className="ppg-benefit__icon">
                  {b.icon === 'PAW' ? <PawIcon size={28} /> : b.icon}
                </div>
                <div>
                  <h3 className="ppg-benefit__title">{b.title}</h3>
                  <p className="t-sm ppg-benefit__body">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps ────────────────────────────────────────── */}
      <section className="ppg-steps section">
        <div className="ppg-steps__orb" aria-hidden="true" />
        <div className="container">
          <h2 className="d-xl ppg-steps__title">{t('registro_proveedores.section_steps')}</h2>
          <div className="ppg-steps__list">
            {steps.map(s => (
              <div key={s.n} className="ppg-step">
                <div className="ppg-step__n">{s.n}</div>
                <div>
                  <h3 className="ppg-step__title">{s.title}</h3>
                  <p className="t-md ppg-step__desc">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form ─────────────────────────────────────────── */}
      <section className="ppg-form section" ref={formRef} id="apply-form">
        <div className="container">
          <div className="ppg-form__inner">

            {submitted && (
              <div className="ppg-success-overlay" onClick={() => setSubmitted(false)}>
                <div className="ppg-success-modal" onClick={e => e.stopPropagation()}>
                  <button className="ppg-success-modal__close" onClick={() => setSubmitted(false)} aria-label="Cerrar">✕</button>
                  <PawIcon size={52} className="ppg-form__success-icon" />
                  <h2 className="d-lg">{t('registro.exito_titulo')}</h2>
                  <p className="t-lg">{t('registro.exito_mensaje')}</p>
                </div>
              </div>
            )}
            <>
              <div className="ppg-form__header">
                <h2 className="d-lg ppg-form__title">{t('registro.titulo')}</h2>
                <p className="t-md ppg-form__subtitle">{t('registro.subtitulo')}</p>
              </div>

              <form className="ppg-form__form" onSubmit={handleSubmit} noValidate>

                {/* Sección 1: Negocio */}
                <div className="ppg-form__section">
                  <h3 className="ppg-form__section-title">{t('registro.seccion_negocio')}</h3>

                  <div className={`ppg-form__field${fieldErrors.business_name ? ' ppg-form__field--error' : ''}`}>
                    <label className="ppg-form__label" htmlFor="business_name">{t('registro.campo_nombre')} <em>*</em></label>
                    <span className="ppg-form__hint">{t('registro.campo_nombre_hint')}</span>

                    {/* Advertencia estática — siempre visible */}
                    <div className="name-hint-box">
                      <span className="name-hint-icon">⚠️</span>
                      <div>
                        <strong>El nombre debe identificarte a ti, no a tu servicio.</strong>
                        <div className="name-hint-examples">
                          <span className="name-example valid">✅ Daniela Valenzuela — Traductora Certificada</span>
                          <span className="name-example invalid">❌ Traducciones certificadas para Canadá</span>
                        </div>
                        <span className="name-hint-footer">Nombres genéricos serán rechazados en la revisión manual.</span>
                      </div>
                    </div>

                    <input
                      id="business_name"
                      value={form.business_name}
                      onChange={e => {
                        set('business_name', e.target.value)
                        clearErr('business_name')
                        setNameGenericWarning(isGenericProviderName(e.target.value))
                      }}
                      placeholder={t('registro.campo_nombre_placeholder')}
                    />
                    {fieldErrors.business_name && <span className="ppg-form__field-error">{fieldErrors.business_name}</span>}

                    {/* Warning en tiempo real — solo aparece si detecta nombre genérico */}
                    {nameGenericWarning && (
                      <div className="name-generic-warning" role="alert">
                        🚫 Este nombre parece describir un servicio, no una persona.
                        Usá tu nombre real seguido de tu especialidad.
                      </div>
                    )}
                  </div>

                  <label className={`ppg-form__field${fieldErrors.service_title ? ' ppg-form__field--error' : ''}`}>
                    <span className="ppg-form__label">{t('registro.campo_servicio')} <em>*</em></span>
                    <span className="ppg-form__hint">{t('registro.campo_servicio_hint')}</span>
                    <input value={form.service_title} onChange={e => { set('service_title', e.target.value); clearErr('service_title') }} placeholder={t('registro.campo_servicio_placeholder')} />
                    {fieldErrors.service_title && <span className="ppg-form__field-error">{fieldErrors.service_title}</span>}
                  </label>

                  <div className={`ppg-form__field${fieldErrors.categories ? ' ppg-form__field--error' : ''}`}>
                    <span className="ppg-form__label">{t('registro.campo_categorias')} <em>*</em></span>
                    <span className="ppg-form__hint">{t('registro.campo_categorias_hint')}</span>
                    <div className="ppg-form__checks ppg-form__checks--grid">
                      {CATEGORIES.map(c => (
                        <label key={c.value} className="ppg-form__check">
                          <input type="checkbox" checked={form.categories.includes(c.value)} onChange={() => { toggle('categories', c.value); clearErr('categories') }} />
                          <span>{t(c.labelKey)}</span>
                        </label>
                      ))}
                    </div>
                    {fieldErrors.categories && <span className="ppg-form__field-error">{fieldErrors.categories}</span>}
                  </div>

                  <label className={`ppg-form__field${fieldErrors.description ? ' ppg-form__field--error' : ''}`}>
                    <span className="ppg-form__label">{t('registro.campo_descripcion')} <em>*</em></span>
                    <span className="ppg-form__hint">{t('registro.campo_descripcion_hint')}</span>
                    <textarea rows={4} value={form.description} onChange={e => { set('description', e.target.value); clearErr('description') }} placeholder={t('registro.campo_descripcion_placeholder')} />
                    {fieldErrors.description && <span className="ppg-form__field-error">{fieldErrors.description}</span>}
                  </label>
                </div>

                {/* Sección 2: Detalles */}
                <div className="ppg-form__section">
                  <h3 className="ppg-form__section-title">{t('registro.seccion_detalles')}</h3>

                  <div className={`ppg-form__field${fieldErrors.languages ? ' ppg-form__field--error' : ''}`}>
                    <span className="ppg-form__label">{t('registro.campo_idiomas')} <em>*</em></span>
                    <div className="ppg-form__checks ppg-form__checks--inline">
                      {LANGUAGES.map(l => (
                        <label key={l.value} className="ppg-form__check">
                          <input type="checkbox" checked={form.languages.includes(l.value)} onChange={() => { toggle('languages', l.value); clearErr('languages') }} />
                          <span>{t(l.labelKey)}</span>
                        </label>
                      ))}
                    </div>
                    {fieldErrors.languages && <span className="ppg-form__field-error">{fieldErrors.languages}</span>}
                  </div>

                  <div className={`ppg-form__field${fieldErrors.countries ? ' ppg-form__field--error' : ''}`}>
                    <span className="ppg-form__label">{t('registro.campo_paises')} <em>*</em></span>
                    <div className="ppg-form__checks ppg-form__checks--grid">
                      {COUNTRIES.map(c => (
                        <label key={c.value} className="ppg-form__check">
                          <input type="checkbox" checked={form.countries.includes(c.value)} onChange={() => { toggle('countries', c.value); clearErr('countries') }} />
                          <span>{t(c.labelKey)}</span>
                        </label>
                      ))}
                    </div>
                    {fieldErrors.countries && <span className="ppg-form__field-error">{fieldErrors.countries}</span>}
                  </div>

                  <div className={`ppg-form__field${fieldErrors.modality ? ' ppg-form__field--error' : ''}`}>
                    <span className="ppg-form__label">{t('registro.campo_modalidad')} <em>*</em></span>
                    <div className="ppg-form__radios">
                      {[
                        [t('registro.modalidad_presencial'), 'Presencial'],
                        [t('registro.modalidad_online'),     'Online / Remoto'],
                        [t('registro.modalidad_ambas'),      'Ambos'],
                      ].map(([label, value]) => (
                        <label key={value} className="ppg-form__radio">
                          <input type="radio" name="modality" checked={form.modality === value} onChange={() => { set('modality', value); clearErr('modality') }} />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                    {fieldErrors.modality && <span className="ppg-form__field-error">{fieldErrors.modality}</span>}
                  </div>
                </div>

                {/* Sección 3: Contacto público */}
                <div className="ppg-form__section">
                  <h3 className="ppg-form__section-title">{t('registro.seccion_contacto')}</h3>

                  <div className={`ppg-form__field${fieldErrors.whatsapp ? ' ppg-form__field--error' : ''}`}>
                    <span className="ppg-form__label">{t('registro.campo_whatsapp')} <em>*</em></span>
                    <span className="ppg-form__hint">{t('registro.campo_whatsapp_hint')}</span>
                    <PhoneInput
                      international
                      defaultCountry="CL"
                      value={form.whatsapp}
                      onChange={v => { set('whatsapp', v ?? ''); clearErr('whatsapp') }}
                      countryOptionsOrder={['CL', 'CA', 'AR', 'CO', 'VE', 'MX', 'PE', 'ES', '|', '...']}
                      className="ppg-form__phone-input"
                    />
                    {fieldErrors.whatsapp && <span className="ppg-form__field-error">{fieldErrors.whatsapp}</span>}
                  </div>

                  <label className="ppg-form__field">
                    <span className="ppg-form__label">{t('registro.campo_instagram')} <span className="ppg-form__optional">({t('registro.opcional')})</span></span>
                    <input value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder={t('registro.campo_instagram_placeholder')} />
                  </label>

                  <label className="ppg-form__field">
                    <span className="ppg-form__label">{t('registro.campo_web')} <span className="ppg-form__optional">({t('registro.opcional')})</span></span>
                    <input type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder={t('registro.campo_web_placeholder')} />
                  </label>

                  <label className={`ppg-form__field${fieldErrors.profile_link ? ' ppg-form__field--error' : ''}`}>
                    <span className="ppg-form__label">{t('registro.campo_link_verificacion')} <em>*</em></span>
                    <span className="ppg-form__hint">{t('registro.campo_link_verificacion_hint')}</span>
                    <input type="url" value={form.profile_link} onChange={e => { set('profile_link', e.target.value); clearErr('profile_link') }} placeholder={t('registro.campo_link_verificacion_placeholder')} />
                    {fieldErrors.profile_link && <span className="ppg-form__field-error">{fieldErrors.profile_link}</span>}
                  </label>
                </div>

                {/* Sección 4: Datos internos */}
                <div className="ppg-form__section">
                  <h3 className="ppg-form__section-title">{t('registro.seccion_datos_internos')}</h3>
                  <p className="ppg-form__section-note">{t('registro.seccion_datos_internos_nota')}</p>

                  <label className={`ppg-form__field${fieldErrors.contact_name ? ' ppg-form__field--error' : ''}`}>
                    <span className="ppg-form__label">{t('registro.campo_nombre_contacto')} <em>*</em></span>
                    <input value={form.contact_name} onChange={e => { set('contact_name', e.target.value); clearErr('contact_name') }} placeholder={t('registro.campo_nombre_contacto_placeholder')} />
                    {fieldErrors.contact_name && <span className="ppg-form__field-error">{fieldErrors.contact_name}</span>}
                  </label>

                  <label className={`ppg-form__field${fieldErrors.contact_email ? ' ppg-form__field--error' : ''}`}>
                    <span className="ppg-form__label">{t('registro.campo_email')} <em>*</em></span>
                    <input type="email" value={form.contact_email} onChange={e => { set('contact_email', e.target.value); clearErr('contact_email') }} placeholder={t('registro.campo_email_placeholder')} />
                    {fieldErrors.contact_email && <span className="ppg-form__field-error">{fieldErrors.contact_email}</span>}
                  </label>
                </div>

                {/* Términos */}
                <div className="ppg-form__section ppg-form__section--terms">
                  <label className="ppg-form__check ppg-form__check--terms">
                    <input type="checkbox" checked={form.terms_accepted} onChange={e => { set('terms_accepted', e.target.checked); clearErr('terms_accepted') }} />
                    <span>{t('registro.terminos')} <em>*</em></span>
                  </label>
                  {fieldErrors.terms_accepted && <span className="ppg-form__field-error" style={{ marginTop: 6, display: 'block' }}>{fieldErrors.terms_accepted}</span>}
                </div>

                {error && <p className="ppg-form__error">{error}</p>}

                <button type="submit" className="btn btn-primary btn-lg ppg-form__submit" disabled={submitting}>
                  <span>{submitting ? t('registro.boton_enviando') : t('registro.boton_enviar')}</span>
                  {!submitting && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </form>
            </>
          </div>
        </div>
      </section>
    </main>
  )
}
