// src/pages/ResetPasswordPage.jsx
// Dos estados:
//   1. Sin hash en URL  → formulario para pedir el email de recuperación
//   2. Con hash #access_token → Supabase redirigió acá, mostrar formulario de nueva contraseña
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import PawIcon from '../components/PawIcon'
import './LoginPage.css' // reutiliza los mismos estilos

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [mode,     setMode]     = useState('request') // 'request' | 'new-password'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [success,  setSuccess]  = useState(null)

  // Título de pestaña
  useEffect(() => {
    document.title = 'Recuperar contraseña | SoyManada'
  }, [])

  // Si Supabase redirige con #access_token en la URL → modo nueva contraseña
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('access_token')) {
      // Supabase setea la sesión automáticamente desde el hash
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setMode('new-password')
      })
    }
  }, [])

  // Paso 1: enviar email de recuperación
  const handleRequest = async (e) => {
    e.preventDefault()
    setError(null); setSuccess(null); setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_SITE_URL ?? window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSuccess('Revisa tu email — te enviamos un link para restablecer tu contraseña.')
  }

  // Paso 2: guardar la nueva contraseña
  const handleNewPassword = async (e) => {
    e.preventDefault()
    setError(null); setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      if (error.message.includes('Password should be')) setError('La contraseña debe tener al menos 6 caracteres.')
      else setError(error.message)
    } else {
      setSuccess('Contraseña actualizada correctamente.')
      setTimeout(() => navigate('/proveedores', { replace: true }), 1800)
    }
  }

  return (
    <main className="lgp">
      <div className="lgp__bg-orb lgp__bg-orb--1" aria-hidden="true" />
      <div className="lgp__bg-orb lgp__bg-orb--2" aria-hidden="true" />

      <div className="lgp__card">
        <Link to="/" className="lgp__logo">
          <PawIcon size={18} className="lgp__logo-glyph" />
          <span>SoyManada</span>
        </Link>

        {mode === 'request' ? (
          <>
            <h1 className="d-md lgp__title" style={{ textAlign: 'center', marginBottom: 8 }}>
              Recuperar contraseña
            </h1>
            <p className="t-sm lgp__subtitle">
              Ingresa tu email y te enviaremos un link para crear una nueva contraseña.
            </p>
            <form className="lgp__form" onSubmit={handleRequest} noValidate>
              <div className="lgp__field">
                <label className="lgp__label t-sm" htmlFor="reset-email">Email</label>
                <input
                  id="reset-email" className="lgp__input" type="email"
                  placeholder="tu@email.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required autoComplete="email"
                />
              </div>
              {error   && <p className="lgp__error t-sm">{error}</p>}
              {success && <p className="lgp__success t-sm">{success}</p>}
              <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                <span>{loading ? 'Enviando…' : 'Enviar link de recuperación'}</span>
              </button>
            </form>
            <p className="lgp__footer t-xs" style={{ marginTop: 16 }}>
              <Link to="/login" style={{ color: 'var(--iris-500)', fontWeight: 600 }}>
                ← Volver al login
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="d-md lgp__title" style={{ textAlign: 'center', marginBottom: 8 }}>
              Nueva contraseña
            </h1>
            <p className="t-sm lgp__subtitle">
              Elige una contraseña nueva para tu cuenta.
            </p>
            <form className="lgp__form" onSubmit={handleNewPassword} noValidate>
              <div className="lgp__field">
                <label className="lgp__label t-sm" htmlFor="new-password">Nueva contraseña</label>
                <input
                  id="new-password" className="lgp__input" type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required autoComplete="new-password"
                />
              </div>
              {error   && <p className="lgp__error t-sm">{error}</p>}
              {success && <p className="lgp__success t-sm">{success}</p>}
              <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                <span>{loading ? 'Guardando…' : 'Guardar nueva contraseña'}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
