import { Link } from 'react-router-dom'
import categories from '../data/categories.json'
import { trackEvent, Events } from '../utils/analytics'
import './CategoryGrid.css'

export default function CategoryGrid() {
  const sorted = [...categories].sort((a, b) => a.order - b.order)

  return (
    <section className="catgrid section">
      <div className="container">
        <div className="catgrid__header">
          <p className="eyebrow">¿Qué necesitas?</p>
          <h2 className="d-xl catgrid__title">Explora por categoría</h2>
          <p className="t-lg catgrid__sub">Elige el área y encuentra a quien te puede ayudar hoy.</p>
        </div>

        <div className="catgrid__grid">
          {sorted.map((cat, i) => (
            <Link
              key={cat.slug}
              to={`/categoria/${cat.slug}`}
              className="catcard"
              style={{ '--delay': `${i * 0.07}s` }}
              onClick={() => trackEvent(Events.CLICK_CATEGORY_CARD, { category: cat.slug })}
            >
              <div className="catcard__top">
                <div className="catcard__icon" aria-hidden="true">{cat.icon}</div>
                <svg className="catcard__arrow" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3.75 9h10.5M10 5.25L13.75 9 10 12.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="catcard__name">{cat.name}</h3>
              <p className="catcard__desc t-sm">{cat.oneLiner}</p>
              <div className="catcard__hover-fill" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
