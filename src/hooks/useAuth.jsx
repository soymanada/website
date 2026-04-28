import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'
import { trackEvent, Events } from '../utils/analytics'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session,        setSession]        = useState(undefined)
  const [profile,        setProfile]        = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const loadProfile = async (userId) => {
    setProfileLoading(true)
    if (!userId) { setProfile(null); setProfileLoading(false); return }
    const { data, error } = await supabase
      .from('profiles_with_effective_tier')
      .select('role, tier, effective_tier')
      .eq('id', userId)
      .single()
    if (!error && data) setProfile(data)
    else setProfile({ role: 'migrant', tier: 'bronze', effective_tier: 'bronze' })
    setProfileLoading(false)
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)

      // INITIAL_SESSION cubre el caso que antes manejaba getSession()
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        loadProfile(session?.user?.id)
      }

      if (event === 'SIGNED_IN') {
        const method = session?.user?.app_metadata?.provider ?? 'email'
        const isNew  = session?.user?.created_at === session?.user?.last_sign_in_at
        if (isNew) trackEvent(Events.SIGN_UP, { method })
        else       trackEvent(Events.LOGIN,   { method })
      }

      if (event === 'SIGNED_OUT') {
        trackEvent(Events.LOGOUT)
        setProfile(null)
        setProfileLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => { await supabase.auth.signOut() }

  const value = {
    session,
    user:    session?.user ?? null,
    loading: session === undefined || (session !== null && profileLoading),
    role:    profile?.role           ?? null,
    tier:    profile?.effective_tier ?? profile?.tier ?? null,  // usa effective_tier (incluye trial 90 días)
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
