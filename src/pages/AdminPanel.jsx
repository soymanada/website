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

  // Filtrado y paginación
  const filtered   = users.filter(u => (u.email ?? '').toLowerCase().includes(search.toLowerCase()))
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
              placeholder="Buscar por email…"
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
                  <th>Email</th><th>Rol</th><th>Tier</th><th>Registro</th><th></th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={5} className="adm-empty">Sin resultados para "{search}"</td></tr>
                ) : paginated.map(u => (
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
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

const EMPTY_PROVIDER = {
  name: '', slug: '', category_slug: 'seguros', service: '', description: '',
  countries: '', languages: '', verified: false, active: true,
  whatsapp: '', instagram: '', website: '',
}

// Flatten a provider record into a flat form object
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
  const [editing,   setEditing]   = useState(null)   // { id, ...form }
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
                    {p.tier && <span className={`adm-pill adm-pill--${p.tier}`} style={{ marginLeft: '6px', fontSize: '0.7rem' }}>{p.tier}</span>}
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
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
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
        .rpc('set_user_role_by_email', { lookup_email: s.contact_email.trim(), new_role: 'provider' })
      roleUpdated = !roleErr
    }

    await supabase.from('provider_applications')
      .update({ status: 'approved' })
      .eq('id', s.id)

    await logAudit({
      action: 'approve_provider', targetType: 'submission', targetId: s.id, targetName: s.business_name,
      payload: { categorySlug, providerSlug, roleUpdated },
      result: 'ok',
    })
    setActing(null)
    load()
  }

  const reject = async (s) => {
    if (!window.confirm(`¿Rechazar la solicitud de "${s.business_name}"?`)) return
    setActing(s.id)
    const { error } = await supabase.from('provider_applications')
      .update({ status: 'rejected' })
      .eq('id', s.id)
    await logAudit({
      action: 'reject_provider', targetType: 'submission', targetId: s.id, targetName: s.business_name,
      result: error ? 'error' : 'ok', errorMessage: error?.message,
    })
    setActing(null)
    load()
  }

  return (
    <div className="adm-section">
      <div className="adm-section__head">
        <h2 className="adm-section__title">
          Solicitudes
          <span className="adm-badge">{subs.length}</span>
          {pending > 0 && <span className="adm-badge adm-badge--red">{pending} pendientes</span>}
        </h2>
      </div>
      {loadErr && <p style={{ color: 'red' }}>Error al cargar: {loadErr}</p>}
      {loading ? <p className="adm-loading">Cargando...</p> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Negocio</th><th>Email contacto</th><th>Categorías</th>
                <th>Estado</th><th>Fecha</th><th></th>
              </tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <>
                  <tr key={s.id}
                    className={expanded === s.id ? 'adm-tr--expanded' : ''}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                    <td><strong>{s.business_name}</strong></td>
                    <td className="adm-td--mono">{s.contact_email ?? '—'}</td>
                    <td>{(s.categories ?? []).join(', ') || '—'}</td>
                    <td><span className={`adm-pill adm-pill--${s.status ?? 'pending'}`}>{s.status ?? 'pending'}</span></td>
                    <td>{fmt(s.created_at)}</td>
                    <td className="adm-td--actions" onClick={e => e.stopPropagation()}>
                      {(!s.status || s.status === 'pending') && (
                        <>
                          <button className="adm-btn adm-btn--sm adm-btn--primary"
                            disabled={acting === s.id}
                            onClick={() => approve(s)}>
                            {acting === s.id ? '…' : 'Aprobar'}
                          </button>
                          <button className="adm-btn adm-btn--sm adm-btn--danger"
                            disabled={acting === s.id}
                            onClick={() => reject(s)}>
                            Rechazar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                  {expanded === s.id && (
                    <tr className="adm-tr--detail">
                      <td colSpan={6}>
                        <div className="adm-detail">
                          {[
                            ['WhatsApp', s.whatsapp],
                            ['Instagram', s.instagram],
                            ['Sitio web', s.website],
                            ['Países', (s.countries ?? []).join(', ')],
                            ['Idiomas', (s.languages ?? []).join(', ')],
                            ['Título servicio', s.service_title],
                            ['Descripción', s.description],
                            ['Experiencia', s.experience],
                            ['Precio ref.', s.price_range],
                            ['Cómo conoció', s.referral_source],
                          ].map(([label, val]) => val ? (
                            <div className="adm-detail__row" key={label}>
                              <span className="adm-detail__label">{label}</span>
                              <span>{val}</span>
                            </div>
                          ) : null)}
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

// ── Logs Panel ────────────────────────────────────────────────────────────────
function LogsPanel() {
  const TABS = [
    { key: 'audit',  label: 'Actividad' },
    { key: 'errors', label: 'Errores' },
  ]
  const [tab, setTab] = useState('audit')

  // ── Audit log state ──────────────────────────────────────────────────────
  const [auditRows, setAuditRows]   = useState([])
  const [auditLoad, setAuditLoad]   = useState(true)
  const [auditErr,  setAuditErr]    = useState(null)
  const [auditQ,    setAuditQ]      = useState('')
  const [auditPage, setAuditPage]   = useState(1)
  const [auditFrom, setAuditFrom]   = useState('')
  const [auditTo,   setAuditTo]     = useState('')
  const AUDIT_PAGE = 30

  const loadAudit = useCallback(async () => {
    setAuditLoad(true); setAuditErr(null)
    let q = supabase.from('audit_log')
      .select('id, action, actor_email, target_type, target_name, result, error_message, created_at')
      .order('created_at', { ascending: false })
      .limit(500)
    if (auditFrom) q = q.gte('created_at', auditFrom)
    if (auditTo)   q = q.lte('created_at', auditTo + 'T23:59:59')
    const { data, error } = await q
    if (error) setAuditErr(error.message)
    setAuditRows(data ?? [])
    setAuditLoad(false)
  }, [auditFrom, auditTo])

  useEffect(() => { if (tab === 'audit') loadAudit() }, [tab, loadAudit])

  const filteredAudit = auditRows.filter(r =>
    !auditQ ||
    (r.action ?? '').includes(auditQ) ||
    (r.actor_email ?? '').includes(auditQ) ||
    (r.target_name ?? '').includes(auditQ)
  )
  const auditPages  = Math.max(1, Math.ceil(filteredAudit.length / AUDIT_PAGE))
  const auditSlice  = filteredAudit.slice((auditPage - 1) * AUDIT_PAGE, auditPage * AUDIT_PAGE)

  const auditSummary = filteredAudit.reduce((acc, r) => {
    const k = r.action ?? 'unknown'
    acc[k] = (acc[k] ?? 0) + 1
    return acc
  }, {})
  const topActions = Object.entries(auditSummary).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // ── System errors state ──────────────────────────────────────────────────
  const [errRows,  setErrRows]  = useState([])
  const [errLoad,  setErrLoad]  = useState(true)
  const [errErr,   setErrErr]   = useState(null)
  const [errQ,     setErrQ]     = useState('')
  const [errPage,  setErrPage]  = useState(1)
  const ERR_PAGE = 20

  const loadErrors = useCallback(async () => {
    setErrLoad(true); setErrErr(null)
    const { data, error } = await supabase
      .from('system_errors')
      .select('id, service, error_code, message, context, resolved, created_at')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) setErrErr(error.message)
    setErrRows(data ?? [])
    setErrLoad(false)
  }, [])

  useEffect(() => { if (tab === 'errors') loadErrors() }, [tab, loadErrors])

  const toggleResolved = async (row) => {
    await supabase.from('system_errors').update({ resolved: !row.resolved }).eq('id', row.id)
    loadErrors()
  }

  const filteredErr = errRows.filter(r =>
    !errQ ||
    (r.service ?? '').includes(errQ) ||
    (r.error_code ?? '').includes(errQ) ||
    (r.message ?? '').includes(errQ)
  )
  const errPages = Math.max(1, Math.ceil(filteredErr.length / ERR_PAGE))
  const errSlice = filteredErr.slice((errPage - 1) * ERR_PAGE, errPage * ERR_PAGE)
  const unresolvedCount = errRows.filter(r => !r.resolved).length

  return (
    <div className="adm-section">
      <div className="adm-subtabs">
        {TABS.map(t => (
          <button key={t.key}
            className={`adm-subtab${tab === t.key ? ' adm-subtab--active' : ''}`}
            onClick={() => setTab(t.key)}>
            {t.label}
            {t.key === 'errors' && unresolvedCount > 0 &&
              <span className="adm-badge adm-badge--red">{unresolvedCount}</span>}
          </button>
        ))}
      </div>

      {tab === 'audit' && (
        <>
          <div className="adm-logs__controls">
            <div className="adm-logs__range">
              <input type="date" value={auditFrom} onChange={e => { setAuditFrom(e.target.value); setAuditPage(1) }}
                className="adm-btn adm-btn--ghost" style={{ fontSize: '0.82rem', padding: '5px 10px' }} />
              <input type="date" value={auditTo} onChange={e => { setAuditTo(e.target.value); setAuditPage(1) }}
                className="adm-btn adm-btn--ghost" style={{ fontSize: '0.82rem', padding: '5px 10px' }} />
            </div>
            <input className="adm-logs__search" placeholder="Buscar acción, email, nombre…"
              value={auditQ} onChange={e => { setAuditQ(e.target.value); setAuditPage(1) }} />
            <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={loadAudit}>↺ Actualizar</button>
          </div>

          {topActions.length > 0 && (
            <div className="adm-logs__summary">
              <strong style={{ fontSize: '0.8rem', color: 'var(--text-500)' }}>TOP ACCIONES</strong>
              <div className="adm-logs__summary-list">
                {topActions.map(([action, count]) => (
                  <div key={action} className="adm-logs__summary-item">
                    <span className="adm-logs__summary-name">{action}</span>
                    <span className="adm-badge">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {auditErr && <p style={{ color: 'red' }}>Error: {auditErr}</p>}
          {auditLoad ? <p className="adm-loading">Cargando…</p> : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead><tr>
                  <th>Fecha</th><th>Acción</th><th>Actor</th><th>Target</th><th>Resultado</th>
                </tr></thead>
                <tbody>
                  {auditSlice.map(r => (
                    <tr key={r.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{fmtDateTime(r.created_at)}</td>
                      <td><code style={{ fontSize: '0.78rem' }}>{r.action}</code></td>
                      <td className="adm-td--mono">{r.actor_email ?? '—'}</td>
                      <td>{r.target_name ?? r.target_type ?? '—'}</td>
                      <td>
                        <span className={`adm-pill adm-pill--${r.result === 'error' ? 'rejected' : 'approved'}`}>
                          {r.result ?? 'ok'}
                        </span>
                        {r.result === 'error' && r.error_message &&
                          <span className="adm-td--err" title={r.error_message}> {r.error_message.slice(0, 40)}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {auditPages > 1 && (
            <div className="adm-logs__pagination">
              <button className="adm-btn adm-btn--ghost adm-btn--sm"
                onClick={() => setAuditPage(p => Math.max(1, p - 1))} disabled={auditPage === 1}>← Anterior</button>
              <span className="adm-logs__page-info">Página {auditPage} de {auditPages} · {filteredAudit.length} registros</span>
              <button className="adm-btn adm-btn--ghost adm-btn--sm"
                onClick={() => setAuditPage(p => Math.min(auditPages, p + 1))} disabled={auditPage === auditPages}>Siguiente →</button>
            </div>
          )}
        </>
      )}

      {tab === 'errors' && (
        <>
          <div className="adm-logs__controls">
            <input className="adm-logs__search" placeholder="Buscar servicio, código, mensaje…"
              value={errQ} onChange={e => { setErrQ(e.target.value); setErrPage(1) }} />
            <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={loadErrors}>↺ Actualizar</button>
          </div>
          {errErr && <p style={{ color: 'red' }}>Error: {errErr}</p>}
          {errLoad ? <p className="adm-loading">Cargando…</p> : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead><tr>
                  <th>Fecha</th><th>Servicio</th><th>Código</th><th>Mensaje</th><th>Resuelto</th>
                </tr></thead>
                <tbody>
                  {errSlice.map(r => (
                    <tr key={r.id} className={r.resolved ? 'adm-tr--resolved' : ''}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{fmtDateTime(r.created_at)}</td>
                      <td><code style={{ fontSize: '0.78rem' }}>{r.service}</code></td>
                      <td><code style={{ fontSize: '0.78rem' }}>{r.error_code ?? '—'}</code></td>
                      <td className="adm-td--err" title={r.message}>{(r.message ?? '').slice(0, 80)}</td>
                      <td>
                        <button className={`adm-btn adm-btn--sm ${r.resolved ? 'adm-btn--ghost' : 'adm-btn--success'}`}
                          onClick={() => toggleResolved(r)}>
                          {r.resolved ? 'Reabrir' : 'Resolver'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {errPages > 1 && (
            <div className="adm-logs__pagination">
              <button className="adm-btn adm-btn--ghost adm-btn--sm"
                onClick={() => setErrPage(p => Math.max(1, p - 1))} disabled={errPage === 1}>← Anterior</button>
              <span className="adm-logs__page-info">Página {errPage} de {errPages} · {filteredErr.length} errores</span>
              <button className="adm-btn adm-btn--ghost adm-btn--sm"
                onClick={() => setErrPage(p => Math.min(errPages, p + 1))} disabled={errPage === errPages}>Siguiente →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Shell ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'users',       label: 'Usuarios' },
  { key: 'providers',   label: 'Proveedores' },
  { key: 'submissions', label: 'Solicitudes' },
  { key: 'logs',        label: 'Logs' },
]

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('users')
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) { navigate('/'); return }
    if (user) {
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => {
          setProfile(data)
          if (data?.role !== 'admin') navigate('/')
        })
    }
  }, [user, authLoading, navigate])

  if (authLoading || !profile) return null

  return (
    <div className="adm">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <div className="adm__header">
          <div>
            <h1 className="adm__title">Panel de administración</h1>
            <p className="adm__sub">SoyManada · {user?.email}</p>
          </div>
        </div>
        <div className="adm__tabs">
          {TABS.map(t => (
            <button key={t.key}
              className={`adm__tab${tab === t.key ? ' adm__tab--active' : ''}`}
              onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'users'       && <UsersPanel />}
        {tab === 'providers'   && <ProvidersPanel />}
        {tab === 'submissions' && <SubmissionsPanel />}
        {tab === 'logs'        && <LogsPanel />}
      </div>
    </div>
  )
}
