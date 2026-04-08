import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
// NOTE: providers and categories are served from static JSON (not Supabase).
// This is intentional for initial load speed. Update the JSON files when
// provider data changes, or migrate to a Supabase query in a future sprint.
import categories          from '../data/categories.json'
import providers           from '../data/providers.json'
import ProviderCard        from '../components/ProviderCard'
import CategoryIcon        from '../components/CategoryIcon'
import PawIcon             from '../components/PawIcon'
import RemesasComparator   from '../components/RemesasComparator'
import { trackEvent, Events } from '../utils/analytics'
import './CategoryPage.css'

export default function CategoryPage() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const cat  = categories.find(c => c.slug === slug)
  const list = providers.filter(p => p.categorySlug === slug)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (cat) {
      trackEvent(Events.VIEW_CATEGORY_PAGE, { category: slug })
      document.title = `${t(`categories.${cat.slug}`, cat.name)} | SoyManada`
    }
    return () => { document.title = 'SoyManada – Directorio para la comunidad migrante' }
  }, [slug, cat, t])

  if (!cat) return (
    <main className="cat-404">
      <div className="container">
        <h1 className="d-lg">{t('category_page.not_found_title')}</h1>
        <p className="t-lg" style={{ color: 'var(--text-500)', marginTop: 12 }}>{t('category_page.not_found_body')}</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 28 }}><span>{t('category_page.back_home')}</span></Link>
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
            <Link to="/">{t('category_page.breadcrumb_home')}</Link>
            <span aria-hidden="true">›</span>
            <span>{t(`categories.${slug}`, cat.name)}</span>
          </nav>

          <div className="catpage__hero-content">
            <div className="catpage__icon" aria-hidden="true">
              <CategoryIcon name={cat.icon} size={32} />
            </div>
            <div>
              <h1 className="d-xl catpage__title">{t(`categories.${slug}`, cat.name)}</h1>
              <p className="t-lg catpage__sub">{t(`categories.${slug}_oneliner`, cat.oneLiner)}</p>
            </div>
          </div>

          <div className="catpage__meta">
            <span className="catpage__pill">{t('category_page.provider_count', { count: list.length })}</span>
            <span className="catpage__pill catpage__pill--iris" style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
              <PawIcon size={11} />{t('category_page.verified_count', { count: verified })}
            </span>
          </div>
        </div>
      </div>

      {/* Providers */}
      <section className="catpage__providers section">
        <div className="container">
          {slug === 'remesas' && <RemesasComparator />}
          {cat.comingSoon ? (
            <div className="catpage__empty">
              <span className="catpage__empty-icon" aria-hidden="true">🧳</span>
              <h2 className="d-md">{t(`categories.${slug}`, cat.name)}</h2>
              <p className="t-lg" style={{ color: 'var(--text-500)' }}>
                {t('category_page.coming_soon_body')}
              </p>
              {cat.comingSoonLink && (
                <a
                  href={cat.comingSoonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ marginTop: 20 }}
                >
                  <span>{t('category_page.coming_soon_cta')}</span>
                </a>
              )}
            </div>
          ) : list.length === 0 ? (
            <div className="catpage__empty">
              <span className="catpage__empty-icon" aria-hidden="true">🌱</span>
              <h2 className="d-md">{t('category_page.empty_title')}</h2>
              <p className="t-lg" style={{ color: 'var(--text-500)' }}>{t('category_page.empty_body')}</p>
              <Link to="/registro-proveedores" className="btn btn-primary" style={{ marginTop: 20 }}><span>{t('category_page.empty_cta')}</span></Link>
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
          <h2 className="d-md catpage__others-title">{t('category_page.others_title')}</h2>
          <div className="catpage__other-chips">
            {categories.filter(c => c.slug !== slug).map(c => (
              <Link
                key={c.slug}
                to={`/categoria/${c.slug}`}
                className="catpage__other-chip"
                onClick={() => trackEvent(Events.CLICK_CATEGORY_CARD, { category: c.slug, from: 'category_bottom' })}
              >
                <CategoryIcon name={c.icon} size={14} /> {t(`categories.${c.slug}`, c.name)}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
