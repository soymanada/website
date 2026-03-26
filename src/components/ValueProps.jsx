import { Users, MessageCircle, LayoutGrid } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './ValueProps.css'

export default function ValueProps() {
  const { t } = useTranslation()
  const items = [
    { Icon: Users,         titleKey: 'value_props.item1_title', bodyKey: 'value_props.item1_body' },
    { Icon: MessageCircle, titleKey: 'value_props.item2_title', bodyKey: 'value_props.item2_body' },
    { Icon: LayoutGrid,    titleKey: 'value_props.item3_title', bodyKey: 'value_props.item3_body' },
  ]
  return (
    <section className="vp section">
      <div className="container">
        <div className="vp__header">
          <p className="eyebrow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" width="13" height="13" aria-hidden="true">
              <polygon points="2,13 30,16 2,2"/>
              <polygon points="2,19 30,16 2,30"/>
            </svg>
            {t('value_props.eyebrow')}
          </p>
          <h2 className="d-xl vp__title">
            {t('value_props.title')}<br />
            <em>{t('value_props.title_em')}</em>
          </h2>
          <p className="t-lg vp__lead">{t('value_props.lead')}</p>
        </div>
        <div className="vp__grid">
          {items.map((item, i) => (
            <div key={i} className="vp-card">
              <div className="vp-card__icon" aria-hidden="true">
                <item.Icon size={28} strokeWidth={1.5} />
              </div>
              <h3 className="d-md vp-card__title">{t(item.titleKey)}</h3>
              <p className="t-md vp-card__body">{t(item.bodyKey)}</p>
              <div className="vp-card__line" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
