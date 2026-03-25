// src/pages/LoginPage.jsx — Login y registro de migrantes
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import './LoginPage.css'

export default function LoginPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()

  const [mode,     setMode]     = useState('login')   // 'login' | 'register'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [success,  setSuccess]  = useState(null)

  // Si ya tiene sesión, redirigir al directorio
  useEffect(() => {
    if (user) navigate('/proveedores', { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        })
        if (error) throw error
        setSuccess('¡Cuenta creada! Revisa tu email para confirmar tu registro.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/proveedores', { replace: true })
      }
    } catch (err) {
      // Traducir errores comunes al español
      const msg = err.message
      if (msg.includes('Invalid login credentials'))   setError('Email o contraseña incorrectos.')
      else if (msg.includes('Email not confirmed'))    setError('Confirma tu email antes de ingresar.')
      else if (msg.includes('User already registered'))setError('Ya existe una cuenta con ese email.')
      else if (msg.includes('Password should be'))     setError('La contraseña debe tener al menos 6 caracteres.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="lgp">
      <div className="lgp__bg-orb lgp__bg-orb--1" aria-hidden="true" />
      <div className="lgp__bg-orb lgp__bg-orb--2" aria-hidden="true" />

      <div className="lgp__card">
        {/* Logo */}
        <Link to="/" className="lgp__logo">
          <span className="lgp__logo-glyph" aria-hidden="true">✦</span>
          <span>SoyManada</span>
        </Link>

        {/* Tabs */}
        <div className="lgp__tabs">
          <button
            className={`lgp__tab${mode === 'login' ? ' lgp__tab--active' : ''}`}
            onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
          >
            Ingresar
          </button>
          <button
            className={`lgp__tab${mode === 'register' ? ' lgp__tab--active' : ''}`}
            onClick={() => { setMode('register'); setError(null); setSuccess(null) }}
          >
            Registrarse
          </button>
        </div>

        <p className="lgp__subtitle t-sm">
          {mode === 'login'
            ? 'Ingresa para ver los datos de contacto de los proveedores.'
            : 'Crea tu cuenta gratis para contactar proveedores directamente.'}
        </p>

        {/* Formulario */}
        <form className="lgp__form" onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <div className="lgp__field">
              <label className="lgp__label t-sm" htmlFor="name">Nombre completo</label>
              <input
                id="name"
                className="lgp__input"
                type="text"
                placeholder="María González"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="lgp__field">
            <label className="lgp__label t-sm" htmlFor="email">Email</label>
            <input
              id="email"
              className="lgp__input"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="lgp__field">
            <label className="lgp__label t-sm" htmlFor="password">Contraseña</label>
            <input
              id="password"
              className="lgp__input"
              type="password"
              placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </div>

          {error   && <p className="lgp__error t-sm">{error}</p>}
          {success && <p className="lgp__success t-sm">{success}</p>}

          <button
            className="btn btn-primary btn-full"
            type="submit"
            disabled={loading}
          >
            <span>{loading ? 'Un momento…' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</span>
          </button>
        </form>

        <p className="lgp__footer t-xs">
          Al registrarte aceptas que SoyManada es un directorio informativo y no provee asesoría legal ni migratoria.
        </p>
      </div>
    </main>
  )
}
