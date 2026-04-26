import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import PawIcon from '../components/PawIcon'
import './LoginPage.css'
import './MigrantAccountPage.css'

export default function MigrantAccountPage() {
  const { user, loading, signOut, isProvider } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [editingName, setEditingName] = useState(false)
  const [newName,     setNewName]     = useState('')
  const [nameSaving,  setNameSaving]  = useState(false)
  const [nameMsg,     setNameMsg]     = useState(null) // { ok: bool, text: string }

  useEffect(() => {
    document.title = t('account_page.meta_title')
    return () => { document.title = 'SoyManada – Directorio para la comunidad migrante' }
  }, [t])

  if (loading) {
    return (
      <main className="macct macct--loading">
        <div className="macct__spinner" aria-hidden="true" />
      </main>
    )
  }

  if (isProvider) {
    return <Navigate to="/mi-perfil" replace />
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    '—'

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  const startEdit = () => {
    setNewName(displayName)
    setNameMsg(null)
    setEditingName(true)
  }

  const cancelEdit = () => {
    setEditingName(false)
    setNameMsg(null)
  }

  const saveName = async () => {
    const trimmed = newName.trim()
    if (!trimmed || trimmed === displayName) { cancelEdit(); return }
    setNameSaving(true)
    setNameMsg(null)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: trimmed, name: trimmed },
    })
    setNameSaving(false)
    if (error) {
      setNameMsg({ ok: false, text: 'No se pudo guardar. Inténtalo de nuevo.' })
    } else {
      setNameMsg({ ok: true, text: '¡Nombre actualizado!' })
      setEditingName(false)
      // Recargar sesión para reflejar cambio en Header
      await supabase.auth.refreshSession()
    }
  }

  return (
    <main className="lgp">
      <div className="lgp__bg-orb lgp__bg-orb--1" aria-hidden="true" />
      <div className="lgp__bg-orb lgp__bg-orb--2" aria-hidden="true" />

      <div className="lgp__card macct__card">
        <Link to="/" className="lgp__logo">
          <PawIcon size={18} className="lgp__logo-glyph" />
          <span>SoyManada</span>
        </Link>

        <h1 className="d-md macct__title">{t('account_page.title')}</h1>
        <p className="t-sm lgp__subtitle macct__subtitle">{t('account_page.subtitle')}</p>

        <div className="macct__panel">
          {/* Nombre — editable */}
          <div className="macct__row">
            <div className="macct__row-head">
              <span className="macct__label t-sm">{t('account_page.name_label')}</span>
              {!editingName && (
                <button
                  type="button"
                  className="macct__edit-btn t-xs"
                  onClick={startEdit}
                  aria-label="Editar nombre"
                >
                  Editar
                </button>
              )}
            </div>

            {editingName ? (
              <div className="macct__name-edit">
                <input
                  className="macct__name-input"
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') cancelEdit() }}
                  placeholder="Tu nombre completo"
                  autoFocus
                  maxLength={80}
                  disabled={nameSaving}
                />
                <div className="macct__name-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={saveName}
                    disabled={nameSaving || !newName.trim()}
                  >
                    <span>{nameSaving ? 'Guardando…' : 'Guardar'}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={cancelEdit}
                    disabled={nameSaving}
                  >
                    Cancelar
                  </button>
                </div>
                {nameMsg && (
                  <p className={`macct__name-msg t-xs${nameMsg.ok ? ' macct__name-msg--ok' : ' macct__name-msg--err'}`}>
                    {nameMsg.text}
                  </p>
                )}
              </div>
            ) : (
              <>
                <span className="macct__value">{displayName}</span>
                {nameMsg?.ok && (
                  <p className="macct__name-msg macct__name-msg--ok t-xs">{nameMsg.text}</p>
                )}
                <p className="macct__name-hint t-xs">
                  Este nombre aparece en tus opiniones sobre proveedores.
                </p>
              </>
            )}
          </div>

          {/* Email — solo lectura */}
          <div className="macct__row">
            <span className="macct__label t-sm">{t('account_page.email_label')}</span>
            <span className="macct__value">{user?.email ?? '—'}</span>
          </div>
        </div>

        <div className="macct__actions">
          <button type="button" className="btn btn-primary btn-full" onClick={handleSignOut}>
            <span>{t('account_page.sign_out')}</span>
          </button>
          <Link to="/proveedores" className="btn btn-secondary btn-full">
            <span>{t('account_page.explore')}</span>
          </Link>
          <Link to="/" className="btn btn-ghost btn-full">
            <span>{t('account_page.back_home')}</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
