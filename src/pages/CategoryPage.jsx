import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import categories   from '../data/categories.json'
import providers    from '../data/providers.json'
import ProviderCard from '../components/ProviderCard'
import CategoryIcon from '../components/CategoryIcon'
import { trackEvent, Events } from '../utils/analytics'
import './CategoryPage.css'

export default function CategoryPage() {
  const { slug } = useParams()
  const cat  = categories.find(c => c.slug === slug)
  const list = providers.filter(p => p.categorySlug === slug)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (cat) trackEvent(Events.VIEW_CATEGORY_PAGE, { category: slug })
  }, [slug, cat])

  if (!cat) return (
    <main className="cat-404">
      <div className="container">
        <h1 className="d-lg">Categoría no encontrada</h1>
        <p className="t-lg" style={{ color: 'var(--text-500)', marginTop: 12 }}>La categoría que buscas no existe o fue movida.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 28 }}><span>Volver al inicio</span></Link>
      </div>
    </main>
  )

  const verified = list.filter(p => p.verified).length

  return (
    <main className="catpage">
      {/* Hero band */}
      <div className="catpage__hero">
        <div className="catpage__hero-orb" aria-hidden="true" />
        <div className="container">
          <nav className="catpage__crumb t-sm" aria-label="Ruta de navegación">
            <Link to="/">Inicio</Link>
            <span aria-hidden="true">›</span>
            <span>{cat.name}</span>
          </nav>

          <div className="catpage__hero-content">
            <div className="catpage__icon" aria-hidden="true">
              <CategoryIcon name={cat.icon} size={32} />
            </div>
            <div>
              <h1 className="d-xl catpage__title">{cat.name}</h1>
              <p className="t-lg catpage__sub">{cat.oneLiner}</p>
            </div>
          </div>

          <div className="catpage__meta">
            <span className="catpage__pill">{list.length} proveedor{list.length !== 1 ? 'es' : ''}</span>
            <span className="catpage__pill catpage__pill--iris">✦ {verified} verificado{verified !== 1 ? 's' : ''} por Manada</span>
          </div>
        </div>
      </div>

      {/* Providers */}
      <section className="catpage__providers section">
        <div className="container">
          {cat.comingSoon ? (
            <div className="catpage__empty">
              <span className="catpage__empty-icon" aria-hidden="true">🧳</span>
              <h2 className="d-md">{cat.name}</h2>
              <p className="t-lg" style={{ color: 'var(--text-500)' }}>
                Esta sección está en construcción, pero la conversación ya está pasando.
              </p>
              {cat.comingSoonLink && (
                <a
                  href={cat.comingSoonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ marginTop: 20 }}
                >
                  <span>Únete al grupo Manada a Canadá →</span>
                </a>
              )}
            </div>
          ) : list.length === 0 ? (
            <div className="catpage__empty">
              <span className="catpage__empty-icon" aria-hidden="true">🌱</span>
              <h2 className="d-md">Pronto habrá proveedores aquí</h2>
              <p className="t-lg" style={{ color: 'var(--text-500)' }}>Estamos validando proveedores para esta categoría.</p>
              <Link to="/registro-proveedores" className="btn btn-primary" style={{ marginTop: 20 }}><span>Sugerir un proveedor</span></Link>
            </div>
          ) : (
            <div className="catpage__grid">
              {list.map(p => <ProviderCard key={p.id} provider={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Other categories */}
      <section className="catpage__others section">
        <div className="container">
          <h2 className="d-md catpage__others-title">Otras categorías</h2>
          <div className="catpage__other-chips">
            {categories.filter(c => c.slug !== slug).map(c => (
              <Link
                key={c.slug}
                to={`/categoria/${c.slug}`}
                className="catpage__other-chip"
                onClick={() => trackEvent(Events.CLICK_CATEGORY_CARD, { category: c.slug, from: 'category_bottom' })}
              >
                <CategoryIcon name={c.icon} size={14} /> {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
