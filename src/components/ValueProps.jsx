import { Users, MessageCircle, LayoutGrid } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './ValueProps.css'

const WA_GROUP = 'https://chat.whatsapp.com/CMIWk9cQkEIDso4Ll6JG8j'

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
          <a
            href={WA_GROUP}
            target="_blank"
            rel="noopener noreferrer"
            className="vp__wa-btn"
            aria-label={t('value_props.wa_cta')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.406A9.944 9.944 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm4.93 13.41c-.207.583-1.215 1.114-1.664 1.15-.45.038-.872.208-2.937-.612-2.493-.993-4.096-3.545-4.22-3.709-.124-.164-1.01-1.344-1.01-2.564s.637-1.82.864-2.07c.226-.25.49-.312.653-.312.163 0 .327.002.47.008.15.007.354-.057.554.423.207.5.703 1.72.764 1.845.061.123.102.267.02.43-.082.163-.123.267-.245.41l-.368.43c-.123.123-.25.256-.108.502.143.245.633 1.043 1.36 1.688.933.83 1.72 1.085 1.965 1.208.245.123.388.102.53-.061.144-.164.614-.716.777-.962.164-.245.328-.204.552-.122.225.082 1.428.674 1.673.797.245.122.408.184.47.286.06.103.06.593-.146 1.175z"/>
            </svg>
            {t('value_props.wa_cta')}
          </a>
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
