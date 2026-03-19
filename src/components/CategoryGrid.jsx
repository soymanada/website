// src/components/CategoryGrid.jsx
import { Link } from 'react-router-dom';
import categories from '../data/categories.json';
import { trackEvent, Events } from '../utils/analytics';
import CategoryIcon from './CategoryIcon';
import './CategoryGrid.css';

export default function CategoryGrid() {
  const sorted = [...categories].sort((a, b) => a.order - b.order);

  return (
    <section id="categorias" className="catgrid section">
      <div className="container">
        <div className="catgrid__header">
          <h2 className="d-xl catgrid__title">Explora por categoría</h2>
          <p className="t-lg catgrid__sub">Nuestra selección curada de servicios para ti.</p>
        </div>

        <div className="catgrid__grid">
          {sorted.map((cat, i) => {
            const isVIP = cat.slug === 'seguros' || cat.slug === 'migracion';
            return (
              <Link
                key={cat.slug}
                to={`/categoria/${cat.slug}`}
                className={`catcard ${isVIP ? 'catcard--vip' : ''}`}
                style={{ '--delay': `${i * 0.07}s` }}
                onClick={() => trackEvent(Events.CLICK_CATEGORIA, { categoria_nombre: cat.name })}
              >
                {cat.isHot && <span className="catcard__badge-hot">TOP</span>}
                <div className="catcard__top">
                  <div className="catcard__icon">
                  <CategoryIcon name={cat.icon} size={28} />
                </div>
                </div>
                <h3 className="catcard__name">{cat.name}</h3>
                <p className="catcard__desc t-sm">{cat.oneLiner}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}