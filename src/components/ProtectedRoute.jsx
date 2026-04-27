// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Spinner() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid var(--iris-200)',
        borderTopColor: 'var(--iris-500)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}

export default function ProtectedRoute({ children, requireRole }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner />

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  if (requireRole && !role) return <Spinner />

  if (requireRole && role !== requireRole && role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}
