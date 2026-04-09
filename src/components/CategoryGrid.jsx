import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import categories from '../data/categories.json'
import { trackEvent, Events } from '../utils/analytics'
import CategoryIcon from './CategoryIcon'
import CategorySuggestionModal from './CategorySuggestionModal'
import './CategoryGrid.css'

export default function CategoryGrid() {
  const { t } = useTranslation()
  const sorted = [...categories].sort((a, b) => a.order - b.order)
  const [showSuggest, setShowSuggest] = useState(false)

  return (
    <section id="categorias" className="catgrid section">
      <div className="container">
        <div className="catgrid__header">
          <h2 className="d-xl catgrid__title">{t('category_grid.title')}</h2>
          <p className="t-lg catgrid__sub">{t('category_grid.subtitle')}</p>
        </div>
        <div className="catgrid__grid">
          {sorted.map((cat, i) => {
            const name    = t(`categories.${cat.slug}`, cat.name)
            const oneLiner= t(`categories.${cat.slug}_oneliner`, cat.oneLiner)
            const isVIP   = cat.slug === 'seguros' || cat.slug === 'migracion'
            return (
              <Link key={cat.slug} to={`/categoria/${cat.slug}`}
                className={`catcard ${isVIP ? 'catcard--vip' : ''}`}
                style={{ '--delay': `${i * 0.07}s` }}
                onClick={() => trackEvent(Events.CLICK_CATEGORIA, { categoria_nombre: cat.name })}>
                {cat.isHot && <span className="catcard__badge-hot">TOP</span>}
                <div className="catcard__top">
                  <div className="catcard__icon"><CategoryIcon name={cat.icon} size={28} /></div>
                </div>
                <h3 className="catcard__name">{name}</h3>
                <p className="catcard__desc t-sm">{oneLiner}</p>
              </Link>
            )
          })}
        </div>

        {/* Suggest a category CTA */}
        <div className="catgrid__suggest">
          <button className="catgrid__suggest-btn" onClick={() => setShowSuggest(true)}>
            <span>＋</span>
            {t('categories.suggest_cta')}
          </button>
        </div>
      </div>

      {showSuggest && (
        <CategorySuggestionModal onClose={() => setShowSuggest(false)} />
      )}
    </section>
  )
}
