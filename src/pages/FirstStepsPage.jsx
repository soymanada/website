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

// ─────────────────────────────────────────────────────────────────────────────
// AUSTRALIA CONTENT COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function AUSinContent({ t }) {
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">{t('first_steps.au_tfn_title')}</h2>
      <p className="fsp__content-lead">{t('first_steps.au_tfn_lead')}</p>
      <div className="fsp__steps">
        <Step n="01" title={t('first_steps.au_tfn_step1_title')} body={t('first_steps.au_tfn_step1')} />
        <Step n="02" title={t('first_steps.au_tfn_step2_title')} body={t('first_steps.au_tfn_step2')} />
        <Step n="03" title={t('first_steps.au_tfn_step3_title')} body={t('first_steps.au_tfn_step3')} />
        <Step n="04" title={t('first_steps.au_tfn_step4_title')} body={t('first_steps.au_tfn_step4')} />
      </div>
      <Tip text={t('first_steps.au_tfn_tip')} />
      <div className="fsp__office-finder" style={{ marginTop: 24 }}>
        <div className="fsp__office-finder__icon">📄</div>
        <div className="fsp__office-finder__body">
          <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', color: 'var(--iris-900)' }}>
            {t('first_steps.au_tfn_docs_title')}
          </h4>
          <p className="fsp__office-finder__desc">{t('first_steps.au_tfn_docs_body')}</p>
        </div>
      </div>
      <div className="fsp__office-finder">
        <div className="fsp__office-finder__icon">📍</div>
        <div className="fsp__office-finder__body">
          <p className="fsp__office-finder__desc">{t('first_steps.au_tfn_ato_desc')}</p>
          <a href="https://www.ato.gov.au/individuals-and-families/tax-file-number/apply-for-a-tfn"
            target="_blank" rel="noopener noreferrer" className="fsp__office-finder__btn">
            {t('first_steps.au_tfn_ato_cta')}
          </a>
        </div>
      </div>
      <div className="fsp__box fsp__box--safe" style={{ marginTop: 20 }}>
        <h3>{t('first_steps.au_super_box_title')}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-500)', lineHeight: 1.7, margin: 0 }}>
          {t('first_steps.au_super_box_body')}
        </p>
      </div>
      <CtaButton href={WA_GROUP} icon="💬" label={t('first_steps.cta_community')} variant="community" />
    </div>
  )
}

function AUBancaContent({ t }) {
  const banks = [
    { name: 'CommBank', full: 'Commonwealth Bank of Australia', pros: t('first_steps.au_banca_commbank_pros'), cons: t('first_steps.au_banca_commbank_cons'), url: 'https://www.commbank.com.au/personal/accounts.html' },
    { name: 'ANZ',      full: 'ANZ Bank',                       pros: t('first_steps.au_banca_anz_pros'),      cons: t('first_steps.au_banca_anz_cons'),      url: 'https://www.anz.com.au/personal/bank-accounts/' },
    { name: 'NAB',      full: 'National Australia Bank',        pros: t('first_steps.au_banca_nab_pros'),      cons: t('first_steps.au_banca_nab_cons'),      url: 'https://www.nab.com.au/personal/bank-accounts' },
    { name: 'Westpac',  full: 'Westpac Banking Corporation',    pros: t('first_steps.au_banca_westpac_pros'),  cons: t('first_steps.au_banca_westpac_cons'),  url: 'https://www.westpac.com.au/personal-banking/bank-accounts/' },
  ]
  const sims = [
    { name: 'Telstra',   pros: t('first_steps.au_sim_telstra_pros'),   cons: t('first_steps.au_sim_telstra_cons'),   url: 'https://www.telstra.com.au/mobile-phones/prepaid' },
    { name: 'Optus',     pros: t('first_steps.au_sim_optus_pros'),     cons: t('first_steps.au_sim_optus_cons'),     url: 'https://www.optus.com.au/mobile/prepaid' },
    { name: 'Vodafone',  pros: t('first_steps.au_sim_vodafone_pros'),  cons: t('first_steps.au_sim_vodafone_cons'),  url: 'https://www.vodafone.com.au/prepaid' },
  ]
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">{t('first_steps.au_banca_title')}</h2>
      <p className="fsp__content-lead">{t('first_steps.au_banca_lead')}</p>
      <div className="fsp__bank-grid">
        {banks.map(b => (
          <div key={b.name} className="fsp__bank-card">
            <div className="fsp__bank-header">
              <span className="fsp__bank-name">{b.name}</span>
              <span className="fsp__bank-full">{b.full}</span>
            </div>
            <div className="fsp__bank-body">
              <p><strong>✅ {t('first_steps.banca_pros_label')}:</strong> {b.pros}</p>
              <p><strong>⚠️ {t('first_steps.banca_cons_label')}:</strong> {b.cons}</p>
            </div>
            <a href={b.url} target="_blank" rel="noopener noreferrer" className="fsp__bank-link">{t('first_steps.banca_link')}</a>
          </div>
        ))}
      </div>
      <Tip text={t('first_steps.au_banca_tip')} />

      <h3 className="fsp__content-title" style={{ marginTop: 32, fontSize: '1.1rem' }}>{t('first_steps.au_sim_title')}</h3>
      <p className="fsp__content-lead" style={{ marginBottom: 16 }}>{t('first_steps.au_sim_lead')}</p>
      <div className="fsp__bank-grid">
        {sims.map(s => (
          <div key={s.name} className="fsp__bank-card">
            <div className="fsp__bank-header">
              <span className="fsp__bank-name">{s.name}</span>
            </div>
            <div className="fsp__bank-body">
              <p><strong>✅ {t('first_steps.banca_pros_label')}:</strong> {s.pros}</p>
              <p><strong>⚠️ {t('first_steps.banca_cons_label')}:</strong> {s.cons}</p>
            </div>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="fsp__bank-link">{t('first_steps.banca_link')}</a>
          </div>
        ))}
      </div>
      <CtaButton href={WA_GROUP} icon="💬" label={t('first_steps.cta_community')} variant="community" />
    </div>
  )
}

