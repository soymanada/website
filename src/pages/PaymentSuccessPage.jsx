// src/pages/PaymentSuccessPage.jsx
// Página de retorno desde Stripe Checkout (success_url).
// NO confirma el pago por query params — consulta la DB para leer el estado
// real confirmado por webhook.

import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './PaymentSuccessPage.css'

const MAX_POLLS  = 8   // hasta ~16s de espera
const POLL_DELAY = 2000 // ms entre consultas

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [status,   setStatus]   = useState('loading')
  // 'loading' | 'paid' | 'pending' | 'not_found' | 'error'
  const [payment,  setPayment]  = useState(null)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (!sessionId) {
      setStatus('not_found')
      return
    }

    let cancelled = false
    let pollCount = 0

    const poll = async () => {
      if (cancelled) return

      const { data, error } = await supabase
        .from('stripe_payments')
        .select('status, amount_clp, currency, provider_name, description, created_at')
        .eq('session_id', sessionId)
        .maybeSingle()

      if (cancelled) return

      if (error) {
        setStatus('error')
        return
      }

      if (data?.status === 'paid') {
        setPayment(data)
        setStatus('paid')
        return
      }

      // Si aún no llegó el webhook, reintentamos hasta MAX_POLLS
      pollCount++
      setAttempts(pollCount)

      if (pollCount >= MAX_POLLS) {
        // Webhook aún no llegó — mostramos "pendiente" honesto
        if (data) {
          setPayment(data)
          setStatus('pending')
        } else {
          setStatus('pending')
        }
        return
      }

      setTimeout(poll, POLL_DELAY)
    }

    poll()
    return () => { cancelled = true }
  }, [sessionId])

  return (
    <main className="paysuccess">
      <div className="paysuccess__card">
        {status === 'loading' && (
          <>
            <div className="paysuccess__spinner" aria-hidden="true" />
            <h1 className="paysuccess__title">Verificando tu pago…</h1>
            <p className="paysuccess__body">
              Estamos confirmando con Stripe. Esto toma unos segundos.
              {attempts > 2 && ' Gracias por tu paciencia.'}
            </p>
          </>
        )}

        {status === 'paid' && (
          <>
            <div className="paysuccess__icon paysuccess__icon--ok" aria-hidden="true">✓</div>
            <h1 className="paysuccess__title">¡Pago confirmado!</h1>
            <p className="paysuccess__body">
              Tu pago fue procesado exitosamente por Stripe.
              {payment?.provider_name && (
                <> El proveedor <strong>{payment.provider_name}</strong> recibirá la confirmación pronto.</>
              )}
            </p>
            {payment?.amount_clp && (
              <p className="paysuccess__amount">
                ${Number(payment.amount_clp).toLocaleString('es-CL')} CLP
                {payment.description && <span className="paysuccess__desc"> — {payment.description}</span>}
              </p>
            )}
            <p className="paysuccess__note">
              Recibirás un email de confirmación. Guardamos este registro de forma segura.
            </p>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="paysuccess__icon paysuccess__icon--pending" aria-hidden="true">⏳</div>
            <h1 className="paysuccess__title">Pago en proceso</h1>
            <p className="paysuccess__body">
              Tu pago está siendo procesado. La confirmación puede demorar unos minutos.
              <br />
              <strong>No vuelvas a pagar.</strong> Te llegará un email cuando esté listo.
            </p>
            <p className="paysuccess__note">
              Si en 10 minutos no recibes confirmación, escríbenos a{' '}
              <a href="mailto:hola@soymanada.com">hola@soymanada.com</a>.
            </p>
          </>
        )}

        {(status === 'not_found' || status === 'error') && (
          <>
            <div className="paysuccess__icon paysuccess__icon--warn" aria-hidden="true">?</div>
            <h1 className="paysuccess__title">No pudimos verificar tu pago</h1>
            <p className="paysuccess__body">
              No encontramos el registro de esta transacción. Si realizaste un pago,
              escríbenos con el número de orden de Stripe.
            </p>
            <p className="paysuccess__note">
              Contacto: <a href="mailto:hola@soymanada.com">hola@soymanada.com</a>
            </p>
          </>
        )}

        <div className="paysuccess__actions">
          <Link to="/" className="btn btn-primary">
            <span>Volver al inicio</span>
          </Link>
          <Link to="/primeros-pasos" className="btn btn-ghost">
            <span>Ver recursos para migrantes</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
