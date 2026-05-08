// src/components/dashboard/ManualProveedor.jsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './ManualProveedor.css'

// Article definitions — only static metadata (id, category key, icon, link tab).
// All user-visible text comes from i18n.
const ARTICLE_DEFS = [
  { id: 'perfil-completar',          catKey: 'manual.cat_perfil',          icon: '👤', linkTab: 'perfil' },
  { id: 'perfil-foto',               catKey: 'manual.cat_perfil',          icon: '📷', linkTab: 'perfil' },
  { id: 'perfil-pago-externo',       catKey: 'manual.cat_perfil',          icon: '💳', linkTab: 'perfil' },
  { id: 'perfil-contrasena',         catKey: 'manual.cat_perfil',          icon: '🔑', linkTab: 'perfil' },
  { id: 'herramientas-whatsapp',     catKey: 'manual.cat_herramientas',    icon: '📱', linkTab: 'herramientas' },
  { id: 'herramientas-agenda',       catKey: 'manual.cat_herramientas',    icon: '📅', linkTab: 'herramientas' },
  { id: 'herramientas-stripe',       catKey: 'manual.cat_herramientas',    icon: '🔐', linkTab: 'herramientas' },
  { id: 'herramientas-email',        catKey: 'manual.cat_herramientas',    icon: '✉️', linkTab: 'herramientas' },
  { id: 'herramientas-respuestas',   catKey: 'manual.cat_herramientas',    icon: '💬', linkTab: 'herramientas' },
  { id: 'resenas-responder',         catKey: 'manual.cat_resenas',         icon: '⭐', linkTab: 'reseñas' },
  { id: 'resenas-como-llegan',       catKey: 'manual.cat_resenas',         icon: '📬', linkTab: 'reservas' },
  { id: 'reservas-gestionar',        catKey: 'manual.cat_reservas',        icon: '🗓', linkTab: 'reservas' },
  { id: 'reservas-confirmacion',     catKey: 'manual.cat_reservas',        icon: '📧', linkTab: 'reservas' },
  { id: 'recomendaciones-que-son',   catKey: 'manual.cat_recomendaciones', icon: '🤝', linkTab: 'recomendaciones' },
  { id: 'recomendaciones-como-dar',  catKey: 'manual.cat_recomendaciones', icon: '✍️', linkTab: 'recomendaciones' },
  { id: 'recomendaciones-retirar',   catKey: 'manual.cat_recomendaciones', icon: '↩️', linkTab: 'recomendaciones' },
]

export default function ManualProveedor({ onNavigate }) {
  const { t } = useTranslation()
  const [search,         setSearch]         = useState('')
  const [openId,         setOpenId]         = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')

  // Build articles with translated content at render time
  const ARTICLES = ARTICLE_DEFS.map(def => ({
    ...def,
    category: t(def.catKey),
    title:    t(`manual.articles.${def.id}.title`),
    content:  t(`manual.articles.${def.id}.content`),
    linkLabel: t(`manual.articles.${def.id}.link_label`),
  }))

  const CAT_KEYS = [...new Set(ARTICLE_DEFS.map(d => d.catKey))]
  const CATEGORIES = CAT_KEYS.map(k => ({ key: k, label: t(k) }))

  const filtered = ARTICLES.filter(a => {
    const matchCat  = activeCategory === 'all' || a.catKey === activeCategory
    const matchText = !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchText
  })

  const toggle = (id) => setOpenId(prev => prev === id ? null : id)

  const renderContent = (text) =>
    text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g)
      const rendered = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
      )
      return <p key={i} className={line === '' ? 'manual__spacer' : 'manual__line'}>{rendered}</p>
    })

  return (
    <div className="pdash__section manual">
      <div className="pdash__section-header">
        <h2 className="pdash__section-title d-md">{t('manual.title')}</h2>
        <p className="t-sm pdash__section-sub">{t('manual.subtitle')}</p>
      </div>

      {/* Búsqueda */}
      <div className="manual__search-wrap">
        <span className="manual__search-icon" aria-hidden="true">🔍</span>
        <input
          className="manual__search"
          type="search"
          placeholder={t('manual.search_placeholder')}
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveCategory('all') }}
        />
        {search && (
          <button className="manual__search-clear" onClick={() => setSearch('')} aria-label={t('manual.search_clear')}>
            ✕
          </button>
        )}
      </div>

      {/* Filtros por categoría */}
      {!search && (
        <div className="manual__categories">
          {[{ key: 'all', label: t('manual.all_categories') }, ...CATEGORIES].map(cat => (
            <button
              key={cat.key}
              className={`manual__cat-btn${activeCategory === cat.key ? ' manual__cat-btn--active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Resultados vacíos */}
      {filtered.length === 0 && (
        <div className="manual__empty">
          <p className="t-sm" style={{ color: 'var(--text-300)' }}>
            {t('manual.empty', { search })}
          </p>
        </div>
      )}

      {/* Lista — agrupada por categoría cuando no hay búsqueda */}
      {!search && activeCategory === 'all'
        ? CAT_KEYS.map(catKey => {
            const catArticles = filtered.filter(a => a.catKey === catKey)
            if (catArticles.length === 0) return null
            return (
              <div key={catKey} className="manual__group">
                <h3 className="manual__group-title t-sm">{t(catKey).toUpperCase()}</h3>
                {catArticles.map(a => (
                  <ArticleCard key={a.id} article={a} open={openId === a.id}
                    onToggle={() => toggle(a.id)} onNavigate={onNavigate}
                    renderContent={renderContent} />
                ))}
              </div>
            )
          })
        : filtered.map(a => (
            <ArticleCard key={a.id} article={a} open={openId === a.id}
              onToggle={() => toggle(a.id)} onNavigate={onNavigate}
              renderContent={renderContent} />
          ))
      }
    </div>
  )
}

function ArticleCard({ article, open, onToggle, onNavigate, renderContent }) {
  return (
    <div className={`manual__card${open ? ' manual__card--open' : ''}`}>
      <button className="manual__card-header" onClick={onToggle} aria-expanded={open}>
        <span className="manual__card-icon" aria-hidden="true">{article.icon}</span>
        <span className="manual__card-title t-sm">{article.title}</span>
        <span className={`manual__card-chevron${open ? ' manual__card-chevron--open' : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <div className="manual__card-body">
          <div className="manual__card-content">
            {renderContent(article.content)}
          </div>
          {article.linkLabel && (
            <div className="manual__card-links">
              <button
                className="btn btn-ghost btn-sm manual__card-link"
                onClick={() => onNavigate?.(article.linkTab)}
              >
                {article.linkLabel} →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