function AUArriendoContent({ t }) {
  const cities = [
    { label: t('first_steps.au_city_sydney_label'),    body: t('first_steps.au_city_sydney_body') },
    { label: t('first_steps.au_city_melbourne_label'), body: t('first_steps.au_city_melbourne_body') },
    { label: t('first_steps.au_city_brisbane_label'),  body: t('first_steps.au_city_brisbane_body') },
    { label: t('first_steps.au_city_perth_label'),     body: t('first_steps.au_city_perth_body') },
  ]
  const portals = [
    { label: t('first_steps.au_arriendo_safe1'), href: t('first_steps.au_arriendo_safe1_url') },
    { label: t('first_steps.au_arriendo_safe2'), href: t('first_steps.au_arriendo_safe2_url') },
    { label: t('first_steps.au_arriendo_safe3'), href: t('first_steps.au_arriendo_safe3_url') },
  ]
  const scams = ['au_arriendo_scam1','au_arriendo_scam2','au_arriendo_scam3','au_arriendo_scam4']
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">{t('first_steps.au_arriendo_title')}</h2>
      <p className="fsp__content-lead">{t('first_steps.au_arriendo_lead')}</p>

      {/* Cost of living */}
      <div className="fsp__box fsp__box--safe" style={{ marginBottom: 24 }}>
        <h3>{t('first_steps.au_costs_title')}</h3>
        <ul>
          <li>🏠 {t('first_steps.au_cost_room')}</li>
          <li>🛒 {t('first_steps.au_cost_food')}</li>
          <li>🚌 {t('first_steps.au_cost_transport')}</li>
        </ul>
        <p style={{ marginTop: 10, fontSize: '0.88rem', color: 'var(--text-600)', fontStyle: 'italic' }}>
          {t('first_steps.au_cost_total')}
        </p>
      </div>

      {/* Cities */}
      <h3 className="fsp__content-title" style={{ fontSize: '1.1rem', marginBottom: 16 }}>{t('first_steps.au_cities_title')}</h3>
      <div className="fsp__steps" style={{ marginBottom: 24 }}>
        {cities.map((c, i) => (
          <div key={i} className="fsp__step">
            <span className="fsp__step-num" style={{ fontSize: '1rem' }}>📍</span>
            <div><strong>{c.label}</strong><p>{c.body}</p></div>
          </div>
        ))}
      </div>

      {/* Scams / Safe */}
      <div className="fsp__two-col">
        <div className="fsp__box fsp__box--danger">
          <h3>{t('first_steps.au_arriendo_scam_title')}</h3>
          <ul>{scams.map(k => <li key={k}>{t(`first_steps.${k}`)}</li>)}</ul>
        </div>
        <div className="fsp__box fsp__box--safe">
          <h3>{t('first_steps.au_arriendo_safe_title')}</h3>
          <ul>{portals.map(p => (
            <li key={p.label}>
              <a href={p.href} target="_blank" rel="noopener noreferrer"><strong>{p.label}</strong></a>
            </li>
          ))}</ul>
        </div>
      </div>
      <Tip text={t('first_steps.au_arriendo_tip')} />
      <CtaButton href={WA_SUBGROUPS} icon="🤝" label={t('first_steps.cta_groups')} variant="groups" />
    </div>
  )
}

