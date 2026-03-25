import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'
import { trackEvent, Events } from '../utils/analytics'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = cargando, null = sin sesión

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Escuchar cambios y trackear login/signup/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'SIGNED_IN') {
        const method = session?.user?.app_metadata?.provider ?? 'email'
        // sign_up solo en el primer login (created_at == last_sign_in_at)
        const isNew = session?.user?.created_at === session?.user?.last_sign_in_at
        if (isNew) trackEvent(Events.SIGN_UP, { method })
        else       trackEvent(Events.LOGIN,   { method })
      }
      if (event === 'SIGNED_OUT') trackEvent(Events.LOGOUT)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading: session === undefined, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
