import { useTranslation } from 'react-i18next'
import './TrustBadge.css'
import VerificationBadge from './VerificationBadge'

export default function TrustBadge() {
  const { t } = useTranslation()
  const pillars = [
    { icon: '👥', titleKey: 'trust_badge.pillar1_title', bodyKey: 'trust_badge.pillar1_body' },
    { icon: '✅', titleKey: 'trust_badge.pillar2_title', bodyKey: 'trust_badge.pillar2_body' },
    { icon: '🚫', titleKey: 'trust_badge.pillar3_title', bodyKey: 'trust_badge.pillar3_body' },
  ]
  return (
    <section className="trust section">
      <div className="container">
        <div className="trust__layout">
          <div className="trust__left">
            <div className="trust__title-row">
              <VerificationBadge variant="seal" theme="dark" />
              <h2 className="d-lg trust__title">
                {t('trust_badge.title')}<br />
                <em>{t('trust_badge.title_em')}</em>
              </h2>
            </div>
            <p className="t-lg trust__lead">{t('trust_badge.lead')}</p>
            <p className="t-sm trust__disclaimer">{t('trust_badge.disclaimer')}</p>
          </div>
          <div className="trust__right">
            {pillars.map((p, i) => (
              <div key={i} className="trust-pillar">
                <div className="trust-pillar__icon" aria-hidden="true">{p.icon}</div>
                <div>
                  <h3 className="trust-pillar__title">{t(p.titleKey)}</h3>
                  <p className="t-sm trust-pillar__body">{t(p.bodyKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