function AUTrabajoContent({ t }) {
  const jobs = [
    { icon: '🌾', title: t('first_steps.au_job_agri_title'),         body: t('first_steps.au_job_agri_body') },
    { icon: '☕', title: t('first_steps.au_job_hospo_title'),        body: t('first_steps.au_job_hospo_body') },
    { icon: '🔨', title: t('first_steps.au_job_construction_title'), body: t('first_steps.au_job_construction_body') },
    { icon: '📦', title: t('first_steps.au_job_warehouse_title'),    body: t('first_steps.au_job_warehouse_body') },
  ]
  const platforms = [
    { label: t('first_steps.au_platform1'), href: t('first_steps.au_platform1_url') },
    { label: t('first_steps.au_platform2'), href: t('first_steps.au_platform2_url') },
    { label: t('first_steps.au_platform3'), href: t('first_steps.au_platform3_url') },
  ]
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">{t('first_steps.au_trabajo_title')}</h2>
      <p className="fsp__content-lead">{t('first_steps.au_trabajo_lead')}</p>

      {/* Job types */}
      <div className="fsp__steps" style={{ marginBottom: 28 }}>
        {jobs.map((j, i) => (
          <div key={i} className="fsp__step">
            <span className="fsp__step-num" style={{ fontSize: '1.1rem' }}>{j.icon}</span>
            <div><strong>{j.title}</strong><p>{j.body}</p></div>
          </div>
        ))}
      </div>

      {/* Farm work link */}
      <div className="fsp__office-finder" style={{ marginBottom: 24 }}>
        <div className="fsp__office-finder__icon">🌾</div>
        <div className="fsp__office-finder__body">
          <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', color: 'var(--iris-900)' }}>
            {t('first_steps.au_farm_title')}
          </h4>
          <p className="fsp__office-finder__desc">{t('first_steps.au_farm_body')}</p>
          <a href={t('first_steps.au_farm_url')} target="_blank" rel="noopener noreferrer" className="fsp__office-finder__btn">
            Harvest Trail →
          </a>
        </div>
      </div>

      {/* English */}
      <div className="fsp__box fsp__box--safe" style={{ marginBottom: 24 }}>
        <h3>{t('first_steps.au_english_title')}</h3>
        <ul>
          <li>🟢 {t('first_steps.au_english_basic')}</li>
          <li>🟡 {t('first_steps.au_english_mid')}</li>
          <li>🔴 {t('first_steps.au_english_high')}</li>
        </ul>
      </div>

      {/* Platforms */}
      <h3 className="fsp__content-title" style={{ fontSize: '1.1rem', marginBottom: 12 }}>{t('first_steps.au_platforms_title')}</h3>
      <div className="fsp__steps" style={{ marginBottom: 24 }}>
        {platforms.map(p => (
          <div key={p.label} className="fsp__step">
            <span className="fsp__step-num">🔍</span>
            <div><a href={p.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--iris-600)', fontWeight: 600 }}>{p.label}</a></div>
          </div>
        ))}
      </div>

      {/* Taxes */}
      <div className="fsp__box fsp__box--danger" style={{ marginBottom: 24 }}>
        <h3>{t('first_steps.au_taxes_title')}</h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-500)', lineHeight: 1.6, margin: 0 }}>{t('first_steps.au_taxes_body')}</p>
      </div>

      <Tip text={t('first_steps.au_super_tip')} />
      <Tip text={t('first_steps.au_trabajo_tip')} />
      <CtaButton to="/categoria/trabajo" icon="💼" label={t('first_steps.cta_trabajo')} variant="advisor" />
    </div>
  )
}

