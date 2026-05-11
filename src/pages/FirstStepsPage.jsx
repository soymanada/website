// src/pages/FirstStepsPage.jsx
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './FirstStepsPage.css'

const WA_GROUP     = 'https://chat.whatsapp.com/CMIWk9cQkEIDso4Ll6JG8j'
const WA_SUBGROUPS = 'https://chat.whatsapp.com/CMIWk9cQkEIDso4Ll6JG8j'

const DEST_COUNTRIES = [
  { id: 'canada',      code: 'ca', available: true  },
  { id: 'new-zealand', code: 'nz', available: true  },
  { id: 'australia',   code: 'au', available: true  },
]

const ORIGIN_COUNTRIES = [
  { id: 'chile',     code: 'cl', available: true  },
  { id: 'argentina', code: 'ar', available: true  },
  { id: 'colombia',  code: 'co', available: true  },
  { id: 'venezuela', code: 've', available: true  },
  { id: 'mexico',    code: 'mx', available: true  },
]

// WHV eligibility matrix: eligible = true | false | 'check'
const WHV_DATA = {
  canada: {
    chile:     { eligible: true,  ageMax: 35, note: 'IEC – Working Holiday', link: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec/eligibility.html' },
    argentina: { eligible: true,  ageMax: 35, note: 'IEC – Working Holiday', link: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec/eligibility.html' },
    colombia:  { eligible: true,  ageMax: 35, note: 'IEC – Working Holiday', link: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec/eligibility.html' },
    mexico:    { eligible: true,  ageMax: 30, note: 'IEC – Working Holiday', link: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec/eligibility.html' },
    venezuela: { eligible: false },
  },
  'new-zealand': {
    chile:     { eligible: true,  ageMax: 35, note: 'WHV · cuota ~1.500/año', link: 'https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/visa-factsheet/chile-working-holiday-visa' },
    argentina: { eligible: true,  ageMax: 35, note: 'WHV', link: 'https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visas/visa-categories/work/working-holiday-visas' },
    colombia:  { eligible: 'check', link: 'https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visas/visa-categories/work/working-holiday-visas' },
    mexico:    { eligible: true,  ageMax: 30, note: 'WHV', link: 'https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visas/visa-categories/work/working-holiday-visas' },
    venezuela: { eligible: false },
  },
  australia: {
    chile:     { eligible: true, ageMax: 30, note: 'Subclase 462', link: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462' },
    argentina: { eligible: true, ageMax: 30, note: 'Subclase 462', link: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462' },
    colombia:  { eligible: true, ageMax: 30, note: 'Subclase 462', link: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462' },
    mexico:    { eligible: true, ageMax: 30, note: 'Subclase 462', link: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462' },
    venezuela: { eligible: false },
  },
}

const FlagImg = ({ code, label }) => (
  <img
    src={`https://flagcdn.com/24x18/${code}.png`}
    srcSet={`https://flagcdn.com/48x36/${code}.png 2x`}
    width="24" height="18"
    alt={label}
    className="fsp__dest-pill-flag"
  />
)

const setMeta = (sel, val) => {
  let el = document.querySelector(sel)
  if (!el) { el = document.createElement('meta'); document.head.appendChild(el) }
  el.setAttribute(sel.includes('name=') ? 'name' : 'property', sel.match(/["']([^"']+)["']/)[1])
  el.setAttribute('content', val)
}

function CtaButton({ href, to, icon = '→', label, variant = 'community' }) {
  const cls = `fsp__cta-btn fsp__cta-btn--${variant}`
  if (to) return <Link to={to} className={cls}><span className="fsp__cta-btn-icon">{icon}</span>{label}</Link>
  return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}><span className="fsp__cta-btn-icon">{icon}</span>{label}</a>
}

function Step({ n, title, body }) {
  return (
    <div className="fsp__step">
      <span className="fsp__step-num">{n}</span>
      <div><strong>{title}</strong><p>{body}</p></div>
    </div>
  )
}

function Tip({ text }) {
  return (
    <div className="fsp__tip">
      <span className="fsp__tip-icon">💡</span>
      <p>{text}</p>
    </div>
  )
}

function WhvCard({ t, dest, origin }) {
  const data = WHV_DATA[dest]?.[origin]
  if (!data) return null

  const notEligibleMsg = dest === 'canada'
    ? t('first_steps.whv_venezuela_ca')
    : dest === 'new-zealand'
    ? t('first_steps.whv_venezuela_nz')
    : t('first_steps.whv_venezuela_au')

  const checkMsg = t('first_steps.whv_check_nz_co')

  const boxStyle = {
    border: `1.5px solid ${data.eligible === true ? 'var(--iris-200)' : data.eligible === false ? '#fecaca' : '#fef3c7'}`,
    borderRadius: 'var(--r-xl)',
    padding: 20,
    marginBottom: 20,
    background: data.eligible === true ? '#f0fdf4' : data.eligible === false ? '#fff5f5' : '#fffbeb',
  }

  return (
    <div style={boxStyle}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10, color: 'var(--iris-900)' }}>
        {t('first_steps.whv_section_title')}
      </h3>
      {data.eligible === true && (
        <>
          <p style={{ fontSize: '0.9rem', color: '#15803d', fontWeight: 600, marginBottom: 6 }}>
            {t('first_steps.whv_eligible_label')}
          </p>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-500)', marginBottom: 10 }}>
            {t('first_steps.whv_age_label', { age: data.ageMax })}
            {data.note && <> · <em>{data.note}</em></>}
          </p>
          <a href={data.link} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '0.85rem', color: 'var(--iris-600)', fontWeight: 600 }}>
            {t('first_steps.whv_official_cta')} →
          </a>
        </>
      )}
      {data.eligible === false && (
        <p style={{ fontSize: '0.9rem', color: '#b91c1c', lineHeight: 1.6 }}>{notEligibleMsg}</p>
      )}
      {data.eligible === 'check' && (
        <>
          <p style={{ fontSize: '0.9rem', color: '#92400e', lineHeight: 1.6, marginBottom: 10 }}>
            {t('first_steps.whv_check_label')} — {checkMsg}
          </p>
          <a href={data.link} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '0.85rem', color: 'var(--iris-600)', fontWeight: 600 }}>
            {t('first_steps.whv_official_cta')} →
          </a>
        </>
      )}
    </div>
  )
}

