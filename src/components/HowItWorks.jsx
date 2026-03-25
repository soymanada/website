import { useTranslation } from 'react-i18next'
import './HowItWorks.css'

export default function HowItWorks() {
  const { t } = useTranslation()
  const steps = [
    { n: '01', icon: '🗂️', titleKey: 'how_it_works.step1_title', bodyKey: 'how_it_works.step1_body' },
    { n: '02', icon: '👤', titleKey: 'how_it_works.step2_title', bodyKey: 'how_it_works.step2_body' },
    { n: '03', icon: '💬', titleKey: 'how_it_works.step3_title', bodyKey: 'how_it_works.step3_body' },
  ]
  return (
    <section className="how section" style={{ backgroundColor: '#1A113C', position: 'relative', overflow: 'hidden', padding: '100px 0' }}>
      <div className="how__bg-orb how__bg-orb--1" aria-hidden="true" />
      <div className="how__bg-orb how__bg-orb--2" aria-hidden="true" />
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="how__header" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p className="eyebrow how__eyebrow" style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.20)', color: '#EBE5FF' }}>
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
