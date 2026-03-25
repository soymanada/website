// src/pages/ProvidersPage.jsx — Directorio de proveedores con búsqueda y filtros
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import providers   from '../data/providers.json'
import categories  from '../data/categories.json'
import ProviderCard from '../components/ProviderCard'
import CategoryIcon from '../components/CategoryIcon'
import './ProvidersPage.css'

// Países únicos extraídos de los datos
const ALL_COUNTRIES = [
  'Alemania','Australia','Austria','Canadá','Chile','Corea del Sur',
  'Dinamarca','Francia','Hungría','Irlanda','Islandia','Japón',
  'Luxemburgo','Nueva Zelanda','Polonia','Portugal','República Checa','Suecia'
]

export default function ProvidersPage() {
  const [query,        setQuery]        = useState('')
  const [activeSlug,   setActiveSlug]   = useState('todas')
  const [activeCountry,setActiveCountry]= useState('todos')
  const [onlyVerified, setOnlyVerified] = useState(false)

  const filtered = useMemo(() => {
    return providers.filter(p => {
      // Texto libre: nombre, servicio, descripción
      const q = query.toLowerCase()
      const matchText = !q || [p.name, p.service, p.description]
        .some(field => field?.toLowerCase().includes(q))

      // Categoría
      const matchCat = activeSlug === 'todas' || p.categorySlug === activeSlug

      // País
      const matchCountry = activeCountry === 'todos' ||
        p.countries?.includes(activeCountry)

      // Verificado
      const matchVerified = !onlyVerified || p.verified

      return matchText && matchCat && matchCountry && matchVerified
    })
  }, [query, activeSlug, activeCountry, onlyVerified])

  const clearFilters = () => {
    setQuery('')
    setActiveSlug('todas')
    setActiveCountry('todos')
    setOnlyVerified(false)
  }

  const hasFilters = query || activeSlug !== 'todas' || activeCountry !== 'todos' || onlyVerified

  return (
    <main className="dirpage">

      {/* Hero band */}
      <div className="dirpage__hero">
        <div className="dirpage__hero-orb" aria-hidden="true" />
        <div className="container">
          <h1 className="d-xl dirpage__title">Directorio de proveedores</h1>
          <p className="t-lg dirpage__sub">
            Proveedores verificados para la comunidad migrante hispanohablante.
            Busca, filtra y contacta directo.
          </p>

          {/* Buscador */}
          <div className="dirpage__search-wrap">
            <svg className="dirpage__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              className="dirpage__search"
              type="search"
              placeholder="Buscar por nombre, servicio o descripción…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Buscar proveedores"
            />
            {query && (
              <button className="dirpage__search-clear" onClick={() => setQuery('')} aria-label="Limpiar búsqueda">✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros + resultados */}
      <section className="dirpage__body section">
        <div className="container">
          <div className="dirpage__layout">

            {/* Sidebar filtros */}
            <aside className="dirpage__filters">
              <div className="dirpage__filter-block">
                <h3 className="dirpage__filter-title label">Categoría</h3>
                <div className="dirpage__filter-options">
                  <button
                    className={`dirpage__filter-chip${activeSlug === 'todas' ? ' dirpage__filter-chip--active' : ''}`}
                    onClick={() => setActiveSlug('todas')}
                  >
                    Todas
                  </button>
                  {categories
                    .filter(c => !c.comingSoon)
                    .sort((a, b) => a.order - b.order)
                    .map(c => (
                      <button
                        key={c.slug}
                        className={`dirpage__filter-chip${activeSlug === c.slug ? ' dirpage__filter-chip--active' : ''}`}
                        onClick={() => setActiveSlug(c.slug)}
                      >
                        <CategoryIcon name={c.icon} size={13} />
                        {c.name}
                      </button>
                    ))
                  }
                </div>
              </div>

              <div className="dirpage__filter-block">
                <h3 className="dirpage__filter-title label">País</h3>
                <select
                  className="dirpage__select"
                  value={activeCountry}
                  onChange={e => setActiveCountry(e.target.value)}
                >
                  <option value="todos">Todos los países</option>
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
                    onChange={e => setOnlyVerified(e.target.checked)}
                  />
                  <span className="dirpage__toggle-track" />
                  <span className="dirpage__toggle-label t-sm">Solo verificados por Manada</span>
                </label>
              </div>

              {hasFilters && (
                <button className="dirpage__clear t-sm" onClick={clearFilters}>
                  ✕ Limpiar filtros
                </button>
              )}
            </aside>

            {/* Resultados */}
            <div className="dirpage__results">
              <div className="dirpage__results-header">
                <p className="t-sm dirpage__count">
                  {filtered.length === 0
                    ? 'Sin resultados'
                    : `${filtered.length} proveedor${filtered.length !== 1 ? 'es' : ''}`}
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className="dirpage__empty">
                  <span className="dirpage__empty-icon" aria-hidden="true">🔍</span>
                  <h2 className="d-md">Sin resultados</h2>
                  <p className="t-lg" style={{ color: 'var(--text-500)' }}>
                    Prueba con otros términos o limpia los filtros.
                  </p>
                  <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={clearFilters}>
                    Limpiar filtros
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
                  ¿No encuentras lo que buscas?
                </p>
                <Link to="/registro-proveedores" className="btn btn-secondary btn-sm">
                  <span>Sugiere un proveedor</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  )
}
