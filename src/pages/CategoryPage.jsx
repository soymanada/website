import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import categories          from '../data/categories.json'
import { TIER_RANK }       from '../config/providerPlans'
import { supabase }        from '../lib/supabase'
import { normalizeProviders } from '../utils/providerNormalize'
import ProviderCard        from '../components/ProviderCard'
import CategoryIcon        from '../components/CategoryIcon'
import PawIcon             from '../components/PawIcon'
import RemesasComparator   from '../components/RemesasComparator'
import { useAuth }         from '../hooks/useAuth'
import { trackEvent, Events } from '../utils/analytics'
import './CategoryPage.css'

function SegurosQuoteBanner() {
  const { user } = useAuth()
  return (
    <div className="catpage__cotiza">
      <div className="catpage__cotiza-header">
        <span className="catpage__cotiza-badge">💡 Consejo clave</span>
        <h2 className="catpage__cotiza-title d-md">
          Solicita cotización a varios — esa es la diferencia
        </h2>
        <p className="catpage__cotiza-body t-lg">
          Cada asesor trabaja con <strong>distintas aseguradoras</strong>. El mismo seguro puede
          tener precios y coberturas muy distintas según quién lo gestione.
          Comparar es gratis y puede ahorrarte cientos de dólares.
        </p>
      </div>

      <div className="catpage__cotiza-props">
        <div className="catpage__cotiza-prop">
          <span className="catpage__cotiza-prop-icon">💰</span>
          <div>
            <strong className="t-sm">Precios distintos</strong>
            <p className="t-xs">La misma cobertura puede costar muy diferente según la agencia</p>
          </div>
        </div>
        <div className="catpage__cotiza-prop">
          <span className="catpage__cotiza-prop-icon">🎯</span>
          <div>
            <strong className="t-sm">Plan a tu medida</strong>
            <p className="t-xs">Cada asesor puede armar una oferta según tu edad, destino y actividad</p>
          </div>
        </div>
        <div className="catpage__cotiza-prop">
          <span className="catpage__cotiza-prop-icon">✉️</span>
          <div>
            <strong className="t-sm">Sin compromiso</strong>
            <p className="t-xs">Contactarlos es gratis — nada te obliga a contratar</p>
          </div>
        </div>
      </div>

      {!user && (
        <div className="catpage__cotiza-cta">
          <Link to="/login" className="btn btn-primary catpage__cotiza-btn">
            <span>Crear cuenta gratis →</span>
          </Link>
          <p className="t-xs catpage__cotiza-cta-hint">
            Con tu cuenta puedes escribirles directo desde la plataforma
          </p>
        </div>
      )}
      {user && (
        <p className="catpage__cotiza-loggedin t-sm">
          ✅ Ya tienes cuenta — escríbeles a 2 o 3 y pídeles su mejor precio.
        </p>
      )}
    </div>
  )
}

export default function CategoryPage() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const [providers, setProviders] = useState([])
  const cat  = categories.find(c => c.slug === slug)
  const list = providers.filter(p =>
    Array.isArray(p.category_slugs) ? p.category_slugs.includes(slug) : p.categorySlug === slug
  )

  useEffect(() => {
    let mounted = true

    supabase
      .from('providers')
      .select('*')
      .eq('active', true)
      .then(({ data, error }) => {
        if (!mounted || error || !Array.isArray(data)) return
        setProviders(normalizeProviders(data))
      })

    return () => { mounted = false }
  }, [])

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

  // Verificados primero, luego Wolf > Cub > Wonderer
  const sorted = useMemo(() => [...list].sort((a, b) => {
    if (a.verified !== b.verified) return (b.verified ? 1 : 0) - (a.verified ? 1 : 0)
    return (TIER_RANK[b.tier] || 0) - (TIER_RANK[a.tier] || 0)
  }), [list])

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
          {slug === 'seguros' && <SegurosQuoteBanner />}
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
              {sorted.map(p => <ProviderCard key={p.id} provider={p} />)}
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
