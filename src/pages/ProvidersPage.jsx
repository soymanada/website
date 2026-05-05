// src/pages/ProvidersPage.jsx — Directorio de proveedores con búsqueda y filtros
import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import categories  from '../data/categories.json'
import { supabase } from '../lib/supabase'
import { normalizeProviders } from '../utils/providerNormalize'
import ProviderCard from '../components/ProviderCard'
import CategoryIcon from '../components/CategoryIcon'
import { resolveProvider } from '../utils/providerI18n'
import { trackEvent, Events } from '../utils/analytics'
import './ProvidersPage.css'

// Países únicos extraídos de los datos
const ALL_COUNTRIES = [
  'Alemania','Australia','Austria','Canadá','Chile','Corea del Sur',
  'Dinamarca','Francia','Hungría','Irlanda','Islandia','Japón',
  'Luxemburgo','Nueva Zelanda','Polonia','Portugal','República Checa','Suecia'
]

export default function ProvidersPage() {
  const { t, i18n } = useTranslation()
  const [providers, setProviders] = useState([])

  useEffect(() => {
    document.title = 'Directorio de proveedores | SoyManada'
    return () => { document.title = 'SoyManada – Directorio para la comunidad migrante' }
  }, [])

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

  const [query,        setQuery]        = useState('')
  const [activeSlug,   setActiveSlug]   = useState('todas')
  const [activeCountry,setActiveCountry]= useState('todos')
  const [onlyVerified, setOnlyVerified] = useState(false)

  // Debounce búsqueda: dispara evento solo cuando el usuario para de escribir
  const searchTimer = useRef(null)
  const handleSearch = (value) => {
    setQuery(value)
    clearTimeout(searchTimer.current)
    if (value.trim().length >= 2) {
      searchTimer.current = setTimeout(() => {
        trackEvent(Events.SEARCH_DIRECTORIO, { termino: value.trim() })
      }, 800)
    }
  }

  // Eventos de filtros
  const handleFilterCategoria = (slug) => {
    setActiveSlug(slug)
    if (slug !== 'todas') trackEvent(Events.FILTER_CATEGORIA, { categoria: slug })
  }
  const handleFilterPais = (pais) => {
    setActiveCountry(pais)
    if (pais !== 'todos') trackEvent(Events.FILTER_PAIS, { pais })
  }
  const handleFilterVerificados = (checked) => {
    setOnlyVerified(checked)
    trackEvent(Events.FILTER_VERIFICADOS, { activo: checked })
  }

  const filtered = useMemo(() => {
    return providers.filter(p => {
      // Resolver campos traducidos para búsqueda en idioma activo
      const resolved = resolveProvider(p, i18n.language)
      const q = query.toLowerCase()
      const matchText = !q || [resolved.name, resolved.service, resolved.description]
        .some(field => field?.toLowerCase().includes(q))

      // Categoría — soporta multi-categoría (category_slugs) con fallback a categorySlug
      const matchCat = activeSlug === 'todas' ||
        (Array.isArray(p.category_slugs) ? p.category_slugs.includes(activeSlug) : p.categorySlug === activeSlug)

      // País
      const matchCountry = activeCountry === 'todos' ||
        p.countries?.includes(activeCountry)

      // Verificado
      const matchVerified = !onlyVerified || p.verified

      return matchText && matchCat && matchCountry && matchVerified
    })
  }, [providers, query, activeSlug, activeCountry, onlyVerified, i18n.language])

  const clearFilters = () => {
    setQuery('')
    setActiveSlug('todas')
    setActiveCountry('todos')
    setOnlyVerified(false)
  }

  const hasFilters = query || activeSlug !== 'todas' || activeCountry !== 'todos' || onlyVerified

  const resultCount = filtered.length === 1
    ? t('providers_page.results_count_one', { count: 1 })
    : t('providers_page.results_count_other', { count: filtered.length })

  return (
    <main className="dirpage">

      {/* Hero band */}
      <div className="dirpage__hero">
        <div className="dirpage__hero-orb" aria-hidden="true" />
        <div className="container">
          <h1 className="d-xl dirpage__title">{t('providers_page.title')}</h1>
          <p className="t-lg dirpage__sub">{t('providers_page.subtitle')}</p>

          {/* Buscador */}
          <div className="dirpage__search-wrap">
            <svg className="dirpage__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              className="dirpage__search"
              type="search"
              placeholder={t('providers_page.search_placeholder')}
              value={query}
              onChange={e => handleSearch(e.target.value)}
              aria-label={t('providers_page.search_placeholder')}
            />
            {query && (
              <button className="dirpage__search-clear" onClick={() => setQuery('')} aria-label="✕">✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros + resultados */}
      <section className="dirpage__body">
        <div className="container">
          <div className="dirpage__layout">

            {/* Sidebar filtros */}
            <aside className="dirpage__filters">
              <div className="dirpage__filter-block">
                <h3 className="dirpage__filter-title label">{t('providers_page.filter_category')}</h3>
                <div className="dirpage__filter-options">
                  <button
                    className={`dirpage__filter-chip${activeSlug === 'todas' ? ' dirpage__filter-chip--active' : ''}`}
                    onClick={() => handleFilterCategoria('todas')}
                  >
                    {t('providers_page.filter_all_categories')}
                  </button>
                  {categories
                    .filter(c => !c.comingSoon)
                    .sort((a, b) => a.order - b.order)
                    .map(c => (
                      <button
                        key={c.slug}
                        className={`dirpage__filter-chip${activeSlug === c.slug ? ' dirpage__filter-chip--active' : ''}`}
                        onClick={() => handleFilterCategoria(c.slug)}
                      >
                        <CategoryIcon name={c.icon} size={13} />
                        {t(`categories.${c.slug}`, c.name)}
                      </button>
                    ))
                  }
                </div>
              </div>

              <div className="dirpage__filter-block">
                <h3 className="dirpage__filter-title label">{t('providers_page.filter_country')}</h3>
                <select
                  className="dirpage__select"
                  value={activeCountry}
                  onChange={e => handleFilterPais(e.target.value)}
                >
                  <option value="todos">{t('providers_page.filter_all_countries')}</option>
                  {ALL_COUNTRIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="dirpage__filter-block">
                <label className="dirpage__toggle">
                  <input
                    type="checkbox"
                    checked={onlyVerified}
                    onChange={e => handleFilterVerificados(e.target.checked)}
                  />
                  <span className="dirpage__toggle-track" />
                  <span className="dirpage__toggle-label t-sm">{t('providers_page.filter_verified')}</span>
                </label>
              </div>

              {hasFilters && (
                <button className="dirpage__clear t-sm" onClick={clearFilters}>
                  {t('providers_page.clear_filters')}
                </button>
              )}
            </aside>

            {/* Resultados */}
            <div className="dirpage__results">
              <div className="dirpage__results-header">
                <p className="t-sm dirpage__count">
                  {filtered.length === 0 ? t('providers_page.no_results_title') : resultCount}
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className="dirpage__empty">
                  <span className="dirpage__empty-icon" aria-hidden="true">🔍</span>
                  <h2 className="d-md">{t('providers_page.no_results_title')}</h2>
                  <p className="t-lg" style={{ color: 'var(--text-500)' }}>
                    {t('providers_page.no_results_body')}
                  </p>
                  <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={clearFilters}>
                    {t('providers_page.clear_filters_btn')}
                  </button>
                </div>
              ) : (
                <div className="dirpage__grid">
                  {filtered.map(p => <ProviderCard key={p.id} provider={p} />)}
                </div>
              )}

              {/* CTA para nuevos proveedores */}
              <div className="dirpage__cta-bottom">
                <p className="t-sm" style={{ color: 'var(--text-500)' }}>
                  {t('providers_page.suggest_cta')}
                </p>
                <Link to="/registro-proveedores" className="btn btn-secondary btn-sm">
                  <span>{t('providers_page.suggest_btn')}</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  )
}