function AUVisasContent({ t, origin }) {
  const reqs = ['au_whv_req1','au_whv_req2','au_whv_req3','au_whv_req4','au_whv_req5','au_whv_req6']
  const residencyPaths = t('first_steps.au_residence_body').split(' · ')
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">{t('first_steps.au_visas_title')}</h2>
      <p className="fsp__content-lead">{t('first_steps.au_visas_lead')}</p>

      {/* WHV per origin */}
      <WhvCard t={t} dest="australia" origin={origin} />

      {/* WHV main info */}
      <div className="fsp__box fsp__box--safe" style={{ marginBottom: 20 }}>
        <h3>🦘 {t('first_steps.au_whv_title')}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-500)', lineHeight: 1.7, marginBottom: 12 }}>{t('first_steps.au_whv_body')}</p>
        <ul>{reqs.map(k => <li key={k} style={{ fontSize: '0.88rem', color: 'var(--text-500)', lineHeight: 1.7 }}>{t(`first_steps.${k}`)}</li>)}</ul>
        <a href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--iris-600)', fontWeight: 600, display: 'inline-block', marginTop: 10 }}>
          {t('first_steps.whv_official_cta')} →
        </a>
      </div>

      {/* Extension */}
      <div className="fsp__box" style={{ border: '1.5px solid var(--iris-200)', borderRadius: 'var(--r-xl)', padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8, color: 'var(--iris-900)' }}>{t('first_steps.au_whv_extension_title')}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-500)', lineHeight: 1.7, margin: 0 }}>{t('first_steps.au_whv_extension_body')}</p>
      </div>

      {/* Student */}
      <div className="fsp__box" style={{ border: '1.5px solid var(--iris-200)', borderRadius: 'var(--r-xl)', padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8, color: 'var(--iris-900)' }}>🎓 {t('first_steps.au_student_title')}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-500)', lineHeight: 1.7, margin: 0 }}>{t('first_steps.au_student_body')}</p>
      </div>

      {/* Skilled */}
      <div className="fsp__box" style={{ border: '1.5px solid var(--iris-200)', borderRadius: 'var(--r-xl)', padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8, color: 'var(--iris-900)' }}>💼 {t('first_steps.au_skilled_title')}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-500)', lineHeight: 1.7, margin: 0 }}>{t('first_steps.au_skilled_body')}</p>
      </div>

      {/* Residency */}
      <div className="fsp__box fsp__box--safe" style={{ marginBottom: 20 }}>
        <h3>🏡 {t('first_steps.au_residence_title')}</h3>
        <ul>{residencyPaths.map(p => <li key={p} style={{ fontSize: '0.88rem', color: 'var(--text-500)', lineHeight: 1.7 }}>{p.trim()}</li>)}</ul>
      </div>

      {/* Strategy */}
      <div className="fsp__office-finder">
        <div className="fsp__office-finder__icon">🗺️</div>
        <div className="fsp__office-finder__body">
          <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', color: 'var(--iris-900)' }}>{t('first_steps.au_strategy_title')}</h4>
          <p className="fsp__office-finder__desc">{t('first_steps.au_strategy_body')}</p>
        </div>
      </div>

      <Tip text={`${t('first_steps.au_health_title')}: ${t('first_steps.au_health_body')}`} />
      <Tip text={t('first_steps.au_visas_tip')} />
      <CtaButton to="/categoria/migracion" icon="🛂" label={t('first_steps.cta_advisor')} variant="advisor" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW ZEALAND CONTENT COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function NZSinContent({ t }) {
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">{t('first_steps.nz_sin_title')}</h2>
      <p className="fsp__content-lead">{t('first_steps.nz_sin_lead')}</p>
      <div className="fsp__steps">
        <Step n="01" title={t('first_steps.nz_sin_step1_title')} body={t('first_steps.nz_sin_step1')} />
        <Step n="02" title={t('first_steps.nz_sin_step2_title')} body={t('first_steps.nz_sin_step2')} />
        <Step n="03" title={t('first_steps.nz_sin_step3_title')} body={t('first_steps.nz_sin_step3')} />
        <Step n="04" title={t('first_steps.nz_sin_step4_title')} body={t('first_steps.nz_sin_step4')} />
      </div>
      <Tip text={t('first_steps.nz_sin_tip')} />
      <div className="fsp__office-finder" style={{ marginTop: 24 }}>
        <div className="fsp__office-finder__icon">📄</div>
        <div className="fsp__office-finder__body">
          <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', color: 'var(--iris-900)' }}>
            {t('first_steps.nz_sin_docs_title')}
          </h4>
          <p className="fsp__office-finder__desc">{t('first_steps.nz_sin_docs_body')}</p>
        </div>
      </div>
      <div className="fsp__office-finder">
        <div className="fsp__office-finder__icon">📍</div>
        <div className="fsp__office-finder__body">
          <p className="fsp__office-finder__desc">{t('first_steps.nz_sin_ird_desc')}</p>
          <a href="https://www.ird.govt.nz/tasks/apply-for-an-ird-number" target="_blank" rel="noopener noreferrer" className="fsp__office-finder__btn">
            {t('first_steps.nz_sin_ird_cta')}
          </a>
        </div>
      </div>
      <CtaButton href={WA_GROUP} icon="💬" label={t('first_steps.cta_community')} variant="community" />
    </div>
  )
}

function NZBancaContent({ t }) {
  const banks = [
    { name: 'ANZ',      full: 'ANZ Bank New Zealand',  pros: t('first_steps.nz_banca_anz_pros'),     cons: t('first_steps.nz_banca_anz_cons'),     url: 'https://www.anz.co.nz/personal/bank-accounts/new-to-nz/' },
    { name: 'ASB',      full: 'ASB Bank',               pros: t('first_steps.nz_banca_asb_pros'),     cons: t('first_steps.nz_banca_asb_cons'),     url: 'https://www.asb.co.nz/bank-accounts' },
    { name: 'BNZ',      full: 'Bank of New Zealand',    pros: t('first_steps.nz_banca_bnz_pros'),     cons: t('first_steps.nz_banca_bnz_cons'),     url: 'https://www.bnz.co.nz/personal-banking/accounts' },
    { name: 'Westpac',  full: 'Westpac New Zealand',    pros: t('first_steps.nz_banca_westpac_pros'), cons: t('first_steps.nz_banca_westpac_cons'), url: 'https://www.westpac.co.nz/bank-accounts/' },
  ]
  const sims = [
    { name: 'One NZ',    pros: t('first_steps.nz_sim_one_pros'),      cons: t('first_steps.nz_sim_one_cons'),      url: 'https://www.one.nz' },
    { name: 'Spark',     pros: t('first_steps.nz_sim_spark_pros'),    cons: t('first_steps.nz_sim_spark_cons'),    url: 'https://www.spark.co.nz' },
    { name: '2degrees',  pros: t('first_steps.nz_sim_2degrees_pros'), cons: t('first_steps.nz_sim_2degrees_cons'), url: 'https://www.2degrees.nz' },
  ]
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">{t('first_steps.nz_banca_title')}</h2>
      <p className="fsp__content-lead">{t('first_steps.nz_banca_lead')}</p>
      <div className="fsp__bank-grid">
        {banks.map(b => (
          <div key={b.name} className="fsp__bank-card">
            <div className="fsp__bank-header">
              <span className="fsp__bank-name">{b.name}</span>
              <span className="fsp__bank-full">{b.full}</span>
            </div>
            <div className="fsp__bank-body">
              <p><strong>✅ {t('first_steps.banca_pros_label')}:</strong> {b.pros}</p>
              <p><strong>⚠️ {t('first_steps.banca_cons_label')}:</strong> {b.cons}</p>
            </div>
            <a href={b.url} target="_blank" rel="noopener noreferrer" className="fsp__bank-link">{t('first_steps.banca_link')}</a>
          </div>
        ))}
      </div>
      <Tip text={t('first_steps.nz_banca_tip')} />

      <h3 className="fsp__content-title" style={{ marginTop: 32, fontSize: '1.1rem' }}>{t('first_steps.nz_sim_title')}</h3>
      <p className="fsp__content-lead" style={{ marginBottom: 16 }}>{t('first_steps.nz_sim_lead')}</p>
      <div className="fsp__bank-grid">
        {sims.map(s => (
          <div key={s.name} className="fsp__bank-card">
            <div className="fsp__bank-header">
              <span className="fsp__bank-name">{s.name}</span>
            </div>
            <div className="fsp__bank-body">
              <p><strong>✅ {t('first_steps.banca_pros_label')}:</strong> {s.pros}</p>
              <p><strong>⚠️ {t('first_steps.banca_cons_label')}:</strong> {s.cons}</p>
            </div>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="fsp__bank-link">{t('first_steps.banca_link')}</a>
          </div>
        ))}
      </div>
      <CtaButton href={WA_GROUP} icon="💬" label={t('first_steps.cta_community')} variant="community" />
    </div>
  )
}

