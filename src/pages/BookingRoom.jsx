// src/pages/BookingRoom.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function BookingRoom() {
  const { bookingId } = useParams()
  const { user } = useAuth()
  const [booking, setBooking]   = useState(null)
  const [provider, setProvider] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    document.title = 'Sala de reunión | SoyManada'
    return () => { document.title = 'SoyManada – Directorio para la comunidad migrante' }
  }, [])

  useEffect(() => {
    if (!bookingId) return
    const load = async () => {
      setLoading(true)
      const { data: b, error: bErr } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single()

      if (bErr || !b) { setError('No encontramos esta reserva.'); setLoading(false); return }
      setBooking(b)

      const { data: p } = await supabase
        .from('providers')
        .select('name, avatar_url, slug, service')
        .eq('id', b.provider_id)
        .single()

      if (p) setProvider(p)
      setLoading(false)
    }
    load()
  }, [bookingId])

  if (loading) return (
    <main style={{ padding: '120px 24px', textAlign: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--iris-200)', borderTopColor: 'var(--iris-600)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
      <p style={{ color: 'var(--text-400)' }}>Cargando sala…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </main>
  )

  if (error || !booking) return (
    <main style={{ padding: '120px 24px', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--iris-900)', marginBottom: 12 }}>Reserva no encontrada</h1>
      <p style={{ color: 'var(--text-400)', marginBottom: 24 }}>{error}</p>
      <Link to="/cuenta" className="btn btn-primary"><span>Ir a mi cuenta</span></Link>
    </main>
  )

  const roomUrl  = booking.room_name
    ? `https://meet.jit.si/${booking.room_name}`
    : null

  const isConfirmed = booking.status === 'confirmed' || booking.status === 'completed'

  return (
    <main style={{ paddingTop: 80 }}>
      {/* Info strip — ancho contenido */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 24px 0' }}>
        <Link to="/cuenta" style={{ color: 'var(--iris-500)', fontSize: '0.875rem', textDecoration: 'none' }}>
          ← Volver a mi cuenta
        </Link>
        <h1 style={{ color: 'var(--iris-900)', marginTop: 16, marginBottom: 4, fontSize: '1.5rem' }}>
          Sala de reunión
        </h1>
        <p style={{ color: 'var(--text-400)', fontSize: '0.875rem', marginBottom: 20 }}>
          {isConfirmed ? '✅ Cita confirmada' : '⏳ Pendiente de confirmación'}
        </p>

        {/* Info card */}
        <div style={{
          background: 'var(--surface-100, #faf8f4)',
          border: '1px solid var(--border-100, #e5e0d8)',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 20,
        }}>
          {provider && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              {provider.avatar_url
                ? <img src={provider.avatar_url} alt={provider.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--iris-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--iris-600)', fontSize: '1.1rem' }}>
                    {(provider.name || '?')[0].toUpperCase()}
                  </div>
              }
              <div>
                <strong style={{ display: 'block', color: 'var(--text-700)' }}>{provider.name}</strong>
                {provider.service && <span style={{ fontSize: '0.8rem', color: 'var(--text-400)' }}>{provider.service}</span>}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-300)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha</span>
              <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--iris-700)' }}>
                {fmtDate(booking.start_at)}
              </p>
            </div>
            {booking.notes && (
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-300)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notas</span>
                <p style={{ margin: '2px 0 0', color: 'var(--text-500)', fontStyle: 'italic' }}>"{booking.notes}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sala — full width */}
      {!isConfirmed ? (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 60px' }}>
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 10,
            padding: '20px 24px',
            color: '#92400e',
          }}>
            <strong>⏳ Esperando confirmación</strong>
            <p style={{ margin: '8px 0 0', fontSize: '0.875rem' }}>
              El proveedor aún no ha confirmado esta cita. Cuando lo haga, recibirás un email con el link para entrar a la sala.
            </p>
          </div>
        </div>
      ) : roomUrl ? (
        <div>
          {/* Banner verde con botón de nueva ventana */}
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 16px' }}>
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 10,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}>
              <div>
                <strong style={{ color: '#166534' }}>✅ Tu sala está lista</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#15803d' }}>
                  La sala es privada y segura. Entra cuando sea la hora de tu cita.
                </p>
              </div>
              <a
                href={roomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-flex', flexShrink: 0 }}
              >
                <span>🎥 Abrir en pantalla completa</span>
              </a>
            </div>
          </div>

          {/* Iframe full width, altura generosa */}
          <div style={{
            width: '100%',
            height: 'calc(100vh - 260px)',
            minHeight: 520,
            background: '#000',
            borderTop: '1px solid var(--border-100, #e5e0d8)',
          }}>
            <iframe
              src={`https://meet.jit.si/${booking.room_name}#config.startWithAudioMuted=true&config.startWithVideoMuted=false&userInfo.displayName=${encodeURIComponent(user?.user_metadata?.full_name || 'Migrante')}`}
              allow="camera; microphone; fullscreen; display-capture"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              title="Sala de reunión"
            />
          </div>

          <p style={{ padding: '10px 24px', fontSize: '0.72rem', color: 'var(--text-300)', textAlign: 'center' }}>
            ¿Problemas con el iframe? <a href={roomUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--iris-500)' }}>Abre la sala en una nueva ventana →</a>
          </p>
        </div>
      ) : (
        <div style={{ color: 'var(--text-400)', textAlign: 'center', padding: '32px 0' }}>
          <p>La sala aún no fue generada. Por favor contacta a soporte.</p>
        </div>
      )}
    </main>
  )
}
