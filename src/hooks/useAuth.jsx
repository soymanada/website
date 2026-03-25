import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'
import { trackEvent, Events } from '../utils/analytics'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = cargando
  const [profile, setProfile] = useState(null)      // { role, tier, ... }

  // Carga el perfil desde la tabla profiles
  const loadProfile = async (userId) => {
    if (!userId) { setProfile(null); return }
    const { data, error } = await supabase
      .from('profiles')
      .select('role, tier')
      .eq('id', userId)
      .single()
    if (!error && data) setProfile(data)
    else setProfile({ role: 'migrant', tier: 'bronze' }) // fallback seguro
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      loadProfile(session?.user?.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      loadProfile(session?.user?.id)

      if (event === 'SIGNED_IN') {
        const method = session?.user?.app_metadata?.provider ?? 'email'
        const isNew  = session?.user?.created_at === session?.user?.last_sign_in_at
        if (isNew) trackEvent(Events.SIGN_UP, { method })
        else       trackEvent(Events.LOGIN,   { method })
      }
      if (event === 'SIGNED_OUT') {
        trackEvent(Events.LOGOUT)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => { await supabase.auth.signOut() }

  const value = {
    session,
    user:    session?.user ?? null,
    loading: session === undefined,
    role:    profile?.role  ?? null,   // 'migrant' | 'provider' | 'admin'
    tier:    profile?.tier  ?? null,   // 'bronze' | 'silver' | 'gold'
    isProvider: profile?.role === 'provider' || profile?.role === 'admin',
    isAdmin:    profile?.role === 'admin',
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
