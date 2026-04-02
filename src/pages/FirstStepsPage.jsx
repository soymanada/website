// src/pages/FirstStepsPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './FirstStepsPage.css'

export default function FirstStepsPage() {
  const { t } = useTranslation()
  const country = t('common.currentCountry')

  const TABS = [
    { id: 'sin',      icon: '🪪', label: t('first_steps.tab_sin') },
    { id: 'banca',    icon: '🏦', label: t('first_steps.tab_banca') },
    { id: 'arriendo', icon: '🏠', label: t('first_steps.tab_arriendo') },
    { id: 'trabajo',  icon: '💼', label: t('first_steps.tab_trabajo') },
    { id: 'visas',    icon: '📋', label: t('first_steps.tab_visas') },
  ]

  const [active, setActive] = useState('sin')

  return (
    <main className="fsp">
      <div className="fsp__hero">
        <div className="fsp__hero-orb" aria-hidden="true" />
        <div className="container">
          <p className="fsp__eyebrow">{t('first_steps.eyebrow')}</p>
          <h1 className="fsp__title">
            {t('first_steps.title')}<br />
            <em>{t('first_steps.title_em', { country })}</em>
          </h1>
          <p className="fsp__sub">{t('first_steps.sub')}</p>
        </div>
      </div>

      <div className="fsp__body container">
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
          {active === 'sin'      && <SinContent      t={t} />}
          {active === 'banca'    && <BancaContent    t={t} country={country} />}
          {active === 'arriendo' && <ArriendoContent t={t} country={country} />}
          {active === 'trabajo'  && <TrabajoContent  t={t} country={country} />}
          {active === 'visas'    && <VisasContent    t={t} country={country} />}
        </div>
      </div>
    </main>
  )
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
    </div>
  )
}

function ArriendoContent({ t, country }) {
  const scams = ['arriendo_scam1','arriendo_scam2','arriendo_scam3','arriendo_scam4','arriendo_scam5']
  const portals = ['Kijiji.ca','Rentals.ca','PadMapper','Facebook Marketplace','Grupos Manada']
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
          <ul>{portals.map(p => <li key={p}><strong>{p}</strong></li>)}</ul>
        </div>
      </div>
      <Tip text={t('first_steps.arriendo_tip')} />
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
    </div>
  )
}

function VisasContent({ t, country }) {
  return (
    <div className="fsp__content">
      <h2 className="fsp__content-title">{t('first_steps.visas_title')}</h2>
      <p className="fsp__content-lead">{t('first_steps.visas_lead', { country })}</p>
      <div className="fsp__steps">
        <Step n="01" title={t('first_steps.visas_step1_title')} body={t('first_steps.visas_step1')} />
        <Step n="02" title={t('first_steps.visas_step2_title')} body={t('first_steps.visas_step2')} />
        <Step n="03" title={t('first_steps.visas_step3_title')} body={t('first_steps.visas_step3')} />
        <Step n="04" title={t('first_steps.visas_step4_title')} body={t('first_steps.visas_step4')} />
      </div>
      <Tip text={t('first_steps.visas_tip')} />
      <div className="fsp__cta-block">
        <p>{t('first_steps.visas_cta_text')}</p>
        <Link to="/categoria/migracion" className="btn btn-primary"><span>{t('first_steps.visas_cta_btn')}</span></Link>
      </div>
    </div>
  )
}
