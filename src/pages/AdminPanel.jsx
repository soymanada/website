// src/pages/AdminPanel.jsx
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import './AdminPanel.css'

const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('es-CL') : '—'

// ── Usuarios ──────────────────────────────────────────────────────────────────
function UsersPanel() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, email, role, tier, created_at')
      .order('created_at', { ascending: false })
    setUsers(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const save = async () => {
    await supabase.from('profiles')
      .update({ role: editing.role, tier: editing.tier })
      .eq('id', editing.id)
    setEditing(null)
    load()
  }

  return (
    <div className="adm-section">
      <div className="adm-section__head">
        <h2 className="adm-section__title">
          Usuarios <span className="adm-badge">{users.length}</span>
        </h2>
      </div>

      {loading ? <p className="adm-loading">Cargando...</p> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Email</th><th>Rol</th><th>Tier</th><th>Registro</th><th></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="adm-td--mono">{u.email ?? '—'}</td>
                  <td><span className={`adm-pill adm-pill--${u.role}`}>{u.role}</span></td>
                  <td>{u.tier ?? '—'}</td>
                  <td>{fmt(u.created_at)}</td>
                  <td>
                    <button className="adm-btn adm-btn--sm adm-btn--ghost"
                      onClick={() => setEditing({ id: u.id, role: u.role, tier: u.tier ?? 'bronze' })}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="adm-overlay" onClick={() => setEditing(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h3>Editar usuario</h3>
            <label>Rol
              <select value={editing.role}
                onChange={e => setEditing(p => ({ ...p, role: e.target.value }))}>
                <option value="migrant">migrant</option>
                <option value="provider">provider</option>
                <option value="admin">admin</option>
              </select>
            </label>
            <label>Tier
              <select value={editing.tier}
                onChange={e => setEditing(p => ({ ...p, tier: e.target.value }))}>
                <option value="bronze">bronze</option>
                <option value="silver">silver</option>
                <option value="gold">gold</option>
              </select>
            </label>
            <div className="adm-modal__actions">
              <button className="adm-btn adm-btn--ghost" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="adm-btn adm-btn--primary" onClick={save}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Proveedores ───────────────────────────────────────────────────────────────
function ProvidersPanel() {
  const [providers, setProviders] = useState([])
  const [loading,   setLoading]   = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('providers')
      .select('*')
      .order('created_at', { ascending: false })
    setProviders(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const toggleVerified = async (p) => {
    const next = !p.verified
    await supabase.from('providers')
      .update({ verified: next, active: next })
      .eq('id', p.id)
    load()
  }

  return (
    <div className="adm-section">
      <div className="adm-section__head">
        <h2 className="adm-section__title">
          Proveedores <span className="adm-badge">{providers.length}</span>
          <span className="adm-badge adm-badge--green">
            {providers.filter(p => p.verified).length} verificados
          </span>
        </h2>
      </div>

      {loading ? <p className="adm-loading">Cargando...</p> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Nombre / Servicio</th><th>Categoría</th>
                <th>Verificado</th><th>Activo</th><th>Registro</th><th></th>
              </tr>
            </thead>
            <tbody>
              {providers.map(p => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    <br /><span className="adm-td--sub">{p.service}</span>
                  </td>
                  <td>{p.category_slug ?? p.categorySlug ?? '—'}</td>
                  <td><span className={`adm-dot ${p.verified ? 'adm-dot--on' : 'adm-dot--off'}`} /></td>
                  <td><span className={`adm-dot ${p.active   ? 'adm-dot--on' : 'adm-dot--off'}`} /></td>
                  <td>{fmt(p.created_at)}</td>
                  <td>
                    <button
                      className={`adm-btn adm-btn--sm ${p.verified ? 'adm-btn--ghost' : 'adm-btn--primary'}`}
                      onClick={() => toggleVerified(p)}>
                      {p.verified ? 'Desverificar' : 'Verificar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Solicitudes ───────────────────────────────────────────────────────────────
function SubmissionsPanel() {
  const [subs,    setSubs]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('provider_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setSubs(data ?? []); setLoading(false) })
  }, [])

  const pending = subs.filter(s => !s.status || s.status === 'pending').length

  return (
    <div className="adm-section">
      <div className="adm-section__head">
        <h2 className="adm-section__title">
          Solicitudes <span className="adm-badge">{pending} pendientes</span>
        </h2>
      </div>

      {loading ? <p className="adm-loading">Cargando...</p>
        : subs.length === 0 ? <p className="adm-empty">No hay solicitudes.</p>
        : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Nombre</th><th>Categoría</th><th>Estado</th><th>Fecha</th><th>Contacto</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.business_name ?? s.name ?? '—'}</strong></td>
                  <td>{s.category_slug ?? '—'}</td>
                  <td>
                    <span className={`adm-pill adm-pill--${s.status ?? 'pending'}`}>
                      {s.status ?? 'pending'}
                    </span>
                  </td>
                  <td>{fmt(s.created_at)}</td>
                  <td className="adm-td--mono">{s.whatsapp ?? s.email ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Panel principal ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'users',       label: 'Usuarios'    },
  { id: 'providers',   label: 'Proveedores' },
  { id: 'submissions', label: 'Solicitudes' },
]

export default function AdminPanel() {
  const [tab, setTab] = useState('users')

  return (
    <main className="adm">
      <div className="container">
        <div className="adm__header">
          <h1 className="d-lg adm__title">Panel de Administración</h1>
          <p className="t-sm adm__sub">SoyManada · acceso restringido</p>
        </div>

        <nav className="adm__tabs">
          {TABS.map(t => (
            <button key={t.id}
              className={`adm__tab ${tab === t.id ? 'adm__tab--active' : ''}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'users'       && <UsersPanel />}
        {tab === 'providers'   && <ProvidersPanel />}
        {tab === 'submissions' && <SubmissionsPanel />}
      </div>
    </main>
  )
}