export default function FirstStepsPage() {
  const { t } = useTranslation()
  const country = t('common.currentCountry')

  const [searchParams] = useSearchParams()
  const initialDest   = DEST_COUNTRIES.find(c => c.id === searchParams.get('dest'))?.id ?? 'canada'
  const initialOrigin = ORIGIN_COUNTRIES.find(c => c.id === searchParams.get('from'))?.id ?? 'chile'

  const [selectedDest,   setSelectedDest]   = useState(initialDest)
  const [selectedOrigin, setSelectedOrigin] = useState(initialOrigin)
  const [active,         setActive]         = useState('sin')

  const destData      = DEST_COUNTRIES.find(c => c.id === selectedDest)
  const originData    = ORIGIN_COUNTRIES.find(c => c.id === selectedOrigin)
  const destAvailable = !!(destData?.available && originData?.available)
  const destLabel     = t(`first_steps.dest_${selectedDest.replace('-', '_')}`)

  const sinTabLabel = selectedDest === 'canada'
    ? t('first_steps.tab_sin_ca')
    : selectedDest === 'new-zealand'
    ? t('first_steps.tab_sin_nz')
    : t('first_steps.tab_sin_au')

  const TABS = [
    { id: 'sin',      icon: '🪪', label: sinTabLabel },
    { id: 'banca',    icon: '🏦', label: t('first_steps.tab_banca') },
    { id: 'arriendo', icon: '🏠', label: t('first_steps.tab_arriendo') },
    { id: 'trabajo',  icon: '💼', label: t('first_steps.tab_trabajo') },
    { id: 'visas',    icon: '📋', label: t('first_steps.tab_visas') },
  ]

  useEffect(() => {
    const title = t('first_steps.meta_title', { country })
    const description = t('first_steps.sub')
    document.title = title
    setMeta('[property="og:title"]',       title)
    setMeta('[property="og:description"]', description)
    setMeta('[property="og:url"]',         'https://soymanada.com/primeros-pasos')
    setMeta('[property="og:type"]',        'article')
    setMeta('[name="description"]',        description)
    return () => {
      document.title = 'SoyManada – Directorio para la comunidad migrante'
      setMeta('[property="og:title"]',       'SoyManada – Directorio para la comunidad migrante')
      setMeta('[property="og:description"]', 'Encuentra proveedores verificados de seguros, migración, traducciones, banca y más.')
      setMeta('[property="og:url"]',         'https://soymanada.com/')
      setMeta('[property="og:type"]',        'website')
      setMeta('[name="description"]',        'SoyManada – El directorio de confianza para la comunidad migrante. Conecta con servicios verificados.')
    }
  }, [country])

  return (
    <main className="fsp">
      <div className="fsp__hero">
        <div className="fsp__hero-orb" aria-hidden="true" />
        <div className="container">
          <p className="fsp__eyebrow">{t('first_steps.eyebrow')}</p>
          <h1 className="fsp__title">
            {t('first_steps.title')}<br />
            <em>{t('first_steps.title_em', { country: destLabel })}</em>
          </h1>
          <p className="fsp__sub">{t('first_steps.sub')}</p>

          {/* ── Country selector ─────────────────────────────── */}
          <div className="fsp__dest-selector">
            {/* Origin row */}
            <span className="fsp__dest-label">{t('hero.guide_from_label')}</span>
            <div className="fsp__dest-pills" style={{ marginBottom: 10 }}>
              {ORIGIN_COUNTRIES.map(c => {
                const name = t(`hero.origin_${c.id}`)
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={[
                      'fsp__dest-pill',
                      selectedOrigin === c.id ? 'fsp__dest-pill--active' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => setSelectedOrigin(c.id)}
                    aria-pressed={selectedOrigin === c.id}
                  >
                    <FlagImg code={c.code} label={name} />
                    <span className="fsp__dest-pill-name">{name}</span>
                  </button>
                )
              })}
            </div>

            {/* Destination row */}
            <span className="fsp__dest-label">{t('hero.guide_to_label')}</span>
            <div className="fsp__dest-pills">
              {DEST_COUNTRIES.map(c => {
                const name = t(`first_steps.dest_${c.id.replace('-', '_')}`)
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={[
                      'fsp__dest-pill',
                      selectedDest === c.id ? 'fsp__dest-pill--active' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => setSelectedDest(c.id)}
                    aria-pressed={selectedDest === c.id}
                  >
                    <FlagImg code={c.code} label={name} />
                    <span className="fsp__dest-pill-name">{name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="fsp__body container">
        <Link to="/equipaje" className="fsp__baggage-banner">
          <span className="fsp__baggage-banner__icon">🧳</span>
          <div className="fsp__baggage-banner__text">
            <strong>Simulador de equipaje</strong>
            <span>Compara los costos de equipaje extra por aerolínea antes de viajar</span>
          </div>
          <span className="fsp__baggage-banner__arrow">→</span>
        </Link>

        {destAvailable ? (
          <>
            <nav className="fsp__tabs" aria-label="Secciones">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`fsp__tab${active === tab.id ? ' fsp__tab--active' : ''}`}
                  onClick={() => setActive(tab.id)}
                >
                  <span className="fsp__tab-icon">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
            <div className="fsp__panel">
              {selectedDest === 'canada' && (
                <>
                  {active === 'sin'      && <SinContent      t={t} />}
                  {active === 'banca'    && <BancaContent    t={t} country={country} />}
                  {active === 'arriendo' && <ArriendoContent t={t} country={country} />}
                  {active === 'trabajo'  && <TrabajoContent  t={t} country={country} />}
                  {active === 'visas'    && <VisasContent    t={t} country={country} origin={selectedOrigin} />}
                </>
              )}
              {selectedDest === 'new-zealand' && (
                <>
                  {active === 'sin'      && <NZSinContent      t={t} />}
                  {active === 'banca'    && <NZBancaContent    t={t} />}
                  {active === 'arriendo' && <NZArriendoContent t={t} />}
                  {active === 'trabajo'  && <NZTrabajoContent  t={t} />}
                  {active === 'visas'    && <NZVisasContent    t={t} origin={selectedOrigin} />}
                </>
              )}
              {selectedDest === 'australia' && (
                <>
                  {active === 'sin'      && <AUSinContent      t={t} />}
                  {active === 'banca'    && <AUBancaContent    t={t} />}
                  {active === 'arriendo' && <AUArriendoContent t={t} />}
                  {active === 'trabajo'  && <AUTrabajoContent  t={t} />}
                  {active === 'visas'    && <AUVisasContent    t={t} origin={selectedOrigin} />}
                </>
              )}
            </div>
          </>
        ) : (
          <ComingSoonPanel
            t={t}
            destId={selectedDest}
            dest={DEST_COUNTRIES.find(c => c.id === selectedDest)}
          />
        )}
      </div>
    </main>
  )
}