function NZArriendoContent({ t }) {
  const scams = ['nz_arriendo_scam1','nz_arriendo_scam2','nz_arriendo_scam3','nz_arriendo_scam4']
  const portals = [
    { label: t('first_steps.nz_arriendo_safe1'), href: t('first_steps.nz_arriendo_safe1_url') },
    { label: t('first_steps.nz_arriendo_safe2'), href: t('first_steps.nz_arriendo_safe2_url') },
    { label: t('first_steps.nz_arriendo_safe3'), href: t('first_steps.nz_arriendo_safe3_url') },
  ]
  const cities = [
    { label: t('first_steps.nz_city_work_label'),   body: t('first_steps.nz_city_work_body') },
    { label: t('first_steps.nz_city_social_label'), body: t('first_steps.nz_city_social_body') },
    { label: t('first_steps.nz_city_nature_label'), body: t('first_steps.nz_city_nature_body') },
    { label: t('first_steps.nz_city_agri_label'),   body: t('first_steps.nz_city_agri_body') },
  ]
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">{t('first_steps.nz_arriendo_title')}</h2>
      <p className="fsp__content-lead">{t('first_steps.nz_arriendo_lead')}</p>

      {/* Cost of living */}
      <div className="fsp__box fsp__box--safe" style={{ marginBottom: 24 }}>
        <h3>{t('first_steps.nz_costs_title')}</h3>
        <ul>
          <li><strong>🏠 {t('first_steps.arriendo_title') || 'Habitación'}:</strong> {t('first_steps.nz_cost_room')}</li>
          <li><strong>🛒 {t('first_steps.nz_cost_food')}</strong></li>
          <li><strong>🚌 {t('first_steps.nz_cost_transport')}</strong></li>
        </ul>
        <p style={{ marginTop: 10, fontSize: '0.88rem', color: 'var(--text-600)', fontStyle: 'italic' }}>
          {t('first_steps.nz_cost_total')}
        </p>
      </div>

      {/* Cities */}
      <h3 className="fsp__content-title" style={{ fontSize: '1.1rem', marginBottom: 16 }}>{t('first_steps.nz_cities_title')}</h3>
      <div className="fsp__steps" style={{ marginBottom: 24 }}>
        {cities.map((c, i) => (
          <div key={i} className="fsp__step">
            <span className="fsp__step-num" style={{ fontSize: '1rem' }}>📍</span>
            <div><strong>{c.label}</strong><p>{c.body}</p></div>
          </div>
        ))}
      </div>

      {/* Scams / safe */}
      <div className="fsp__two-col">
        <div className="fsp__box fsp__box--danger">
          <h3>{t('first_steps.nz_arriendo_scam_title')}</h3>
          <ul>{scams.map(k => <li key={k}>{t(`first_steps.${k}`)}</li>)}</ul>
        </div>
        <div className="fsp__box fsp__box--safe">
          <h3>{t('first_steps.nz_arriendo_safe_title')}</h3>
          <ul>{portals.map(p => (
            <li key={p.label}>
              <a href={p.href} target="_blank" rel="noopener noreferrer"><strong>{p.label}</strong></a>
            </li>
          ))}</ul>
        </div>
      </div>
      <Tip text={t('first_steps.nz_arriendo_tip')} />
      <CtaButton href={WA_SUBGROUPS} icon="🤝" label={t('first_steps.cta_groups')} variant="groups" />
    </div>
  )
}

