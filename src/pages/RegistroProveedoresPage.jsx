import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { trackEvent, Events } from '../utils/analytics'
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
    if (form.categories.length === 0) { setError(t('registro.validacion_categoria')); return }
    if (form.languages.length  === 0) { setError(t('registro.validacion_idioma'));    return }
    if (form.countries.length  === 0) { setError(t('registro.validacion_pais'));      return }
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

                  <label className="ppg-form__field">
                    <span className="ppg-form__label">{t('registro.campo_nombre')} <em>*</em></span>
                    <span className="ppg-form__hint">{t('registro.campo_nombre_hint')}</span>
                    <input required value={form.business_name} onChange={e => set('business_name', e.target.value)} placeholder={t('registro.campo_nombre_placeholder')} />
                  </label>

                  <label className="ppg-form__field">
                    <span className="ppg-form__label">{t('registro.campo_servicio')} <em>*</em></span>
                    <span className="ppg-form__hint">{t('registro.campo_servicio_hint')}</span>
                    <input required value={form.service_title} onChange={e => set('service_title', e.target.value)} placeholder={t('registro.campo_servicio_placeholder')} />
                  </label>

                  <div className="ppg-form__field">
                    <span className="ppg-form__label">{t('registro.campo_categorias')} <em>*</em></span>
                    <span className="ppg-form__hint">{t('registro.campo_categorias_hint')}</span>
                    <div className="ppg-form__checks ppg-form__checks--grid">
                      {CATEGORIES.map(c => (
                        <label key={c.value} className="ppg-form__check">
                          <input type="checkbox" checked={form.categories.includes(c.value)} onChange={() => toggle('categories', c.value)} />
                          <span>{t(c.labelKey)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="ppg-form__field">
                    <span className="ppg-form__label">{t('registro.campo_descripcion')} <em>*</em></span>
                    <span className="ppg-form__hint">{t('registro.campo_descripcion_hint')}</span>
                    <textarea required rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder={t('registro.campo_descripcion_placeholder')} />
                  </label>
                </div>

                {/* Sección 2: Detalles */}
                <div className="ppg-form__section">
                  <h3 className="ppg-form__section-title">{t('registro.seccion_detalles')}</h3>

                  <div className="ppg-form__field">
                    <span className="ppg-form__label">{t('registro.campo_idiomas')} <em>*</em></span>
                    <div className="ppg-form__checks ppg-form__checks--inline">
                      {LANGUAGES.map(l => (
                        <label key={l.value} className="ppg-form__check">
                          <input type="checkbox" checked={form.languages.includes(l.value)} onChange={() => toggle('languages', l.value)} />
                          <span>{t(l.labelKey)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="ppg-form__field">
                    <span className="ppg-form__label">{t('registro.campo_paises')} <em>*</em></span>
                    <div className="ppg-form__checks ppg-form__checks--grid">
                      {COUNTRIES.map(c => (
                        <label key={c.value} className="ppg-form__check">
                          <input type="checkbox" checked={form.countries.includes(c.value)} onChange={() => toggle('countries', c.value)} />
                          <span>{t(c.labelKey)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="ppg-form__field">
                    <span className="ppg-form__label">{t('registro.campo_modalidad')} <em>*</em></span>
                    <div className="ppg-form__radios">
                      {[
                        [t('registro.modalidad_presencial'), 'Presencial'],
                        [t('registro.modalidad_online'),     'Online / Remoto'],
                        [t('registro.modalidad_ambas'),      'Ambos'],
                      ].map(([label, value]) => (
                        <label key={value} className="ppg-form__radio">
                          <input type="radio" name="modality" required checked={form.modality === value} onChange={() => set('modality', value)} />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sección 3: Contacto público */}
                <div className="ppg-form__section">
                  <h3 className="ppg-form__section-title">{t('registro.seccion_contacto')}</h3>

                  <div className="ppg-form__field">
                    <span className="ppg-form__label">{t('registro.campo_whatsapp')} <em>*</em></span>
                    <span className="ppg-form__hint">{t('registro.campo_whatsapp_hint')}</span>
                    <PhoneInput
                      international
                      defaultCountry="CL"
                      value={form.whatsapp}
                      onChange={v => set('whatsapp', v ?? '')}
                      countryOptionsOrder={['CL', 'CA', 'AR', 'CO', 'VE', 'MX', 'PE', 'ES', '|', '...']}
                      className="ppg-form__phone-input"
                    />
                  </div>

                  <label className="ppg-form__field">
                    <span className="ppg-form__label">{t('registro.campo_instagram')} <span className="ppg-form__optional">({t('registro.opcional')})</span></span>
                    <input value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder={t('registro.campo_instagram_placeholder')} />
                  </label>

                  <label className="ppg-form__field">
                    <span className="ppg-form__label">{t('registro.campo_web')} <span className="ppg-form__optional">({t('registro.opcional')})</span></span>
                    <input type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder={t('registro.campo_web_placeholder')} />
                  </label>

                  <label className="ppg-form__field">
                    <span className="ppg-form__label">{t('registro.campo_link_verificacion')} <em>*</em></span>
                    <span className="ppg-form__hint">{t('registro.campo_link_verificacion_hint')}</span>
                    <input required type="url" value={form.profile_link} onChange={e => set('profile_link', e.target.value)} placeholder={t('registro.campo_link_verificacion_placeholder')} />
                  </label>
                </div>

                {/* Sección 4: Datos internos */}
                <div className="ppg-form__section">
                  <h3 className="ppg-form__section-title">{t('registro.seccion_datos_internos')}</h3>
                  <p className="ppg-form__section-note">{t('registro.seccion_datos_internos_nota')}</p>

                  <label className="ppg-form__field">
                    <span className="ppg-form__label">{t('registro.campo_nombre_contacto')} <em>*</em></span>
                    <input required value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder={t('registro.campo_nombre_contacto_placeholder')} />
                  </label>

                  <label className="ppg-form__field">
                    <span className="ppg-form__label">{t('registro.campo_email')} <em>*</em></span>
                    <input required type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder={t('registro.campo_email_placeholder')} />
                  </label>
                </div>

                {/* Términos */}
                <div className="ppg-form__section ppg-form__section--terms">
                  <label className="ppg-form__check ppg-form__check--terms">
                    <input type="checkbox" required checked={form.terms_accepted} onChange={e => set('terms_accepted', e.target.checked)} />
                    <span>{t('registro.terminos')} <em>*</em></span>
                  </label>
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
