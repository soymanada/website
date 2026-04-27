/**
 * Returns the best available display name for a Supabase auth user.
 * Priority: full_name → name (Google OAuth) → email prefix → null
 */
export function getUserDisplayName(user) {
  return (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    null
  )
}