function NZTrabajoContent({ t }) {
  const jobs = [
    { icon: '🌾', title: t('first_steps.nz_job_agri_title'),         body: t('first_steps.nz_job_agri_body') },
    { icon: '☕', title: t('first_steps.nz_job_hospo_title'),        body: t('first_steps.nz_job_hospo_body') },
    { icon: '🔨', title: t('first_steps.nz_job_construction_title'), body: t('first_steps.nz_job_construction_body') },
    { icon: '📦', title: t('first_steps.nz_job_warehouse_title'),    body: t('first_steps.nz_job_warehouse_body') },
  ]
  const platforms = [
    { label: t('first_steps.nz_platform1'), href: t('first_steps.nz_platform1_url') },
    { label: t('first_steps.nz_platform2'), href: t('first_steps.nz_platform2_url') },
    { label: t('first_steps.nz_platform3'), href: t('first_steps.nz_platform3_url') },
  ]
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">{t('first_steps.nz_trabajo_title')}</h2>
      <p className="fsp__content-lead">{t('first_steps.nz_trabajo_lead')}</p>

      {/* Job types */}
      <div className="fsp__steps" style={{ marginBottom: 28 }}>
        {jobs.map((j, i) => (
          <div key={i} className="fsp__step">
            <span className="fsp__step-num" style={{ fontSize: '1.1rem' }}>{j.icon}</span>
            <div><strong>{j.title}</strong><p>{j.body}</p></div>
          </div>
        ))}
      </div>

      {/* English */}
      <div className="fsp__box fsp__box--safe" style={{ marginBottom: 24 }}>
        <h3>{t('first_steps.nz_english_title')}</h3>
        <ul>
          <li>🟢 {t('first_steps.nz_english_basic')}</li>
          <li>🟡 {t('first_steps.nz_english_mid')}</li>
          <li>🔴 {t('first_steps.nz_english_high')}</li>
        </ul>
      </div>

      {/* Platforms */}
      <h3 className="fsp__content-title" style={{ fontSize: '1.1rem', marginBottom: 12 }}>{t('first_steps.nz_platforms_title')}</h3>
      <div className="fsp__steps" style={{ marginBottom: 24 }}>
        {platforms.map(p => (
          <div key={p.label} className="fsp__step">
            <span className="fsp__step-num">🔍</span>
            <div><a href={p.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--iris-600)', fontWeight: 600 }}>{p.label}</a></div>
          </div>
        ))}
      </div>

      {/* Seasons */}
      <div className="fsp__box fsp__box--safe" style={{ marginBottom: 24 }}>
        <h3>{t('first_steps.nz_seasons_title')}</h3>
        <ul>
          <li>🍎 {t('first_steps.nz_season_fruit')}</li>
          <li>⛷️ {t('first_steps.nz_season_ski')}</li>
          <li>🏨 {t('first_steps.nz_season_hospo')}</li>
        </ul>
      </div>

      {/* Culture + taxes */}
      <div className="fsp__two-col" style={{ marginBottom: 24 }}>
        <div className="fsp__box fsp__box--safe">
          <h3>{t('first_steps.nz_culture_title')}</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-500)', lineHeight: 1.6, margin: 0 }}>✅ {t('first_steps.nz_culture_good')}</p>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-500)', lineHeight: 1.6, margin: '8px 0 0' }}>❌ {t('first_steps.nz_culture_bad')}</p>
        </div>
        <div className="fsp__box fsp__box--danger">
          <h3>{t('first_steps.nz_taxes_title')}</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-500)', lineHeight: 1.6, margin: 0 }}>{t('first_steps.nz_taxes_body')}</p>
        </div>
      </div>

      {/* Wage link */}
      <div className="fsp__office-finder">
        <div className="fsp__office-finder__icon">💰</div>
        <div className="fsp__office-finder__body">
          <p className="fsp__office-finder__desc">{t('first_steps.nz_wage_body')}</p>
          <a href={t('first_steps.nz_wage_url')} target="_blank" rel="noopener noreferrer" className="fsp__office-finder__btn">
            {t('first_steps.nz_wage_title')}
          </a>
        </div>
      </div>

      <Tip text={t('first_steps.nz_driving_tip')} />
      <Tip text={t('first_steps.nz_trabajo_tip')} />
      <CtaButton to="/categoria/trabajo" icon="💼" label={t('first_steps.cta_trabajo')} variant="advisor" />
    </div>
  )
}

