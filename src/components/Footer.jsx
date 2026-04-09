import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import categories from '../data/categories.json'
import CategoryIcon from './CategoryIcon'
import PawIcon from './PawIcon'
import FeedbackModal from './FeedbackModal'
import './Footer.css'

export default function Footer() {
  const { t } = useTranslation()
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__trust-section">
          <h4 className="footer__trust-title d-md">{t('footer.trust_title')}</h4>
          <div className="footer__trust-grid">
            <div className="trust-item">
              <span className="trust-item__icon"><CategoryIcon name="shield" size={24} /></span>
              <div>
                <strong>{t('footer.trust_filtro_title')}</strong>
                <p className="t-xs">{t('footer.trust_filtro_body')}</p>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-item__icon"><CategoryIcon name="message-circle" size={24} /></span>
              <div>
                <strong>{t('footer.trust_feedback_title')}</strong>
                <p className="t-xs">{t('footer.trust_feedback_body')}</p>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-item__icon"><CategoryIcon name="gift" size={24} /></span>
              <div>
                <strong>{t('footer.trust_beneficios_title')}</strong>
                <p className="t-xs">{t('footer.trust_beneficios_body')}</p>
              </div>
            </div>
          </div>
        </div>

        <hr className="footer__divider" />

        <div className="footer__inner">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <PawIcon size={16} className="footer__logo-glyph" />
              <span>SoyManada</span>
            </Link>
            <p className="footer__tagline t-sm">{t('footer.tagline')}</p>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title label">{t('footer.col_categorias')}</h4>
            <nav className="footer__links">
              {[...categories].sort((a, b) => a.order - b.order).map(cat => (
                <Link key={cat.slug} to={`/categoria/${cat.slug}`}>
                  {t(`categories.${cat.slug}`, cat.name)}
                </Link>
              ))}
            </nav>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title label">{t('footer.col_comunidad')}</h4>
            <nav className="footer__links">
              <Link to="/registro-proveedores">{t('footer.link_proveedor')}</Link>
              <Link to="/verificacion">{t('footer.link_verificacion')}</Link>
              <Link to="/planes">{t('pricing_page.link_pricing')}</Link>
              <a href="https://chat.whatsapp.com/CMIWk9cQkEIDso4Ll6JG8j" target="_blank" rel="noopener noreferrer">{t('footer.link_whatsapp')}</a>
              <button className="footer__feedback-btn" onClick={() => setShowFeedback(true)}>
                {t('feedback.footer_cta')}
              </button>
            </nav>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="t-xs">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <p className="t-xs footer__disc">{t('footer.disclaimer')}</p>
        </div>
      </div>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </footer>
  )
}
