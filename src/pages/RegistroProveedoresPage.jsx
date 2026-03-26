import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { trackEvent, Events } from '../utils/analytics'
import { supabase } from '../lib/supabase'
import PawIcon from '../components/PawIcon'
import './RegistroProveedoresPage.css'

const CATEGORIES = [
  'Seguros y finanzas',
  'Asesoría migratoria o legal',
  'Traducciones e interpretación',
  'Trabajo y empleo',
  'Alojamiento y bienes raíces',
  'Idiomas y educación',
  'Banca',
  'Salud mental y bienestar',
  'Taxes e impuestos',
]

const LANGUAGES = ['Español', 'Inglés', 'Portugués', 'Francés', 'Otro']

const COUNTRIES = [
  'Alemania', 'Australia', 'Austria', 'Canadá', 'Chile', 'Corea del Sur',
  'Dinamarca', 'Francia', 'Hungría', 'Irlanda', 'Islandia', 'Japón',
  'Luxemburgo', 'Nueva Zelanda', 'Polonia', 'Portugal', 'República Checa', 'Suecia', 'Otro',
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
  const [form, setForm]           = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => { window.scrollTo(0, 0) }, [])

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
    if (form.categories.length === 0) { setError('Selecciona al menos una categoría.'); return }
    if (form.languages.length  === 0) { setError('Selecciona al menos un idioma.');    return }
    if (form.countries.length  === 0) { setError('Selecciona al menos un país.');      return }
    setSubmitting(true)
    setError('')
    const { error: dbErr } = await supabase.from('provider_applications').insert({
      business_name: form.business_name,
      service_title: form.service_title,
      categories:    form.categories,
      description:   form.description,
      languages:     form.languages,
      countries:     form.countries,
      modality:      form.modality,
      whatsapp:      form.whatsapp,
      instagram:     form.instagram  || null,
      website:       form.website    || null,
      profile_link:  form.profile_link,
      contact_name:  form.contact_name,
      contact_email: form.contact_email,
      terms_accepted: form.terms_accepted,
    })
    if (dbErr) {
      setError('Hubo un error al enviar. Por favor intenta de nuevo.')
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

  return (
    <main className="ppg">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="ppg-hero">
        <div className="ppg-hero__orb ppg-hero__orb--1" aria-hidden="true" />
        <div className="ppg-hero__orb ppg-hero__orb--2" aria-hidden="true" />
        <div className="container">
          <div className="ppg-hero__inner">
            <div className="ppg-hero__content">
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

            {submitted ? (
              <div className="ppg-form__success">
                <PawIcon size={52} className="ppg-form__success-icon" />
                <h2 className="d-lg">¡Postulación enviada!</h2>
                <p className="t-lg">Revisaremos tu información y te contactaremos al correo indicado si tu perfil encaja con el directorio. Gracias por querer ser parte de SoyManada.</p>
              </div>
            ) : (
              <>
                <div className="ppg-form__header">
                  <h2 className="d-lg ppg-form__title">Postúlate ahora</h2>
                  <p className="t-md ppg-form__subtitle">Completa el formulario — toma menos de 3 minutos. Revisaremos tu postulación y te contactaremos si encaja con el directorio.</p>
                </div>

                <form className="ppg-form__form" onSubmit={handleSubmit} noValidate>

                  {/* Sección 1: Negocio */}
                  <div className="ppg-form__section">
                    <h3 className="ppg-form__section-title">Información del negocio</h3>

                    <label className="ppg-form__field">
                      <span className="ppg-form__label">Nombre del negocio o profesional <em>*</em></span>
                      <span className="ppg-form__hint">tal como aparecerá en el directorio</span>
                      <input required value={form.business_name} onChange={e => set('business_name', e.target.value)} placeholder="Ej: Objetivo Canadá" />
                    </label>

                    <label className="ppg-form__field">
                      <span className="ppg-form__label">¿Cómo describirías tu servicio en 5 palabras o menos? <em>*</em></span>
                      <span className="ppg-form__hint">aparecerá como subtítulo en tu tarjeta. Ej: "Visas de trabajo y residencia"</span>
                      <input required value={form.service_title} onChange={e => set('service_title', e.target.value)} placeholder="Ej: Visas de trabajo y residencia" />
                    </label>

                    <div className="ppg-form__field">
                      <span className="ppg-form__label">Categoría de tu servicio <em>*</em></span>
                      <span className="ppg-form__hint">Selecciona todas las que apliquen</span>
                      <div className="ppg-form__checks ppg-form__checks--grid">
                        {CATEGORIES.map(c => (
                          <label key={c} className="ppg-form__check">
                            <input type="checkbox" checked={form.categories.includes(c)} onChange={() => toggle('categories', c)} />
                            <span>{c}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <label className="ppg-form__field">
                      <span className="ppg-form__label">Describe brevemente qué servicio ofreces y cómo ayudas a la comunidad migrante <em>*</em></span>
                      <span className="ppg-form__hint">máximo 2–3 líneas</span>
                      <textarea required rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Ofrezco..." />
                    </label>
                  </div>

                  {/* Sección 2: Detalles */}
                  <div className="ppg-form__section">
                    <h3 className="ppg-form__section-title">Detalles del servicio</h3>

                    <div className="ppg-form__field">
                      <span className="ppg-form__label">¿En qué idiomas puedes atender a tus clientes? <em>*</em></span>
                      <div className="ppg-form__checks ppg-form__checks--inline">
                        {LANGUAGES.map(l => (
                          <label key={l} className="ppg-form__check">
                            <input type="checkbox" checked={form.languages.includes(l)} onChange={() => toggle('languages', l)} />
                            <span>{l}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="ppg-form__field">
                      <span className="ppg-form__label">¿En qué país opera principalmente tu servicio? <em>*</em></span>
                      <div className="ppg-form__checks ppg-form__checks--grid">
                        {COUNTRIES.map(c => (
                          <label key={c} className="ppg-form__check">
                            <input type="checkbox" checked={form.countries.includes(c)} onChange={() => toggle('countries', c)} />
                            <span>{c}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="ppg-form__field">
                      <span className="ppg-form__label">Modalidad principal del servicio <em>*</em></span>
                      <div className="ppg-form__radios">
                        {['Presencial', 'Online / Remoto', 'Ambos'].map(m => (
                          <label key={m} className="ppg-form__radio">
                            <input type="radio" name="modality" required checked={form.modality === m} onChange={() => set('modality', m)} />
                            <span>{m}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sección 3: Contacto público */}
                  <div className="ppg-form__section">
                    <h3 className="ppg-form__section-title">Contacto público</h3>

                    <label className="ppg-form__field">
                      <span className="ppg-form__label">WhatsApp de contacto <em>*</em></span>
                      <span className="ppg-form__hint">Incluir código de país. Ej: +56 9 XXXX XXXX</span>
                      <input required type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+1 604 XXX XXXX" />
                    </label>

                    <label className="ppg-form__field">
                      <span className="ppg-form__label">Instagram o red social profesional <span className="ppg-form__optional">(Opcional)</span></span>
                      <input value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@usuario" />
                    </label>

                    <label className="ppg-form__field">
                      <span className="ppg-form__label">Sitio web o página profesional <span className="ppg-form__optional">(Opcional)</span></span>
                      <input type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." />
                    </label>

                    <label className="ppg-form__field">
                      <span className="ppg-form__label">Link a perfil público para verificación <em>*</em></span>
                      <span className="ppg-form__hint">LinkedIn, Instagram, website donde podamos verificar tu actividad profesional</span>
                      <input required type="url" value={form.profile_link} onChange={e => set('profile_link', e.target.value)} placeholder="https://linkedin.com/in/..." />
                    </label>
                  </div>

                  {/* Sección 4: Datos internos */}
                  <div className="ppg-form__section">
                    <h3 className="ppg-form__section-title">Datos de contacto internos</h3>
                    <p className="ppg-form__section-note">Solo para comunicación interna de SoyManada. No se publicarán en el directorio.</p>

                    <label className="ppg-form__field">
                      <span className="ppg-form__label">Nombre completo del contacto principal <em>*</em></span>
                      <input required value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="María González" />
                    </label>

                    <label className="ppg-form__field">
                      <span className="ppg-form__label">Correo electrónico de contacto <em>*</em></span>
                      <input required type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="tu@email.com" />
                    </label>
                  </div>

                  {/* Términos */}
                  <div className="ppg-form__section ppg-form__section--terms">
                    <label className="ppg-form__check ppg-form__check--terms">
                      <input type="checkbox" required checked={form.terms_accepted} onChange={e => set('terms_accepted', e.target.checked)} />
                      <span>Acepto que la información ingresada es correcta y autorizo a SoyManada a publicar el nombre del negocio, descripción y canales de contacto en el directorio si mi postulación es aprobada. Entiendo que SoyManada se reserva el derecho de aceptar o rechazar postulaciones. <em>*</em></span>
                    </label>
                  </div>

                  {error && <p className="ppg-form__error">{error}</p>}

                  <button type="submit" className="btn btn-primary btn-lg ppg-form__submit" disabled={submitting}>
                    <span>{submitting ? 'Enviando…' : 'Enviar postulación'}</span>
                    {!submitting && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