function NZVisasContent({ t, origin }) {
  const reqs = ['nz_whv_req1','nz_whv_req2','nz_whv_req3','nz_whv_req4','nz_whv_req5','nz_whv_req6']
  const residencyPaths = t('first_steps.nz_residence_body').split(' · ')
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">{t('first_steps.nz_visas_title')}</h2>
      <p className="fsp__content-lead">{t('first_steps.nz_visas_lead')}</p>

      {/* WHV per origin */}
      <WhvCard t={t} dest="new-zealand" origin={origin} />

      {/* WHV */}
      <div className="fsp__box fsp__box--safe" style={{ marginBottom: 20 }}>
        <h3>🌴 {t('first_steps.nz_whv_title')}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-500)', lineHeight: 1.7, marginBottom: 12 }}>{t('first_steps.nz_whv_body')}</p>
        <ul>{reqs.map(k => <li key={k} style={{ fontSize: '0.88rem', color: 'var(--text-500)', lineHeight: 1.7 }}>{t(`first_steps.${k}`)}</li>)}</ul>
        <a href={t('first_steps.nz_whv_url')} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--iris-600)', fontWeight: 600, display: 'inline-block', marginTop: 10 }}>
          {t('first_steps.sin_office_cta') || 'Sitio oficial'} →
        </a>
      </div>

      {/* Student */}
      <div className="fsp__box" style={{ border: '1.5px solid var(--iris-200)', borderRadius: 'var(--r-xl)', padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8, color: 'var(--iris-900)' }}>🎓 {t('first_steps.nz_student_title')}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-500)', lineHeight: 1.7, margin: 0 }}>{t('first_steps.nz_student_body')}</p>
      </div>

      {/* AEWV */}
      <div className="fsp__box" style={{ border: '1.5px solid var(--iris-200)', borderRadius: 'var(--r-xl)', padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8, color: 'var(--iris-900)' }}>💼 {t('first_steps.nz_aewv_title')}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-500)', lineHeight: 1.7, marginBottom: 10 }}>{t('first_steps.nz_aewv_body')}</p>
        <a href={t('first_steps.nz_aewv_url')} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--iris-600)', fontWeight: 600 }}>
          {t('first_steps.sin_office_cta') || 'Sitio oficial'} →
        </a>
      </div>

      {/* Residency */}
      <div className="fsp__box fsp__box--safe" style={{ marginBottom: 20 }}>
        <h3>🏡 {t('first_steps.nz_residence_title')}</h3>
        <ul>{residencyPaths.map(p => <li key={p} style={{ fontSize: '0.88rem', color: 'var(--text-500)', lineHeight: 1.7 }}>{p.trim()}</li>)}</ul>
      </div>

      {/* Strategy */}
      <div className="fsp__office-finder">
        <div className="fsp__office-finder__icon">🗺️</div>
        <div className="fsp__office-finder__body">
          <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', color: 'var(--iris-900)' }}>{t('first_steps.nz_strategy_title')}</h4>
          <p className="fsp__office-finder__desc">{t('first_steps.nz_strategy_body')}</p>
        </div>
      </div>

      <Tip text={`${t('first_steps.nz_health_title')}: ${t('first_steps.nz_health_body')}`} />
      <Tip text={t('first_steps.nz_reality_body')} />
      <Tip text={t('first_steps.nz_visas_tip')} />
      <CtaButton to="/categoria/migracion" icon="🛂" label={t('first_steps.cta_advisor')} variant="advisor" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CANADA CONTENT COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function ComingSoonPanel({ t, dest }) {
  const countryName = t(`first_steps.dest_${dest.id.replace('-', '_')}`)
  return (
    <div className="fsp__coming-soon">
      <img
        src={`https://flagcdn.com/80x60/${dest.code}.png`}
        srcSet={`https://flagcdn.com/160x120/${dest.code}.png 2x`}
        width="80" height="60"
        alt={countryName}
        className="fsp__coming-soon__flag"
      />
      <h2 className="fsp__coming-soon__title">
        {t('first_steps.coming_soon_title', { country: countryName })}
      </h2>
      <p className="fsp__coming-soon__body">
        {t('first_steps.coming_soon_body', { country: countryName })}
      </p>
      <a
        href={WA_GROUP}
        target="_blank"
        rel="noopener noreferrer"
        className="fsp__cta-btn fsp__cta-btn--community fsp__coming-soon__cta"
      >
        <span className="fsp__cta-btn-icon">💬</span>
        {t('first_steps.coming_soon_cta')}
      </a>
    </div>
  )
}

function SinContent({ t }) {
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">{t('first_steps.sin_title')}</h2>
      <p className="fsp__content-lead">{t('first_steps.sin_lead')}</p>
      <div className="fsp__steps">
        <Step n="01" title={t('first_steps.sin_step1_title')} body={t('first_steps.sin_step1')} />
        <Step n="02" title={t('first_steps.sin_step2_title')} body={t('first_steps.sin_step2')} />
        <Step n="03" title={t('first_steps.sin_step3_title')} body={t('first_steps.sin_step3')} />
        <Step n="04" title={t('first_steps.sin_step4_title')} body={t('first_steps.sin_step4')} />
      </div>
      <Tip text={t('first_steps.sin_tip')} />
      <div className="fsp__office-finder">
        <div className="fsp__office-finder__icon">📍</div>
        <div className="fsp__office-finder__body">
          <p className="fsp__office-finder__desc">{t('first_steps.sin_office_desc')}</p>
          <a
            href="https://offices.service.canada.ca/en"
            target="_blank"
            rel="noopener noreferrer"
            className="fsp__office-finder__btn"
          >
            {t('first_steps.sin_office_cta')}
          </a>
        </div>
      </div>
      <CtaButton href={WA_GROUP} icon="💬" label={t('first_steps.cta_community')} variant="community" />
    </div>
  )
}

