import { useEffect, useState } from 'react'
import { Search, X, UserPlus, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import {
  getMyEndorsements,
  endorseExistingProvider,
  recommendNewProvider,
  deactivateEndorsement,
  MAX_ENDORSEMENTS
} from '../../lib/endorsements'
import './EndorsementsPanel.css'

function dicebearUrl(seed) {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`
}

export default function EndorsementsPanel({ myProviderId }) {
  const [endorsements, setEndorsements]     = useState([])
  const [loading, setLoading]               = useState(true)
  const [showModal, setShowModal]           = useState(false)
  const [mode, setMode]                     = useState('search') // 'search' | 'new'
  const [searchQuery, setSearchQuery]       = useState('')
  const [searchResults, setSearchResults]   = useState([])
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [message, setMessage]               = useState('')
  const [newProvider, setNewProvider]       = useState({
    name: '', categorySlug: '', service: '', contactWhatsapp: '', contactInstagram: ''
  })
  const [submitting, setSubmitting]         = useState(false)
  const [feedback, setFeedback]             = useState(null)

  const activeCount = endorsements.filter(e => e.active).length
  const canAdd = activeCount < MAX_ENDORSEMENTS

  useEffect(() => {
    if (!myProviderId) return
    refresh()
  }, [myProviderId])

  async function refresh() {
    setLoading(true)
    try {
      const data = await getMyEndorsements(myProviderId)
      setEndorsements(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(q) {
    setSearchQuery(q)
    if (q.length < 2) { setSearchResults([]); return }
    const { data } = await supabase
      .from('providers')
      .select('id, name, category_slug, avatar_url, verified, active')
      .ilike('name', `%${q}%`)
      .eq('active', true)
      .neq('id', myProviderId)
      .limit(8)
    setSearchResults(data ?? [])
  }

  async function handleEndorseExisting() {
    if (!selectedProvider || !message.trim()) return
    setSubmitting(true)
    try {
      await endorseExistingProvider(myProviderId, selectedProvider.id, message)
      setFeedback({ type: 'ok', text: `Recomendación enviada a ${selectedProvider.name}` })
      setShowModal(false)
      reset()
      await refresh()
    } catch (e) {
      setFeedback({ type: 'error', text: e.message })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRecommendNew() {
    const { name, categorySlug, service } = newProvider
    if (!name || !categorySlug || !service || !message.trim()) return
    setSubmitting(true)
    try {
      await recommendNewProvider({ fromProviderId: myProviderId, ...newProvider, message })
      setFeedback({ type: 'ok', text: `${name} fue recomendado/a. Quedará pendiente de revisión por el equipo Manada.` })
      setShowModal(false)
      reset()
      await refresh()
    } catch (e) {
      setFeedback({ type: 'error', text: e.message })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeactivate(endorsementId) {
    if (!confirm('¿Retirar esta recomendación?')) return
    await deactivateEndorsement(endorsementId)
    await refresh()
  }

  function reset() {
    setMode('search'); setSearchQuery(''); setSearchResults([])
    setSelectedProvider(null); setMessage('')
    setNewProvider({ name: '', categorySlug: '', service: '', contactWhatsapp: '', contactInstagram: '' })
  }

  return (
    <div className="pdash__section endorsements-panel">
      <div className="pdash__section-header">
        <div>
          <h2 className="pdash__section-title d-md">🤝 Mis recomendaciones</h2>
          <p className="t-sm pdash__section-sub endorsements-panel__sub">
            {activeCount}/{MAX_ENDORSEMENTS} activas · Solo proveedores verificados pueden recomendar
          </p>
        </div>
        {canAdd && (
          <button className="btn-endorse-add" onClick={() => { setShowModal(true); setFeedback(null) }}>
            <UserPlus size={16} />
            Recomendar a alguien
          </button>
        )}
      </div>

      {feedback && (
        <div className={`endorsements-panel__feedback endorsements-panel__feedback--${feedback.type}`}>
          {feedback.type === 'ok' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {feedback.text}
        </div>
      )}

      {loading ? (
        <p className="endorsements-panel__empty">Cargando…</p>
      ) : endorsements.length === 0 ? (
        <div className="endorsements-panel__empty">
          <UserPlus size={32} strokeWidth={1.5} />
          <p>Aún no has recomendado a nadie.<br />Cuando recomiendes a alguien, aparecerá aquí.</p>
        </div>
      ) : (
        <ul className="endorsements-panel__list">
          {endorsements.map(e => (
            <li key={e.id} className={`endorsements-panel__item${e.active ? '' : ' endorsements-panel__item--inactive'}`}>
              <img
                src={e.to_provider?.avatar_url || dicebearUrl(e.to_provider?.name || e.id)}
                alt={e.to_provider?.name}
                width={40} height={40}
                className="endorsements-panel__item-avatar"
                loading="lazy"
              />
              <div className="endorsements-panel__item-info">
                <span className="endorsements-panel__item-name">
                  {e.to_provider?.name}
                  {!e.active && <span className="endorsements-panel__item-tag">Retirada</span>}
                  {e.to_provider && !e.to_provider.verified && e.active && (
                    <span className="endorsements-panel__item-tag endorsements-panel__item-tag--pending">En revisión</span>
                  )}
                </span>
                <span className="endorsements-panel__item-cat">{e.to_provider?.category_slug}</span>
                <span className="endorsements-panel__item-msg">"{e.message}"</span>
              </div>
              {e.active && (
                <button
                  className="endorsements-panel__item-remove"
                  onClick={() => handleDeactivate(e.id)}
                  aria-label="Retirar recomendación"
                >
                  <X size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <div className="endorsements-modal-overlay" onClick={() => { setShowModal(false); reset() }}>
          <div className="endorsements-modal" onClick={e => e.stopPropagation()}>
            <div className="endorsements-modal__head">
              <h4>Recomendar a alguien</h4>
              <button onClick={() => { setShowModal(false); reset() }} aria-label="Cerrar"><X size={18} /></button>
            </div>

            <div className="endorsements-modal__tabs">
              <button className={mode === 'search' ? 'active' : ''} onClick={() => setMode('search')}>
                Buscar proveedor existente
              </button>
              <button className={mode === 'new' ? 'active' : ''} onClick={() => setMode('new')}>
                Recomendar a alguien nuevo
              </button>
            </div>

            {mode === 'search' && (
              <div className="endorsements-modal__body">
                <div className="endorsements-modal__search-wrap">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre…"
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                {searchResults.length > 0 && !selectedProvider && (
                  <ul className="endorsements-modal__results">
                    {searchResults.map(p => (
                      <li key={p.id} onClick={() => { setSelectedProvider(p); setSearchResults([]) }}>
                        <img src={p.avatar_url || dicebearUrl(p.name)} alt={p.name} width={32} height={32} loading="lazy" />
                        <span>{p.name}</span>
                        <span className="endorsements-modal__result-cat">{p.category_slug}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {selectedProvider && (
                  <div className="endorsements-modal__selected">
                    <img src={selectedProvider.avatar_url || dicebearUrl(selectedProvider.name)} alt={selectedProvider.name} width={36} height={36} loading="lazy" />
                    <span>{selectedProvider.name}</span>
                    <button onClick={() => setSelectedProvider(null)} aria-label="Cambiar"><X size={12} /></button>
                  </div>
                )}
              </div>
            )}

            {mode === 'new' && (
              <div className="endorsements-modal__body">
                <label>Nombre<input type="text" placeholder="Ej: María González" value={newProvider.name} onChange={e => setNewProvider(p => ({ ...p, name: e.target.value }))} /></label>
                <label>Categoría<input type="text" placeholder="Ej: traducciones" value={newProvider.categorySlug} onChange={e => setNewProvider(p => ({ ...p, categorySlug: e.target.value }))} /></label>
                <label>Servicio que ofrece<input type="text" placeholder="Ej: Traducciones certificadas" value={newProvider.service} onChange={e => setNewProvider(p => ({ ...p, service: e.target.value }))} /></label>
                <label>WhatsApp (opcional)<input type="text" placeholder="+56 9 1234 5678" value={newProvider.contactWhatsapp} onChange={e => setNewProvider(p => ({ ...p, contactWhatsapp: e.target.value }))} /></label>
                <label>Instagram (opcional)<input type="text" placeholder="@usuario" value={newProvider.contactInstagram} onChange={e => setNewProvider(p => ({ ...p, contactInstagram: e.target.value }))} /></label>
                <p className="endorsements-modal__note">
                  Esta persona quedará pendiente de revisión por el equipo antes de aparecer en el directorio.
                </p>
              </div>
            )}

            <div className="endorsements-modal__message">
              <label>
                Tu recomendación <span>{message.length}/120</span>
                <textarea
                  maxLength={120}
                  minLength={10}
                  rows={3}
                  placeholder="¿Por qué la recomiendas? Ej: Trabajé con ella y es impecable, muy seria."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </label>
            </div>

            <div className="endorsements-modal__foot">
              <button
                className="btn-endorse-submit"
                disabled={
                  submitting ||
                  message.trim().length < 10 ||
                  (mode === 'search' && !selectedProvider) ||
                  (mode === 'new' && (!newProvider.name || !newProvider.categorySlug || !newProvider.service))
                }
                onClick={mode === 'search' ? handleEndorseExisting : handleRecommendNew}
              >
                {submitting ? 'Guardando…' : 'Confirmar recomendación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
