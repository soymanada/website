import { useTranslation } from 'react-i18next'
import './HowItWorks.css'

const STEP_ICONS = [
  // Explorar categorías — grid de búsqueda
  <svg key="1" width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <rect x="4" y="4" width="13" height="13" rx="3" fill="currentColor" opacity="0.9"/>
    <rect x="23" y="4" width="13" height="13" rx="3" fill="currentColor" opacity="0.6"/>
    <rect x="4" y="23" width="13" height="13" rx="3" fill="currentColor" opacity="0.6"/>
    <rect x="23" y="23" width="13" height="13" rx="3" fill="currentColor" opacity="0.35"/>
    <circle cx="30" cy="30" r="8" fill="#1A113C"/>
    <circle cx="30" cy="30" r="6.5" stroke="currentColor" strokeWidth="2" fill="none"/>
    <line x1="34.5" y1="34.5" x2="38" y2="38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>,
  // Revisar proveedor — perfil con verificado
  <svg key="2" width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <circle cx="20" cy="13" r="7" fill="currentColor" opacity="0.9"/>
    <path d="M6 34c0-7.732 6.268-12 14-12s14 4.268 14 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6"/>
    <circle cx="30" cy="12" r="7" fill="#1A113C"/>
    <circle cx="30" cy="12" r="5.5" fill="currentColor" opacity="0.95"/>
    <path d="M27 12l2 2 4-4" stroke="#1A113C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,
  // Contacto directo — mensaje directo
  <svg key="3" width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <rect x="3" y="7" width="34" height="22" rx="5" fill="currentColor" opacity="0.9"/>
    <path d="M3 29l6-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
    <line x1="11" y1="16" x2="29" y2="16" stroke="#1A113C" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
    <line x1="11" y1="22" x2="23" y2="22" stroke="#1A113C" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
  </svg>,
]

export default function HowItWorks() {
  const { t } = useTranslation()
  const steps = [
    { n: '01', icon: STEP_ICONS[0], titleKey: 'how_it_works.step1_title', bodyKey: 'how_it_works.step1_body' },
    { n: '02', icon: STEP_ICONS[1], titleKey: 'how_it_works.step2_title', bodyKey: 'how_it_works.step2_body' },
    { n: '03', icon: STEP_ICONS[2], titleKey: 'how_it_works.step3_title', bodyKey: 'how_it_works.step3_body' },
  ]
  return (
    <section className="how section" style={{ backgroundColor: '#1A113C', position: 'relative', overflow: 'hidden', padding: '100px 0' }}>
      <div className="how__bg-orb how__bg-orb--1" aria-hidden="true" />
      <div className="how__bg-orb how__bg-orb--2" aria-hidden="true" />
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="how__header" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p className="eyebrow how__eyebrow" style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.20)', color: '#EBE5FF' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" width="13" height="13" aria-hidden="true">
              <polygon points="2,13 30,16 2,2"/>
              <polygon points="2,19 30,16 2,30"/>
            </svg>
            {t('how_it_works.eyebrow')}
          </p>
          <h2 className="d-xl how__title" style={{ color: '#FFFFFF', marginTop: '16px', fontSize: 'clamp(32px, 5vw, 64px)' }}>
            {t('how_it_works.title')}
          </h2>
          <p className="t-lg how__lead" style={{ color: '#EBE5FF', maxWidth: '600px', margin: '16px auto 0', opacity: 0.9 }}>
            {t('how_it_works.lead')}
          </p>
        </div>
        <div className="how__steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {steps.map(s => (
            <div key={s.n} className="how-step" style={{ position: 'relative', padding: '40px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <div className="how-step__num" style={{ color: 'rgba(255,255,255,0.1)', fontSize: '64px', fontWeight: '900', position: 'absolute', top: '20px', right: '32px' }}>{s.n}</div>
              <div className="how-step__icon" aria-hidden="true" style={{ fontSize: '40px', marginBottom: '24px' }}>{s.icon}</div>
              <h3 className="how-step__title" style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>{t(s.titleKey)}</h3>
              <p className="how-step__body t-md" style={{ color: '#EBE5FF', lineHeight: '1.6', opacity: 0.8 }}>{t(s.bodyKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
