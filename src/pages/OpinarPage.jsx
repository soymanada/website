// src/pages/OpinarPage.jsx
import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import VerificationBadge from '../components/VerificationBadge'

const MAX_OPINIONS = 10

export default function OpinarPage() {
  const [searchParams]  = useSearchParams()
  const token           = searchParams.get('token')
  const { user, loading: authLoading } = useAuth()
  const navigate        = useNavigate()

  // Estados: loading | invalid | cupo_completo | no_auth | ya_comento | form | submitting | success | error
  const [status, setStatus]           = useState('loading')
  const [invite, setInvite]           = useState(null)
  const [provider, setProvider]       = useState(null)
  const [opinionCount, setOpinionCount] = useState(0)
  const [text, setText]               = useState('')
  const [rating,      setRating]      = useState(0)
  const [ratingComm,  setRatingComm]  = useState(0)
  const [ratingQual,  setRatingQual]  = useState(0)
  const [ratingPrice, setRatingPrice] = useState(0)
  const [errorMsg, setErrorMsg]       = useState('')

  useEffect(() => {
    document.title = 'Comparte tu experiencia | SoyManada'
    return () => { document.title = 'SoyManada – Directorio para la comunidad migrante' }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!token) { setStatus('invalid'); return }

    const load = async () => {
      setStatus('loading')

      // 1. Validar token
      const { data: inv } = await supabase
        .from('pilot_invites')
        .select('id, provider_id, is_active')
        .eq('token', token)
        .single()

      if (!inv || !inv.is_active) { setStatus('invalid'); return }
      setInvite(inv)

      // 2. Datos del proveedor
      const { data: prov } = await supabase
        .from('providers')
        .select('id, name, service, avatar_url, slug, verified')
        .eq('id', inv.provider_id)
        .single()

      if (!prov) { setStatus('invalid'); return }
      setProvider(prov)

      // 3. Contar opiniones actuales
      const { count } = await supabase
        .from('pilot_opinions')
        .select('id', { count: 'exact', head: true })
        .eq('provider_id', inv.provider_id)

      const currentCount = count ?? 0
      setOpinionCount(currentCount)

      if (currentCount >= MAX_OPINIONS) { setStatus('cupo_completo'); return }

      // 4. ¿Hay sesión?
      if (!user) { setStatus('no_auth'); return }

      // 5. ¿Ya comentó este usuario?
      const { data: existing } = await supabase
        .from('pilot_opinions')
        .select('id')
        .eq('provider_id', inv.provider_id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing) { setStatus('ya_comento'); return }

      setStatus('form')
    }

    load()
  }, [token, user, authLoading])

  const handleSubmit = async () => {
    if (text.trim().length < 10) {
      setErrorMsg('Tu opinión debe tener al menos 10 caracteres.')
      return
    }
    setStatus('submitting')
    setErrorMsg('')

    const authorName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      null

    const { error } = await supabase.from('pilot_opinions').insert({
      provider_id:  invite.provider_id,
      user_id:      user.id,
      author_name:  authorName,
      text:         text.trim(),
      rating:       rating      || null,
      rating_comm:  ratingComm  || null,
      rating_qual:  ratingQual  || null,
      rating_price: ratingPrice || null,
    })

    if (error) {
      const isCupo = error.message?.includes('cupo_completo') || error.message?.includes('límite')
      setErrorMsg(isCupo
        ? 'Este proveedor ya alcanzó el máximo de opiniones.'
        : 'Hubo un error al enviar tu opinión. Intenta de nuevo.')
      setStatus('form')
    } else {
      setStatus('success')
    }
  }

  // ── Renders por estado ──────────────────────────────────────────

  if (status === 'loading') return (
    <PageShell>
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={spinnerStyle} />
        <p style={{ color: 'var(--text-400)', fontSize: '0.875rem', marginTop: 12 }}>
          Verificando invitación…
        </p>
        <style>{`@keyframes sm-spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </PageShell>
  )

  if (status === 'invalid') return (
    <PageShell>
      <StatusCard
        icon="❌"
        title="Link inválido o vencido"
        text="Este link de invitación no es válido o ya no está activo. Si crees que es un error, contacta al proveedor."
      />
    </PageShell>
  )

  if (status === 'cupo_completo') return (
    <PageShell>
      <ProviderHeader provider={provider} />
      <StatusCard
        icon="🎯"
        title="Cupo completo"
        text={`${provider?.name} ya recibió sus ${MAX_OPINIONS} primeras opiniones. ¡Gracias por tu interés!`}
      />
    </PageShell>
  )

  if (status === 'no_auth') return (
    <PageShell>
      <ProviderHeader provider={provider} />
      <div style={cardStyle}>
        <p style={{ fontWeight: 600, color: 'var(--text-700)', marginBottom: 8 }}>
          Inicia sesión para dejar tu opinión
        </p>
        <p style={{ color: 'var(--text-400)', fontSize: '0.875rem', marginBottom: 20, lineHeight: 1.6 }}>
          Solo pedimos autenticación para evitar opiniones duplicadas.
          Tu nombre aparecerá junto a tu opinión para que la comunidad sepa quién la comparte.
          Puedes cambiarlo en tu cuenta antes de opinar.
        </p>
        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={() => navigate('/login', {
            state: { from: { pathname: `/opinar?token=${token}` } }
          })}
        >
          <span>Iniciar sesión →</span>
        </button>
      </div>
    </PageShell>
  )

  if (status === 'ya_comento') return (
    <PageShell>
      <ProviderHeader provider={provider} />
      <StatusCard
        icon="✅"
        title="Ya compartiste tu experiencia"
        text={`Ya dejaste una opinión sobre ${provider?.name}. Solo se permite una opinión por proveedor. ¡Gracias!`}
      />
    </PageShell>
  )

  if (status === 'success') return (
    <PageShell>
      <ProviderHeader provider={provider} />
      <StatusCard
        icon="🎉"
        title="¡Gracias por tu opinión!"
        text="Tu experiencia fue registrada. Ayuda a otros migrantes a tomar mejores decisiones al elegir un proveedor."
      >
        <Link
          to={`/proveedor/${provider?.slug}`}
          style={{ color: 'var(--iris-500)', fontSize: '0.875rem', display: 'inline-block', marginTop: 16 }}
        >
          Ver perfil de {provider?.name} →
        </Link>
      </StatusCard>
    </PageShell>
  )

  // Estados: form | submitting
  return (
    <PageShell>
      <ProviderHeader provider={provider} />

      <div style={cardStyle}>
        {/* Contador de cupo */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20, paddingBottom: 16,
          borderBottom: '1px solid var(--border-100, #e5e0d8)',
        }}>
          <span style={{
            fontSize: '0.75rem', color: 'var(--text-300)', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            Opiniones de clientes registrados
          </span>
          <span style={{
            fontSize: '0.8rem', color: 'var(--iris-600)', fontWeight: 700,
            background: 'var(--iris-50, #f3eeff)', padding: '3px 10px', borderRadius: 20,
          }}>
            {opinionCount} de {MAX_OPINIONS}
          </span>
        </div>

        {/* Ratings opcionales */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ ...labelStyle, marginBottom: 12 }}>
            Valoraciones <span style={{ color: 'var(--text-300)', fontWeight: 400 }}>(opcionales)</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <PawSelector label="Valoración general"    value={rating}      onChange={setRating}      disabled={status === 'submitting'} />
            <PawSelector label="Comunicación"          value={ratingComm}  onChange={setRatingComm}  disabled={status === 'submitting'} />
            <PawSelector label="Calidad del servicio"  value={ratingQual}  onChange={setRatingQual}  disabled={status === 'submitting'} />
            <PawSelector label="Precio justo"          value={ratingPrice} onChange={setRatingPrice} disabled={status === 'submitting'} />
          </div>
        </div>

        {/* Textarea */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>
            Comparte tu experiencia <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setErrorMsg('') }}
            rows={5}
            placeholder="¿Cómo fue tu experiencia con este proveedor? Cuéntales a otros migrantes lo que necesitan saber antes de contactarle."
            style={{
              width: '100%', padding: '12px 14px', boxSizing: 'border-box',
              border: `1px solid ${errorMsg ? '#f87171' : 'var(--border-100, #e5e0d8)'}`,
              borderRadius: 8, fontSize: '0.875rem', fontFamily: 'inherit',
              resize: 'vertical', outline: 'none', color: 'var(--text-700)',
              background: 'var(--surface-0, #fff)', lineHeight: 1.6,
              transition: 'border-color 0.15s',
            }}
            disabled={status === 'submitting'}
          />
          {errorMsg && (
            <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: 4 }}>{errorMsg}</p>
          )}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-300)', marginTop: 4 }}>
            Mínimo 10 caracteres · {text.trim().length} escritos
          </p>
        </div>

        {/* Submit */}
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={status === 'submitting'}
          style={{ width: '100%' }}
        >
          <span>{status === 'submitting' ? 'Enviando…' : 'Enviar mi opinión'}</span>
        </button>

        <p style={{ fontSize: '0.72rem', color: 'var(--text-300)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
          Primeras {MAX_OPINIONS} opiniones de clientes registrados.
          No son "reseñas verificadas" ni implican validación de transacción por SoyManada.
        </p>

        <div style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: '1px solid var(--border-100, #e5e0d8)',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 14, flexShrink: 0, opacity: 0.5 }}>🐾</span>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-300)', margin: 0, lineHeight: 1.5 }}>
            Tu nombre de cuenta aparecerá junto a tu opinión.
            Si quieres cambiarlo, visita <a href="/cuenta" style={{ color: 'var(--iris-500)' }}>tu cuenta</a> antes de enviar.
          </p>
        </div>
      </div>
    </PageShell>
  )
}

// ── Componentes de apoyo ─────────────────────────────────────────

const cardStyle = {
  background:   'var(--surface-100, #faf8f4)',
  border:       '1px solid var(--border-100, #e5e0d8)',
  borderRadius: 12,
  padding:      '24px',
}

const labelStyle = {
  display: 'block', fontSize: '0.875rem',
  fontWeight: 600, color: 'var(--text-700)', marginBottom: 8,
}

const spinnerStyle = {
  width: 32, height: 32,
  border: '3px solid var(--iris-200)',
  borderTopColor: 'var(--iris-600)',
  borderRadius: '50%',
  animation: 'sm-spin 0.8s linear infinite',
  margin: '0 auto',
}

function PageShell({ children }) {
  return (
    <main style={{ padding: '100px 24px 60px', maxWidth: 560, margin: '0 auto' }}>
      <Link
        to="/"
        style={{ color: 'var(--iris-500)', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block', marginBottom: 28 }}
      >
        ← SoyManada
      </Link>
      {children}
    </main>
  )
}

function ProviderHeader({ provider }) {
  if (!provider) return null
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: provider.verified ? 10 : 0 }}>
        {provider.avatar_url
          ? <img
              src={provider.avatar_url}
              alt={provider.name}
              style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          : <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--iris-100)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: 'var(--iris-600)', fontSize: '1.3rem',
            }}>
              {(provider.name || '?')[0].toUpperCase()}
            </div>
        }
        <div>
          <strong style={{ display: 'block', color: 'var(--iris-900)', fontSize: '1.1rem', lineHeight: 1.3 }}>
            {provider.name}
          </strong>
          {provider.service && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-400)' }}>{provider.service}</span>
          )}
          {provider.verified && (
            <div style={{ marginTop: 6 }}>
              <VerificationBadge variant="pill" theme="light" />
            </div>
          )}
        </div>
      </div>

      {provider.verified && (
        <div style={{
          background: 'var(--iris-50, #f3eeff)',
          border: '1px solid var(--iris-100, #e0d4ff)',
          borderRadius: 10,
          padding: '10px 14px',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>🐾</span>
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--iris-800)', margin: 0, marginBottom: 3 }}>
              Proveedor verificado por SoyManada
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--iris-700)', margin: 0, lineHeight: 1.5 }}>
              Confirmamos identidad real, documentación válida y actividad legítima en el directorio.
              La verificación no garantiza resultados pero sí que esta persona es quien dice ser.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function PawSelector({ label, value, onChange, disabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-500)', fontWeight: 500, minWidth: 0, flex: '1 1 0' }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(prev => prev === n ? 0 : n)}
            style={{
              background: 'none', border: 'none',
              cursor: disabled ? 'default' : 'pointer',
              fontSize: 22, lineHeight: 1, padding: '2px 3px',
              opacity: n <= value ? 1 : 0.18,
              transition: 'opacity 0.1s',
              filter: n <= value ? 'none' : 'grayscale(1)',
            }}
            aria-label={`${n} huella${n > 1 ? 's' : ''}`}
          >🐾</button>
        ))}
      </div>
    </div>
  )
}

function StatusCard({ icon, title, text, children }) {
  return (
    <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 24px' }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>{icon}</div>
      <h2 style={{ color: 'var(--iris-900)', marginBottom: 8, fontSize: '1.2rem' }}>{title}</h2>
      <p style={{ color: 'var(--text-400)', fontSize: '0.875rem', lineHeight: 1.6 }}>{text}</p>
      {children}
    </div>
  )
}
