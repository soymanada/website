// src/pages/AdminPanel.jsx
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { isGenericProviderName } from '../utils/validateProviderName'
import { logAudit } from '../lib/auditLog'
import './AdminPanel.css'

const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('es-CL') : '—'
const fmtDateTime = (iso) => iso ? new Date(iso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : '—'

// ── Usuarios ──────────────────────────────────────────────────────────────────
function UsersPanel() {
  const [users,    setUsers]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(null)
  const [inviting, setInviting] = useState(false)
  const [invForm,  setInvForm]  = useState({ email: '', role: 'migrant', tier: 'bronze' })
  const [invState, setInvState] = useState('idle') // idle | sending | ok | error
  const [invError, setInvError] = useState('')
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)
  const PAGE_SIZE = 10

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
        await logAudit({ action: 'invite_user', targetType: 'user', targetName: invForm.email, payload: { role: invForm.role, tier: invForm.tier } })
        setInvState('ok')
        setTimeout(() => { setInviting(false); setInvState('idle'); load() }, 1800)
      } else {
        await logAudit({ action: 'invite_user', targetType: 'user', targetName: invForm.email, payload: { role: invForm.role }, result: 'error', errorMessage: result.error ?? 'Error desconocido' })
        setInvState('error')
        setInvError(result.error ?? 'Error desconocido')
      }
    } catch (e) {
      await logAudit({ action: 'invite_user', targetType: 'user', targetName: invForm.email, result: 'error', errorMessage: e.message ?? 'Error de red' })
      setInvState('error')
      setInvError(e.message ?? 'Error de red')
    }
  }

  const save = async () => {
    const { error } = await supabase.from('profiles')
      .update({ role: editing.role, tier: editing.tier })
      .eq('id', editing.id)
    await logAudit({
      action: 'change_role', targetType: 'user', targetId: editing.id,
      payload: { role: editing.role, tier: editing.tier },
      result: error ? 'error' : 'ok', errorMessage: error?.message,
    })
    setEditing(null)
    load()
  }

  // Filtrado y paginación — busca en email y rol
  const filtered   = users.filter(u => {
    const q = search.toLowerCase()
    return (u.email ?? '').toLowerCase().includes(q) || (u.role ?? '').toLowerCase().includes(q)
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
                  <option value="cob">cob</option>
                  <option value="wolf">wolf</option>
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
        <>
          <div className="adm-users-search">
            <input
              type="search"
              placeholder="Buscar por email o rol…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="adm-users-search__input"
            />
            <span className="adm-users-search__count">
              {filtered.length} de {users.length} usuarios
            </span>
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Email</th><th>Rol</th><th>Registro</th><th></th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={4} className="adm-empty">Sin resultados para "{search}"</td></tr>
                ) : paginated.map(u => (
                  <tr key={u.id}>
                    <td className="adm-td--mono">{u.email ?? '—'}</td>
                    <td><span className={`adm-pill adm-pill--${u.role}`}>{u.role}</span></td>
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

          {totalPages > 1 && (
            <div className="adm-users-pagination">
              <button
                className="adm-btn adm-btn--ghost adm-btn--sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}>
                ← Anterior
              </button>
              <span className="adm-users-pagination__info">Página {page} de {totalPages}</span>
              <button
                className="adm-btn adm-btn--ghost adm-btn--sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}>
                Siguiente →
              </button>
            </div>
          )}
        </>
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
                  <option value="cob">cob</option>
                  <option value="wolf">wolf</option>
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
  'comunidad','remesas','mascotas','planes-telefono',
]

const toSlug = (str) =>
  str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

const EMPTY_PROVIDER = {
  name: '', slug: '', category_slug: 'seguros', service: '', description: '',
  countries: '', languages: '', verified: false, active: true,
  whatsapp: '', instagram: '', website: '',
}

function providerToForm(p) {
  return {
    name:                 p.name                ?? '',
    slug:                 p.slug                ?? '',
    category_slug:        p.category_slug       ?? 'seguros',
    tier:                 p.tier                ?? 'bronze',
    service:              p.service             ?? '',
    service_en:           p.service_en          ?? '',
    service_fr:           p.service_fr          ?? '',
    description:          p.description         ?? '',
    description_en:       p.description_en      ?? '',
    description_fr:       p.description_fr      ?? '',
    countries:            (p.countries  ?? []).join(', '),
    languages:            (p.languages  ?? []).join(', '),
    verified:             p.verified            ?? false,
    active:               p.active              ?? true,
    whatsapp:             p.contact?.whatsapp   ?? p.whatsapp ?? '',
    instagram:            p.contact?.instagram  ?? '',
    website:              p.contact?.website    ?? '',
    benefit:              p.benefit             ?? '',
    avatar_url:           p.avatar_url          ?? '',
    payment_link:         p.payment_link        ?? '',
    calendar_link:        p.calendar_link       ?? '',
    redirect_email:       p.redirect_email      ?? '',
    predefined_responses: (p.predefined_responses ?? []).join('\n'),
    user_id:              p.user_id             ?? '',
  }
}

// ── Proveedores ───────────────────────────────────────────────────────────────
function ProvidersPanel() {
  const [providers, setProviders] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [creating,  setCreating]  = useState(false)
  const [editing,   setEditing]   = useState(null)
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
    const newVal = !p.verified
    const { error } = await supabase.from('providers').update({ verified: newVal }).eq('id', p.id)
    await logAudit({
      action: newVal ? 'verify_provider' : 'unverify_provider',
      targetType: 'provider', targetId: p.id, targetName: p.name,
      result: error ? 'error' : 'ok', errorMessage: error?.message,
    })
    load()
  }

  const toggleActive = async (p) => {
    const newVal = !p.active
    const { error } = await supabase.from('providers').update({ active: newVal }).eq('id', p.id)
    await logAudit({
      action: newVal ? 'activate_provider' : 'deactivate_provider',
      targetType: 'provider', targetId: p.id, targetName: p.name,
      result: error ? 'error' : 'ok', errorMessage: error?.message,
    })
    load()
  }

  const openCreate = () => { setForm(EMPTY_PROVIDER); setCreating(true) }

  const saveNew = async () => {
    if (!SLUG_RE.test(form.slug)) return alert('El slug tiene caracteres no permitidos.')
    setSaving(true)
    const { error } = await supabase.from('providers').insert({
      name:          form.name.trim(),
      slug:          form.slug.trim(),
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
    await logAudit({
      action: 'create_provider', targetType: 'provider', targetName: form.name.trim(),
      payload: { slug: form.slug, category_slug: form.category_slug },
      result: error ? 'error' : 'ok', errorMessage: error?.message,
    })
    if (!error) { setCreating(false); load() }
    else alert('Error al crear: ' + error.message)
  }

  const set    = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const setEd  = (k, v) => setEditing(p => ({ ...p, [k]: v }))

  const openEdit = (p) => setEditing({ id: p.id, ...providerToForm(p) })

  const saveEdit = async () => {
    const { id, ...f } = editing
    if (!f.slug.trim() || !SLUG_RE.test(f.slug.trim())) return
    setSaving(true)
    const { error } = await supabase.from('providers').update({
      name:                 f.name.trim(),
      slug:                 f.slug.trim(),
      category_slug:        f.category_slug,
      service:              f.service.trim(),
      service_en:           f.service_en?.trim()    || null,
      service_fr:           f.service_fr?.trim()    || null,
      description:          f.description.trim(),
      description_en:       f.description_en?.trim()|| null,
      description_fr:       f.description_fr?.trim()|| null,
      countries:            f.countries.split(',').map(s => s.trim()).filter(Boolean),
      languages:            f.languages.split(',').map(s => s.trim()).filter(Boolean),
      verified:             f.verified,
      active:               f.active,
      contact_whatsapp:     f.whatsapp?.trim()      || null,
      contact_instagram:    f.instagram?.trim()     || null,
      contact_website:      f.website?.trim()       || null,
      avatar_url:           f.avatar_url?.trim()    || null,
      payment_link:         f.payment_link?.trim()  || null,
      calendar_link:        f.calendar_link?.trim() || null,
      redirect_email:       f.redirect_email?.trim()|| null,
      predefined_responses: f.predefined_responses?.split('\n').map(s => s.trim()).filter(Boolean) ?? [],
      user_id:              f.user_id?.trim()       || null,
      tier:                 f.tier,
    }).eq('id', id)

    if (!error && f.user_id?.trim()) {
      await supabase.from('profiles')
        .update({ tier: f.tier })
        .eq('id', f.user_id.trim())
    }

    setSaving(false)
    await logAudit({
      action: 'edit_provider', targetType: 'provider', targetId: id, targetName: f.name.trim(),
      payload: { tier: f.tier, verified: f.verified, active: f.active },
      result: error ? 'error' : 'ok', errorMessage: error?.message,
    })
    if (error) alert('Error al guardar: ' + error.message)
    else { setEditing(null); load() }
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
                <input value={form.name} onChange={e => {
                  set('name', e.target.value)
                  set('slug', toSlug(e.target.value))
                }} placeholder="Ej: Objetivo Canadá" />
              </label>
              <label>
                Slug (URL) <span style={{ fontSize: '0.75rem', color: form.slug && !SLUG_RE.test(form.slug) ? '#ef4444' : 'var(--text-300)' }}>
                  {form.slug && !SLUG_RE.test(form.slug) ? '⚠ Solo minúsculas, números y guiones' : form.slug ? `✓ /proveedor/${form.slug}` : ''}
                </span>
                <input
                  required
                  value={form.slug}
                  onChange={e => set('slug', e.target.value)}
                  placeholder="ej: objetivo-canada"
                  style={{ borderColor: form.slug && !SLUG_RE.test(form.slug) ? '#ef4444' : '' }}
                />
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
              <button className="adm-btn adm-btn--primary" onClick={saveNew} disabled={saving || !form.name || !form.slug || !SLUG_RE.test(form.slug)}>
                {saving ? 'Guardando…' : 'Crear proveedor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="adm-overlay" onClick={() => setEditing(null)}>
          <div className="adm-modal adm-modal--xl" onClick={e => e.stopPropagation()}>
            <h3>Editar proveedor — {editing.name}</h3>
            <div className="adm-edit-sections">

              <div className="adm-edit-section">
                <p className="adm-edit-section__title">Identidad</p>
                <div className="adm-form-grid">
                  <label>Nombre / Marca
                    <input value={editing.name} onChange={e => {
                      setEd('name', e.target.value)
                      if (!editing.slug) setEd('slug', toSlug(e.target.value))
                    }} />
                  </label>
                  <label>
                    Slug (URL) <span style={{ fontSize: '0.75rem', color: editing.slug && !SLUG_RE.test(editing.slug) ? '#ef4444' : 'var(--text-300)' }}>
                      {editing.slug && !SLUG_RE.test(editing.slug) ? '⚠ Solo minúsculas, números y guiones' : editing.slug ? `✓ /proveedor/${editing.slug}` : ''}
                    </span>
                    <input
                      required
                      value={editing.slug}
                      onChange={e => setEd('slug', e.target.value)}
                      placeholder="ej: daniela-valenzuela"
                      style={{ borderColor: editing.slug && !SLUG_RE.test(editing.slug) ? '#ef4444' : '' }}
                    />
                  </label>
                  <label>Categoría
                    <select value={editing.category_slug} onChange={e => setEd('category_slug', e.target.value)}>
                      {CATEGORY_SLUGS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                  <label>Tier
                    <select value={editing.tier} onChange={e => setEd('tier', e.target.value)}>
                      <option value="bronze">bronze</option>
                      <option value="cob">cob</option>
                      <option value="wolf">wolf</option>
                    </select>
                  </label>
                  <label>Avatar URL
                    <input value={editing.avatar_url} onChange={e => setEd('avatar_url', e.target.value)} placeholder="https://..." />
                  </label>
                  <label>user_id (auth)
                    <input value={editing.user_id} onChange={e => setEd('user_id', e.target.value)} placeholder="uuid del usuario" />
                  </label>
                  <label className="adm-form-grid--inline">
                    <input type="checkbox" checked={editing.verified} onChange={e => setEd('verified', e.target.checked)} />
                    Verificado
                  </label>
                  <label className="adm-form-grid--inline">
                    <input type="checkbox" checked={editing.active} onChange={e => setEd('active', e.target.checked)} />
                    Activo
                  </label>
                </div>
              </div>

              <div className="adm-edit-section">
                <p className="adm-edit-section__title">Servicio y descripción</p>
                <div className="adm-form-grid">
                  <label>Servicio (ES)
                    <input value={editing.service} onChange={e => setEd('service', e.target.value)} />
                  </label>
                  <label>Servicio (EN)
                    <input value={editing.service_en} onChange={e => setEd('service_en', e.target.value)} />
                  </label>
                  <label>Servicio (FR)
                    <input value={editing.service_fr} onChange={e => setEd('service_fr', e.target.value)} />
                  </label>
                  <label className="adm-form-grid--full">Descripción (ES)
                    <textarea rows={3} value={editing.description} onChange={e => setEd('description', e.target.value)} />
                  </label>
                  <label className="adm-form-grid--full">Descripción (EN)
                    <textarea rows={2} value={editing.description_en} onChange={e => setEd('description_en', e.target.value)} />
                  </label>
                  <label className="adm-form-grid--full">Descripción (FR)
                    <textarea rows={2} value={editing.description_fr} onChange={e => setEd('description_fr', e.target.value)} />
                  </label>
                  <label className="adm-form-grid--full">Beneficio exclusivo
                    <input value={editing.benefit} onChange={e => setEd('benefit', e.target.value)} placeholder="Texto que aparece en la sección de beneficio" />
                  </label>
                </div>
              </div>

              <div className="adm-edit-section">
                <p className="adm-edit-section__title">Ubicación e idiomas</p>
                <div className="adm-form-grid">
                  <label>Países (separados por coma)
                    <input value={editing.countries} onChange={e => setEd('countries', e.target.value)} placeholder="Canadá, Chile" />
                  </label>
                  <label>Idiomas (separados por coma)
                    <input value={editing.languages} onChange={e => setEd('languages', e.target.value)} placeholder="Español, Inglés" />
                  </label>
                </div>
              </div>

              <div className="adm-edit-section">
                <p className="adm-edit-section__title">Contacto</p>
                <div className="adm-form-grid">
                  <label>WhatsApp (con código país)
                    <input value={editing.whatsapp} onChange={e => setEd('whatsapp', e.target.value)} placeholder="16047009832" />
                  </label>
                  <label>Instagram (sin @)
                    <input value={editing.instagram} onChange={e => setEd('instagram', e.target.value)} />
                  </label>
                  <label>Sitio web
                    <input value={editing.website} onChange={e => setEd('website', e.target.value)} placeholder="https://..." />
                  </label>
                </div>
              </div>

              <div className="adm-edit-section">
                <p className="adm-edit-section__title">Herramientas (Silver / Gold)</p>
                <div className="adm-form-grid">
                  <label>Link de pago (Gold)
                    <input value={editing.payment_link} onChange={e => setEd('payment_link', e.target.value)} placeholder="https://wise.com/pay/..." />
                  </label>
                  <label>Link de agenda (Silver+)
                    <input value={editing.calendar_link} onChange={e => setEd('calendar_link', e.target.value)} placeholder="https://calendly.com/..." />
                  </label>
                  <label>Email de redirección (Gold)
                    <input type="email" value={editing.redirect_email} onChange={e => setEd('redirect_email', e.target.value)} />
                  </label>
                  <label className="adm-form-grid--full">Respuestas predefinidas (una por línea, Gold)
                    <textarea rows={3} value={editing.predefined_responses} onChange={e => setEd('predefined_responses', e.target.value)} />
                  </label>
                </div>
              </div>

            </div>

            <div className="adm-modal__actions">
              <button className="adm-btn adm-btn--ghost" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="adm-btn adm-btn--primary" onClick={saveEdit} disabled={saving || !editing.name || !editing.slug || !SLUG_RE.test(editing.slug)}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
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
                    {isGenericProviderName(p.name) && (
                      <span className="badge-generic-name" title="Nombre genérico detectado">⚠ nombre genérico</span>
                    )}
                    <br /><span className="adm-td--sub">{p.service}</span>
                  </td>
                  <td>{p.category_slug ?? p.categorySlug ?? '—'}</td>
                  <td><span className={`adm-dot ${p.verified ? 'adm-dot--on' : 'adm-dot--off'}`} /></td>
                  <td><span className={`adm-dot ${p.active   ? 'adm-dot--on' : 'adm-dot--off'}`} /></td>
                  <td>{fmt(p.created_at)}</td>
                  <td className="adm-td--actions">
                    <button className="adm-btn adm-btn--sm adm-btn--ghost"
                      onClick={() => openEdit(p)}>
                      Editar
                    </button>
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
  'Mascotas': 'mascotas', 'Planes de teléfono': 'planes-telefono',
}

function SubmissionsPanel() {
  const [subs,     setSubs]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [loadErr,  setLoadErr]  = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [acting,   setActing]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadErr(null)
    const { data, error } = await supabase
      .from('provider_applications')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setLoadErr(error.message)
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
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    let userId = null
    if (s.contact_email) {
      const { data } = await supabase
        .rpc('get_user_id_by_email', { lookup_email: s.contact_email.trim() })
      userId = data ?? null
    }

    const { error } = await supabase.from('providers').insert({
      name:          s.business_name,
      slug:          providerSlug,
      category_slug: categorySlug,
      service:       s.service_title ?? '',
      description:   s.description   ?? '',
      countries:     s.countries      ?? [],
      languages:     s.languages      ?? [],
      verified:      false,
      active:        true,
      tier:          'bronze',
      user_id:       userId,
      contact: {
        whatsapp:  waNumber || null,
        instagram: s.instagram || null,
        website:   s.website   || null,
      },
    })
    if (error) {
      await logAudit({ action: 'approve_provider', targetType: 'submission', targetId: s.id, targetName: s.business_name, result: 'error', errorMessage: error.message })
      alert('Error al crear proveedor: ' + error.message)
      setActing(null)
      return
    }

    let roleUpdated = false
    if (s.contact_email) {
      const { data: assigned, error: roleErr } = await supabase
        .rpc('assign_provider_role_by_email', { target_email: s.contact_email.trim() })
      roleUpdated = assigned === true
      if (roleErr) console.error('[assign_provider_role]', roleErr)
    }

    if (!roleUpdated) {
      alert(`⚠️ Proveedor creado pero NO se pudo asignar el rol automáticamente.\n\nEmail: ${s.contact_email || '(sin email)'}\n\nCausa probable: el proveedor todavía no creó su cuenta en SoyManada con ese email.\n\nCuando se registre, ve a la pestaña Usuarios y asigna el rol "provider" manualmente.`)
    }

    await supabase.from('provider_applications').update({ status: 'approved' }).eq('id', s.id)
    await logAudit({ action: 'approve_provider', targetType: 'submission', targetId: s.id, targetName: s.business_name, payload: { providerSlug, userId, roleUpdated } })

    if (s.contact_email) {
      supabase.functions.invoke('send-welcome-email', {
        body: {
          contact_email: s.contact_email,
          business_name: s.business_name,
          contact_name:  s.contact_name ?? s.business_name,
          languages:     s.languages ?? [],
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
    await logAudit({ action: 'reject_provider', targetType: 'submission', targetId: s.id, targetName: s.business_name })
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
      {loadErr && (
        <p style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', fontSize: '0.85rem' }}>
          Error al cargar: {loadErr}
        </p>
      )}
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
                      {isGenericProviderName(s.business_name) && (
                        <span className="badge-generic-name" title="El nombre parece genérico — revisar antes de aprobar">
                          ⚠️ Nombre genérico
                        </span>
                      )}
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
                          <div className="adm-detail__row"><span className="adm-detail__label">Descripción</span><span>{s.description ?? '—'}</span></div>
                          <div className="adm-detail__row"><span className="adm-detail__label">Modalidad</span><span>{s.modality ?? '—'}</span></div>
                          <div className="adm-detail__row"><span className="adm-detail__label">Países</span><span>{(s.countries ?? []).join(', ') || '—'}</span></div>
                          <div className="adm-detail__row"><span className="adm-detail__label">Idiomas</span><span>{(s.languages ?? []).join(', ') || '—'}</span></div>
                          <div className="adm-detail__row"><span className="adm-detail__label">WhatsApp</span><span>{s.whatsapp ?? '—'}</span></div>
                          <div className="adm-detail__row"><span className="adm-detail__label">Instagram</span><span>{s.instagram ?? '—'}</span></div>
                          <div className="adm-detail__row"><span className="adm-detail__label">Sitio web</span><span>{s.website ?? '—'}</span></div>
                          <div className="adm-detail__row"><span className="adm-detail__label">Perfil verificación</span><a href={s.profile_link} target="_blank" rel="noopener noreferrer">{s.profile_link ?? '—'}</a></div>
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

// ── Fotos de la comunidad ─────────────────────────────────────────────────────
function PhotosPanel() {
  const [photos,  setPhotos]  = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('community_photos')
      .select('*')
      .order('submitted_at', { ascending: false })
    setPhotos(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const setStatus = async (id, status) => {
    const { error } = await supabase
      .from('community_photos')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', id)
    await logAudit({
      action: status === 'approved' ? 'approve_photo' : 'reject_photo',
      targetType: 'photo', targetId: id,
      result: error ? 'error' : 'ok', errorMessage: error?.message,
    })
    load()
  }

  return (
    <div className="adm-section">
      <div className="adm-section__head">
        <h2 className="adm-section__title">Fotos de la comunidad</h2>
        <p className="adm-section__sub">Aprueba o rechaza las fotos enviadas por los usuarios.</p>
      </div>
      {loading ? (
        <p className="adm-section__empty">Cargando…</p>
      ) : photos.length === 0 ? (
        <p className="adm-section__empty">No hay fotos pendientes.</p>
      ) : (
        <div className="adm-photos">
          {photos.map(p => (
            <div key={p.id} className={`adm-photo-card adm-photo-card--${p.status}`}>
              <img src={p.public_url} alt={p.caption} className="adm-photo-card__img" />
              <div className="adm-photo-card__info">
                <p className="adm-photo-card__caption"><strong>{p.caption}</strong></p>
                {p.city           && <p className="adm-photo-card__meta">📍 {p.city}</p>}
                {p.submitter_name && <p className="adm-photo-card__meta">👤 {p.submitter_name}</p>}
                <p className="adm-photo-card__meta">{fmt(p.submitted_at)}</p>
                <span className={`adm-photo-card__badge adm-photo-card__badge--${p.status}`}>
                  {p.status === 'pending' ? 'Pendiente' : p.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                </span>
              </div>
              {p.status === 'pending' && (
                <div className="adm-photo-card__actions">
                  <button className="btn btn-primary btn-sm" onClick={() => setStatus(p.id, 'approved')}>✓ Aprobar</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setStatus(p.id, 'rejected')}>✕ Rechazar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Logs ──────────────────────────────────────────────────────────────────────
const LOG_RANGES = [
  { label: 'Últimos 3 días', days: 3 },
  { label: 'Últimos 7 días', days: 7 },
  { label: 'Últimos 30 días', days: 30 },
]

function LogsPanel() {
  const [subTab,  setSubTab]  = useState('activity')
  const [rows,    setRows]    = useState([])
  const [range,   setRange]   = useState(3)
  const [search,  setSearch]  = useState('')
  const [page,    setPage]    = useState(0)
  const [provMap, setProvMap] = useState({})
  const PAGE_SIZE = 50
  const [errors,  setErrors]  = useState([])
  const [audit,   setAudit]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('providers').select('id, name').then(({ data }) => {
      const map = {}
      ;(data ?? []).forEach(p => { map[p.id] = p.name })
      setProvMap(map)
    })
  }, [])

  const loadActivity = useCallback(async () => {
    const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('events')
      .select('id, provider_id, event_type, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(2000)
    setRows(data ?? [])
    setPage(0)
  }, [range])

  const loadErrors = useCallback(async () => {
    const { data } = await supabase.from('system_error_logs').select('*').order('created_at', { ascending: false }).limit(100)
    setErrors(data ?? [])
  }, [])

  const loadAudit = useCallback(async () => {
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100)
    setAudit(data ?? [])
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([loadActivity(), loadErrors(), loadAudit()]).finally(() => setLoading(false))
  }, [loadActivity, loadErrors, loadAudit])

  const markResolved = async (id) => {
    await supabase.from('system_error_logs').update({ resolved: true }).eq('id', id)
    loadErrors()
  }

  const filtered   = rows.filter(r => {
    if (!search.trim()) return true
    const name = provMap[r.provider_id] ?? r.provider_id ?? ''
    return name.toLowerCase().includes(search.toLowerCase())
  })
  const totalPages     = Math.ceil(filtered.length / PAGE_SIZE)
  const paged          = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const summary        = Object.entries(
    rows.reduce((acc, r) => { acc[r.provider_id] = (acc[r.provider_id] ?? 0) + 1; return acc }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const unresolvedCount = errors.filter(e => !e.resolved).length

  return (
    <div className="adm-section">
      <div className="adm-section__head">
        <h2 className="adm-section__title">Logs</h2>
      </div>
      <div className="adm-subtabs">
        <button className={`adm-subtab ${subTab === 'activity' ? 'adm-subtab--active' : ''}`} onClick={() => setSubTab('activity')}>
          📊 Actividad <span className="adm-badge">{filtered.length}</span>
        </button>
        <button className={`adm-subtab ${subTab === 'errors' ? 'adm-subtab--active' : ''}`} onClick={() => setSubTab('errors')}>
          ⚠️ Errores {unresolvedCount > 0 && <span className="adm-badge adm-badge--red">{unresolvedCount}</span>}
        </button>
        <button className={`adm-subtab ${subTab === 'audit' ? 'adm-subtab--active' : ''}`} onClick={() => setSubTab('audit')}>
          🛡 Acciones admin <span className="adm-badge">{audit.length}</span>
        </button>
      </div>
      {loading && <p className="adm-loading">Cargando…</p>}
      {!loading && subTab === 'activity' && (
        <>
          <div className="adm-logs__controls">
            <div className="adm-logs__range">
              {LOG_RANGES.map(r => (
                <button key={r.days} className={`adm-btn adm-btn--sm ${range === r.days ? 'adm-btn--primary' : 'adm-btn--ghost'}`} onClick={() => setRange(r.days)}>{r.label}</button>
              ))}
            </div>
            <input className="adm-logs__search" placeholder="Filtrar por proveedor…" value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
            <button className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => { setLoading(true); loadActivity().finally(() => setLoading(false)) }}>↺ Refrescar</button>
          </div>
          {summary.length > 0 && (
            <div className="adm-logs__summary">
              <p className="adm-edit-section__title">Top proveedores por vistas</p>
              <div className="adm-logs__summary-list">
                {summary.map(([pid, count]) => (
                  <div key={pid} className="adm-logs__summary-item">
                    <span className="adm-logs__summary-name">{provMap[pid] ?? <span className="adm-td--mono" style={{ fontSize: '0.75rem' }}>{pid.slice(0, 8)}…</span>}</span>
                    <span className="adm-badge">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {filtered.length === 0 ? <p className="adm-empty">No hay eventos en este período.</p> : (
            <>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead><tr><th>Fecha y hora</th><th>Proveedor</th><th>Tipo</th></tr></thead>
                  <tbody>
                    {paged.map(r => (
                      <tr key={r.id}>
                        <td className="adm-td--mono">{fmtDateTime(r.created_at)}</td>
                        <td>{provMap[r.provider_id] ? <strong>{provMap[r.provider_id]}</strong> : <span className="adm-td--mono adm-td--sub">{r.provider_id?.slice(0, 8)}…</span>}</td>
                        <td><span className="adm-pill adm-pill--provider">{r.event_type}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="adm-logs__pagination">
                  <button className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>← Anterior</button>
                  <span className="adm-logs__page-info">Página {page + 1} de {totalPages}</span>
                  <button className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>Siguiente →</button>
                </div>
              )}
            </>
          )}
        </>
      )}
      {!loading && subTab === 'errors' && (
        errors.length === 0 ? <p className="adm-empty">No hay errores registrados. ✓</p> : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Fuente</th><th>Función</th><th>Error</th><th>Fecha</th><th></th></tr></thead>
              <tbody>
                {errors.map(e => (
                  <tr key={e.id} className={e.resolved ? 'adm-tr--resolved' : ''}>
                    <td><span className="adm-pill">{e.source ?? '—'}</span></td>
                    <td className="adm-td--mono">{e.function_name ?? '—'}</td>
                    <td style={{ maxWidth: 320, wordBreak: 'break-word' }}><span className="adm-td--err">{e.error_message}</span>{e.error_code && <span className="adm-td--sub"> [{e.error_code}]</span>}</td>
                    <td>{fmt(e.created_at)}</td>
                    <td>{!e.resolved ? <button className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => markResolved(e.id)}>Marcar resuelto</button> : <span className="adm-td--sub">✓ resuelto</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
      {!loading && subTab === 'audit' && (
        audit.length === 0 ? <p className="adm-empty">No hay acciones registradas aún.</p> : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Admin</th><th>Acción</th><th>Objetivo</th><th>Resultado</th><th>Fecha</th></tr></thead>
              <tbody>
                {audit.map(a => (
                  <tr key={a.id}>
                    <td className="adm-td--mono">{a.admin_email}</td>
                    <td><span className="adm-pill">{a.action}</span></td>
                    <td>{a.target_name && <strong>{a.target_name}</strong>}{a.target_type && <span className="adm-td--sub"> ({a.target_type})</span>}</td>
                    <td><span className={`adm-dot adm-dot--${a.result === 'ok' ? 'on' : 'off'}`} />{a.result !== 'ok' && a.error_message && <span className="adm-td--sub"> {a.error_message}</span>}</td>
                    <td>{fmt(a.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}

// ── Panel principal ───────────────────────────────────────────────────────────
export default function AdminPanel() {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('users')

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  const TABS = [
    { id: 'users',       label: t('admin.tabs.users')       },
    { id: 'providers',   label: t('admin.tabs.providers')   },
    { id: 'submissions', label: t('admin.tabs.submissions') },
    { id: 'photos',      label: t('admin.tabs.photos')      },
    { id: 'logs',        label: '📋 Logs'                   },
  ]

  useEffect(() => {
    document.title = 'Admin | SoyManada'
    return () => { document.title = 'SoyManada – Directorio para la comunidad migrante' }
  }, [])

  return (
    <main className="adm">
      <div className="container">
        <div className="adm__header">
          <div>
            <h1 className="d-lg adm__title">{t('admin.title')}</h1>
            <p className="t-sm adm__sub">{t('admin.subtitle')}</p>
          </div>
          <button className="adm-btn adm-btn--ghost" onClick={handleSignOut}>Cerrar sesión</button>
        </div>
        <nav className="adm__tabs">
          {TABS.map(tab_item => (
            <button key={tab_item.id}
              className={`adm__tab ${tab === tab_item.id ? 'adm__tab--active' : ''}`}
              onClick={() => setTab(tab_item.id)}>
              {tab_item.label}
            </button>
          ))}
        </nav>
        {tab === 'users'       && <UsersPanel />}
        {tab === 'providers'   && <ProvidersPanel />}
        {tab === 'submissions' && <SubmissionsPanel />}
        {tab === 'photos'      && <PhotosPanel />}
        {tab === 'logs'        && <LogsPanel />}
      </div>
    </main>
  )
}
