// src/pages/LoginPage.jsx — Login con Google OAuth
import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import './LoginPage.css'

export default function LoginPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  // Redirigir al directorio si ya tiene sesión
  useEffect(() => {
    if (user) navigate('/proveedores', { replace: true })
  }, [user, navigate])

  // Capturar error que Supabase devuelve en la URL tras OAuth fallido
  useEffect(() => {
    const params = new URLSearchParams(location.hash.replace('#', '?'))
    const errDesc = params.get('error_description')
    if (errDesc) setError(decodeURIComponent(errDesc.replace(/\+/g, ' ')))
  }, [location])

  const handleGoogle = async () => {
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${import.meta.env.VITE_SITE_URL ?? window.location.origin}/proveedores`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',  // siempre muestra el selector de cuenta Google
        },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // Si no hay error, el navegador redirige a Google — no hace falta setLoading(false)
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

        <h1 className="d-md lgp__title">Accede al directorio</h1>
        <p className="t-sm lgp__subtitle">
          Regístrate con tu cuenta de Google para ver los datos de contacto
          de los proveedores. Es gratis y solo toma un click.
        </p>

        {/* Botón Google */}
        <button
          className="lgp__google-btn"
          onClick={handleGoogle}
          disabled={loading}
        >
          {loading ? (
            <span className="lgp__spinner" aria-hidden="true" />
          ) : (
            <svg className="lgp__google-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span>{loading ? 'Redirigiendo…' : 'Continuar con Google'}</span>
        </button>

        {error && <p className="lgp__error t-sm">{error}</p>}

        <p className="lgp__footer t-xs">
          Al ingresar aceptas que SoyManada es un directorio informativo
          y no provee asesoría legal ni migratoria.
        </p>
      </div>
    </main>
  )
}