function BancaContent({ t }) {
  const banks = [
    { name: 'RBC',        full: 'Royal Bank of Canada', pros: t('first_steps.banca_rbc_pros'),        cons: t('first_steps.banca_rbc_cons'),        url: 'https://www.rbc.com/newcomers' },
    { name: 'TD',         full: 'TD Bank',              pros: t('first_steps.banca_td_pros'),         cons: t('first_steps.banca_td_cons'),         url: 'https://www.td.com/ca/en/personal-banking/solutions/new-to-canada' },
    { name: 'Scotiabank', full: 'Scotiabank',            pros: t('first_steps.banca_scotiabank_pros'), cons: t('first_steps.banca_scotiabank_cons'), url: 'https://www.scotiabank.com/ca/en/personal/bank-accounts/newcomers.html' },
  ]
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">{t('first_steps.banca_title')}</h2>
      <p className="fsp__content-lead">{t('first_steps.banca_lead')}</p>
      <div className="fsp__bank-grid">
        {banks.map(b => (
          <div key={b.name} className="fsp__bank-card">
            <div className="fsp__bank-header">
              <span className="fsp__bank-name">{b.name}</span>
              <span className="fsp__bank-full">{b.full}</span>
            </div>
            <div className="fsp__bank-body">
              <p><strong>✅ {t('first_steps.banca_pros_label')}:</strong> {b.pros}</p>
              <p><strong>⚠️ {t('first_steps.banca_cons_label')}:</strong> {b.cons}</p>
            </div>
            <a href={b.url} target="_blank" rel="noopener noreferrer" className="fsp__bank-link">{t('first_steps.banca_link')}</a>
          </div>
        ))}
      </div>
      <Tip text={t('first_steps.banca_tip')} />
      <div className="fsp__cta-row">
        <CtaButton to="/categoria/banca" icon="🏦" label={t('first_steps.cta_banca')} variant="advisor" />
        <CtaButton href={WA_GROUP} icon="💬" label={t('first_steps.cta_community')} variant="community" />
      </div>
    </div>
  )
}

function ArriendoContent({ t, country }) {
  const scams = ['arriendo_scam1','arriendo_scam2','arriendo_scam3','arriendo_scam4','arriendo_scam5']
  const portals = [
    { label: 'Kijiji.ca',            href: 'https://www.kijiji.ca' },
    { label: 'Rentals.ca',           href: 'https://www.rentals.ca' },
    { label: 'PadMapper',            href: 'https://www.padmapper.com' },
    { label: 'Facebook Marketplace', href: 'https://www.facebook.com/marketplace' },
    { label: 'Grupos Manada',        href: WA_GROUP },
  ]
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">{t('first_steps.arriendo_title')}</h2>
      <p className="fsp__content-lead">{t('first_steps.arriendo_lead', { country })}</p>
      <div className="fsp__two-col">
        <div className="fsp__box fsp__box--danger">
          <h3>{t('first_steps.arriendo_scam_title')}</h3>
          <ul>{scams.map(k => <li key={k}>{t(`first_steps.${k}`)}</li>)}</ul>
        </div>
        <div className="fsp__box fsp__box--safe">
          <h3>{t('first_steps.arriendo_safe_title')}</h3>
          <ul>{portals.map(p => (
            <li key={p.label}>
              <a href={p.href} target="_blank" rel="noopener noreferrer"><strong>{p.label}</strong></a>
            </li>
          ))}</ul>
        </div>
      </div>
      <Tip text={t('first_steps.arriendo_tip')} />
      <div className="fsp__cta-row">
        <CtaButton to="/categoria/alojamiento" icon="🏠" label={t('first_steps.cta_alojamiento')} variant="advisor" />
        <CtaButton href={WA_SUBGROUPS} icon="🤝" label={t('first_steps.cta_groups')} variant="groups" />
      </div>
    </div>
  )
}

function TrabajoContent({ t, country }) {
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">{t('first_steps.trabajo_title', { country })}</h2>
      <p className="fsp__content-lead">{t('first_steps.trabajo_lead')}</p>
      <div className="fsp__steps">
        <Step n="01" title={t('first_steps.trabajo_step1_title')} body={t('first_steps.trabajo_step1')} />
        <Step n="02" title={t('first_steps.trabajo_step2_title')} body={t('first_steps.trabajo_step2')} />
        <Step n="03" title={t('first_steps.trabajo_step3_title')} body={t('first_steps.trabajo_step3')} />
        <Step n="04" title={t('first_steps.trabajo_step4_title')} body={t('first_steps.trabajo_step4', { country })} />
      </div>
      <Tip text={t('first_steps.trabajo_tip')} />
      <div className="fsp__cta-row">
        <CtaButton to="/categoria/trabajo" icon="💼" label={t('first_steps.cta_trabajo')} variant="advisor" />
        <CtaButton href={WA_SUBGROUPS} icon="🤝" label={t('first_steps.cta_groups')} variant="groups" />
      </div>
    </div>
  )
}

function VisasContent({ t, country, origin }) {
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">{t('first_steps.visas_title')}</h2>
      <p className="fsp__content-lead">{t('first_steps.visas_lead', { country })}</p>

      {/* WHV per origin */}
      <WhvCard t={t} dest="canada" origin={origin} />

      <div className="fsp__steps">
        <Step n="01" title={t('first_steps.visas_step1_title')} body={t('first_steps.visas_step1')} />
        <Step n="02" title={t('first_steps.visas_step2_title')} body={t('first_steps.visas_step2')} />
        <Step n="03" title={t('first_steps.visas_step3_title')} body={t('first_steps.visas_step3')} />
        <Step n="04" title={t('first_steps.visas_step4_title')} body={t('first_steps.visas_step4')} />
      </div>
      <Tip text={t('first_steps.visas_tip')} />
      <CtaButton to="/categoria/migracion" icon="🛂" label={t('first_steps.cta_advisor')} variant="advisor" />
    </div>
  )
}
