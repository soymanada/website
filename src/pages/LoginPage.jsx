// src/pages/LoginPage.jsx — Login con Google OAuth + Email/Password
import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { trackEvent, Events } from '../utils/analytics'
import './LoginPage.css'

export default function LoginPage() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const location    = useLocation()
  // Si viene de una ruta protegida o del gate, volver ahí tras el login
  const from        = location.state?.from?.pathname ?? '/proveedores'

  const [mode,      setMode]      = useState('login')   // 'login' | 'register'
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [name,      setName]      = useState('')
  const [loading,   setLoading]   = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error,     setError]     = useState(null)
  const [success,   setSuccess]   = useState(null)

  // Redirigir si ya tiene sesión
  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, navigate, from])

  // Capturar error OAuth en URL hash
  useEffect(() => {
    const params = new URLSearchParams(location.hash.replace('#', '?'))
    const errDesc = params.get('error_description')
    if (errDesc) setError(decodeURIComponent(errDesc.replace(/\+/g, ' ')))
  }, [location])

  // Google OAuth
  const handleGoogle = async () => {
    setError(null)
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${import.meta.env.VITE_SITE_URL ?? window.location.origin}${from}`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
    // Si no hay error el navegador redirige a Google
  }

  // Email / Password
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
        trackEvent(Events.SIGN_UP, { method: 'email' })
        setSuccess('¡Cuenta creada! Revisa tu email para confirmar tu registro.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        trackEvent(Events.LOGIN, { method: 'email' })
        navigate(from, { replace: true })
      }
    } catch (err) {
      const msg = err.message
      if (msg.includes('Invalid login credentials'))    setError('Email o contraseña incorrectos.')
      else if (msg.includes('Email not confirmed'))     setError('Confirma tu email antes de ingresar.')
      else if (msg.includes('User already registered')) setError('Ya existe una cuenta con ese email.')
      else if (msg.includes('Password should be'))      setError('La contraseña debe tener al menos 6 caracteres.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (m) => {
    setMode(m)
    setError(null)
    setSuccess(null)
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
            onClick={() => switchMode('login')}
          >
            Ingresar
          </button>
          <button
            className={`lgp__tab${mode === 'register' ? ' lgp__tab--active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Registrarse
          </button>
        </div>

        <p className="lgp__subtitle t-sm">
          {mode === 'login'
            ? 'Ingresa para ver los datos de contacto de los proveedores.'
            : 'Crea tu cuenta gratis para contactar proveedores directamente.'}
        </p>

        {/* Botón Google */}
        <button className="lgp__google-btn" onClick={handleGoogle} disabled={googleLoading || loading}>
          {googleLoading ? (
            <span className="lgp__spinner" aria-hidden="true" />
          ) : (
            <svg className="lgp__google-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span>{googleLoading ? 'Redirigiendo…' : 'Continuar con Google'}</span>
        </button>

        {/* Divisor */}
        <div className="lgp__divider">
          <span className="lgp__divider-line" />
          <span className="lgp__divider-text t-xs">o con tu email</span>
          <span className="lgp__divider-line" />
        </div>

        {/* Formulario email/password */}
        <form className="lgp__form" onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <div className="lgp__field">
              <label className="lgp__label t-sm" htmlFor="name">Nombre completo</label>
              <input
                id="name" className="lgp__input" type="text"
                placeholder="María González"
                value={name} onChange={e => setName(e.target.value)}
                required autoComplete="name"
              />
            </div>
          )}
          <div className="lgp__field">
            <label className="lgp__label t-sm" htmlFor="email">Email</label>
            <input
              id="email" className="lgp__input" type="email"
              placeholder="tu@email.com"
              value={email} onChange={e => setEmail(e.target.value)}
              required autoComplete="email"
            />
          </div>
          <div className="lgp__field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="lgp__label t-sm" htmlFor="password">Contraseña</label>
              {mode === 'login' && (
                <Link to="/reset-password" className="t-xs" style={{ color: 'var(--iris-500)', fontWeight: 600 }}>
                  ¿Olvidaste tu contraseña?
                </Link>
              )}
            </div>
            <input
              id="password" className="lgp__input" type="password"
              placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
              value={password} onChange={e => setPassword(e.target.value)}
              required autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </div>

          {error   && <p className="lgp__error t-sm">{error}</p>}
          {success && <p className="lgp__success t-sm">{success}</p>}

          <button className="btn btn-primary btn-full" type="submit" disabled={loading || googleLoading}>
            <span>{loading ? 'Un momento…' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</span>
          </button>
        </form>

        <p className="lgp__footer t-xs">
          Al ingresar aceptas que SoyManada es un directorio informativo
          y no provee asesoría legal ni migratoria.
        </p>
      </div>
    </main>
  )
}
