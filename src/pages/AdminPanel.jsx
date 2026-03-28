// src/pages/AdminPanel.jsx
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import './AdminPanel.css'

const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('es-CL') : '—'

// ── Usuarios ──────────────────────────────────────────────────────────────────
function UsersPanel() {
  const [users,    setUsers]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(null)
  const [inviting, setInviting] = useState(false)
  const [invForm,  setInvForm]  = useState({ email: '', role: 'migrant', tier: 'bronze' })
  const [invState, setInvState] = useState('idle') // idle | sending | ok | error
  const [invError, setInvError] = useState('')

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

  const sendInvite = async () => {
    setInvState('sending')
    setInvError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        'https://omlpstrmlxeurrqjbear.supabase.co/functions/v1/invite-user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            email: invForm.email.trim(),
            role:  invForm.role,
            tier:  invForm.tier,
          }),
        }
      )
      const result = await res.json()
      if (result.ok) {
        setInvState('ok')
        setTimeout(() => { setInviting(false); setInvState('idle'); load() }, 1800)
      } else {
        setInvState('error')
        setInvError(result.error ?? 'Error desconocido')
      }
    } catch (e) {
      setInvState('error')
      setInvError(e.message ?? 'Error de red')
    }
  }

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
        <button className="adm-btn adm-btn--primary" onClick={() => { setInviting(true); setInvState('idle'); setInvForm({ email: '', role: 'migrant', tier: 'bronze' }) }}>
          + Invitar usuario
        </button>
      </div>

      {inviting && (
        <div className="adm-overlay" onClick={() => setInviting(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h3>Invitar usuario</h3>
            <p className="adm-modal__hint">Se enviará un email de invitación. El usuario elige su contraseña al hacer clic.</p>
            <label>Email
              <input
                type="email"
                value={invForm.email}
                onChange={e => setInvForm(p => ({ ...p, email: e.target.value }))}
                placeholder="usuario@email.com"
                disabled={invState === 'sending' || invState === 'ok'}
              />
            </label>
            <label>Rol
              <select value={invForm.role} onChange={e => setInvForm(p => ({ ...p, role: e.target.value }))}>
                <option value="migrant">migrant</option>
                <option value="provider">provider</option>
                <option value="admin">admin</option>
              </select>
            </label>
            {invForm.role !== 'migrant' && (
              <label>Tier
                <select value={invForm.tier} onChange={e => setInvForm(p => ({ ...p, tier: e.target.value }))}>
                  <option value="bronze">bronze</option>
                  <option value="silver">silver</option>
                  <option value="gold">gold</option>
                </select>
              </label>
            )}
            {invState === 'ok'    && <p className="adm-modal__ok">✓ Invitación enviada</p>}
            {invState === 'error' && <p className="adm-modal__err">Error: {invError}</p>}
            <div className="adm-modal__actions">
              <button className="adm-btn adm-btn--ghost" onClick={() => setInviting(false)}>Cancelar</button>
              <button
                className="adm-btn adm-btn--primary"
                onClick={sendInvite}
                disabled={!invForm.email || invState === 'sending' || invState === 'ok'}>
                {invState === 'sending' ? 'Enviando…' : 'Enviar invitación'}
              </button>
            </div>
          </div>
        </div>
      )}

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
            {editing.role !== 'migrant' && (
              <label>Tier
                <select value={editing.tier}
                  onChange={e => setEditing(p => ({ ...p, tier: e.target.value }))}>
                  <option value="bronze">bronze</option>
                  <option value="silver">silver</option>
                  <option value="gold">gold</option>
                </select>
              </label>
            )}
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

const CATEGORY_SLUGS = [
  'seguros','migracion','traducciones','trabajo',
  'alojamiento','idiomas','banca','salud-mental','taxes','antes-de-viajar',
]

const EMPTY_PROVIDER = {
  name: '', category_slug: 'seguros', service: '', description: '',
  countries: '', languages: '', verified: false, active: true,
  whatsapp: '', instagram: '', website: '',
}

// ── Proveedores ───────────────────────────────────────────────────────────────
function ProvidersPanel() {
  const [providers, setProviders] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [creating,  setCreating]  = useState(false)
  const [form,      setForm]      = useState(EMPTY_PROVIDER)
  const [saving,    setSaving]    = useState(false)

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
    await supabase.from('providers')
      .update({ verified: !p.verified })
      .eq('id', p.id)
    load()
  }

  const toggleActive = async (p) => {
    await supabase.from('providers')
      .update({ active: !p.active })
      .eq('id', p.id)
    load()
  }

  const openCreate = () => { setForm(EMPTY_PROVIDER); setCreating(true) }

  const saveNew = async () => {
    setSaving(true)
    const { error } = await supabase.from('providers').insert({
      name:          form.name.trim(),
      category_slug: form.category_slug,
      service:       form.service.trim(),
      description:   form.description.trim(),
      countries:     form.countries.split(',').map(s => s.trim()).filter(Boolean),
      languages:     form.languages.split(',').map(s => s.trim()).filter(Boolean),
      verified:      form.verified,
      active:        form.active,
      contact: {
        whatsapp:  form.whatsapp.trim()  || null,
        instagram: form.instagram.trim() || null,
        website:   form.website.trim()   || null,
      },
    })
    setSaving(false)
    if (!error) { setCreating(false); load() }
    else alert('Error al crear: ' + error.message)
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="adm-section">
      <div className="adm-section__head">
        <h2 className="adm-section__title">
          Proveedores <span className="adm-badge">{providers.length}</span>
          <span className="adm-badge adm-badge--green">
            {providers.filter(p => p.verified).length} verificados
          </span>
        </h2>
        <button className="adm-btn adm-btn--primary" onClick={openCreate}>
          + Crear proveedor
        </button>
      </div>

      {creating && (
        <div className="adm-overlay" onClick={() => setCreating(false)}>
          <div className="adm-modal adm-modal--lg" onClick={e => e.stopPropagation()}>
            <h3>Nuevo proveedor</h3>
            <div className="adm-form-grid">
              <label>Nombre / Marca
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Objetivo Canadá" />
              </label>
              <label>Categoría
                <select value={form.category_slug} onChange={e => set('category_slug', e.target.value)}>
                  {CATEGORY_SLUGS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label>Servicio (5 palabras)
                <input value={form.service} onChange={e => set('service', e.target.value)} placeholder="Ej: Asesoría migratoria a Canadá" />
              </label>
              <label>WhatsApp (con código país)
                <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="16047009832" />
              </label>
              <label className="adm-form-grid--full">Descripción
                <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
              </label>
              <label>Países (separados por coma)
                <input value={form.countries} onChange={e => set('countries', e.target.value)} placeholder="Canadá, Chile" />
              </label>
              <label>Idiomas (separados por coma)
                <input value={form.languages} onChange={e => set('languages', e.target.value)} placeholder="Español, Inglés" />
              </label>
              <label>Instagram
                <input value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="usuario_sin_@" />
              </label>
              <label>Sitio web
                <input value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." />
              </label>
              <label className="adm-form-grid--inline">
                <input type="checkbox" checked={form.verified} onChange={e => set('verified', e.target.checked)} />
                Verificado al crear
              </label>
            </div>
            <div className="adm-modal__actions">
              <button className="adm-btn adm-btn--ghost" onClick={() => setCreating(false)}>Cancelar</button>
              <button className="adm-btn adm-btn--primary" onClick={saveNew} disabled={saving || !form.name}>
                {saving ? 'Guardando…' : 'Crear proveedor'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <td className="adm-td--actions">
                    <button
                      className={`adm-btn adm-btn--sm ${p.verified ? 'adm-btn--ghost' : 'adm-btn--primary'}`}
                      onClick={() => toggleVerified(p)}>
                      {p.verified ? 'Desverificar' : 'Verificar'}
                    </button>
                    <button
                      className={`adm-btn adm-btn--sm ${p.active ? 'adm-btn--danger' : 'adm-btn--success'}`}
                      onClick={() => toggleActive(p)}>
                      {p.active ? 'Desactivar' : 'Activar'}
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
const CAT_SLUG = {
  'Seguros': 'seguros', 'Asesoría migratoria': 'migracion',
  'Traducciones': 'traducciones', 'Trabajo': 'trabajo',
  'Alojamiento': 'alojamiento', 'Idiomas': 'idiomas',
  'Banca': 'banca', 'Bienestar': 'salud-mental',
  'Taxes': 'taxes', 'Antes de viajar': 'antes-de-viajar',
}

function SubmissionsPanel() {
  const [subs,     setSubs]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [acting,   setActing]   = useState(null) // id being processed

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('provider_applications')
      .select('*')
      .order('created_at', { ascending: false })
    setSubs(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const pending = subs.filter(s => !s.status || s.status === 'pending').length

  const approve = async (s) => {
    if (!window.confirm(`¿Aprobar y crear proveedor para "${s.business_name}"?`)) return
    setActing(s.id)
    const categorySlug = CAT_SLUG[s.categories?.[0]] ?? 'seguros'
    const waNumber     = (s.whatsapp ?? '').replace(/^\+/, '')
    const providerSlug = s.business_name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const { error } = await supabase.from('providers').insert({
      name:          s.business_name,
      slug:          providerSlug,
      category_slug: categorySlug,
      service:       s.service_title ?? '',
      description:   s.description   ?? '',
      countries:     s.countries      ?? [],
      languages:     s.languages      ?? [],
      verified:      false,
      active:        false,
      tier:          'bronze',
      contact: {
        whatsapp:  waNumber || null,
        instagram: s.instagram || null,
        website:   s.website   || null,
      },
    })
    if (error) { alert('Error al crear proveedor: ' + error.message); setActing(null); return }

    await supabase.from('provider_applications').update({ status: 'approved' }).eq('id', s.id)

    // Notificar al proveedor por email (fire-and-forget)
    if (s.contact_email) {
      supabase.functions.invoke('send-welcome-email', {
        body: {
          contact_email: s.contact_email,
          business_name: s.business_name,
          contact_name:  s.contact_name ?? s.business_name,
        },
      }).catch(console.error)
    }

    setActing(null)
    load()
  }

  const reject = async (s) => {
    if (!window.confirm(`¿Rechazar la solicitud de "${s.business_name}"?`)) return
    setActing(s.id)
    await supabase.from('provider_applications').update({ status: 'rejected' }).eq('id', s.id)
    setActing(null)
    load()
  }

  return (
    <div className="adm-section">
      <div className="adm-section__head">
        <h2 className="adm-section__title">
          Postulaciones <span className="adm-badge">{pending} pendientes</span>
        </h2>
      </div>

      {loading ? <p className="adm-loading">Cargando...</p>
        : subs.length === 0 ? <p className="adm-empty">No hay postulaciones.</p>
        : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Negocio</th><th>Categorías</th><th>Estado</th>
                <th>Fecha</th><th>Contacto interno</th><th></th>
              </tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <>
                  <tr key={s.id} className={expanded === s.id ? 'adm-tr--expanded' : ''}>
                    <td>
                      <strong>{s.business_name ?? '—'}</strong>
                      <br /><span className="adm-td--sub">{s.service_title ?? ''}</span>
                    </td>
                    <td className="adm-td--sub">{(s.categories ?? []).join(', ') || '—'}</td>
                    <td>
                      <span className={`adm-pill adm-pill--${s.status ?? 'pending'}`}>
                        {s.status ?? 'pending'}
                      </span>
                    </td>
                    <td>{fmt(s.created_at)}</td>
                    <td className="adm-td--mono">{s.contact_name ?? '—'}<br /><span className="adm-td--sub">{s.contact_email ?? ''}</span></td>
                    <td className="adm-td--actions">
                      <button className="adm-btn adm-btn--sm adm-btn--ghost"
                        onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                        {expanded === s.id ? 'Cerrar' : 'Ver'}
                      </button>
                      {(!s.status || s.status === 'pending') && (
                        <>
                          <button className="adm-btn adm-btn--sm adm-btn--success"
                            onClick={() => approve(s)} disabled={acting === s.id}>
                            {acting === s.id ? '…' : 'Aprobar'}
                          </button>
                          <button className="adm-btn adm-btn--sm adm-btn--danger"
                            onClick={() => reject(s)} disabled={acting === s.id}>
                            Rechazar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                  {expanded === s.id && (
                    <tr key={`${s.id}-detail`} className="adm-tr--detail">
                      <td colSpan={6}>
                        <div className="adm-detail">
                          <div className="adm-detail__row">
                            <span className="adm-detail__label">Descripción</span>
                            <span>{s.description ?? '—'}</span>
                          </div>
                          <div className="adm-detail__row">
                            <span className="adm-detail__label">Modalidad</span>
                            <span>{s.modality ?? '—'}</span>
                          </div>
                          <div className="adm-detail__row">
                            <span className="adm-detail__label">Países</span>
                            <span>{(s.countries ?? []).join(', ') || '—'}</span>
                          </div>
                          <div className="adm-detail__row">
                            <span className="adm-detail__label">Idiomas</span>
                            <span>{(s.languages ?? []).join(', ') || '—'}</span>
                          </div>
                          <div className="adm-detail__row">
                            <span className="adm-detail__label">WhatsApp</span>
                            <span>{s.whatsapp ?? '—'}</span>
                          </div>
                          <div className="adm-detail__row">
                            <span className="adm-detail__label">Instagram</span>
                            <span>{s.instagram ?? '—'}</span>
                          </div>
                          <div className="adm-detail__row">
                            <span className="adm-detail__label">Sitio web</span>
                            <span>{s.website ?? '—'}</span>
                          </div>
                          <div className="adm-detail__row">
                            <span className="adm-detail__label">Perfil verificación</span>
                            <a href={s.profile_link} target="_blank" rel="noopener noreferrer">{s.profile_link ?? '—'}</a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
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
