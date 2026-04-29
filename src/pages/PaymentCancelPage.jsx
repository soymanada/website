// src/pages/PaymentCancelPage.jsx
// El usuario canceló el pago en Stripe — no se hace nada permanente,
// solo se informa y se ofrece volver.

import { Link, useNavigate } from 'react-router-dom'
import './PaymentCancelPage.css'

export default function PaymentCancelPage() {
  const navigate = useNavigate()

  return (
    <main className="paycancel">
      <div className="paycancel__card">
        <div className="paycancel__icon" aria-hidden="true">✕</div>
        <h1 className="paycancel__title">Pago cancelado</h1>
        <p className="paycancel__body">
          Cancelaste el proceso de pago. No se realizó ningún cargo ni
          se guardó ningún dato de pago.
        </p>
        <p className="paycancel__note">
          Puedes intentarlo de nuevo cuando quieras. Si tienes dudas,
          escríbenos a <a href="mailto:hola@soymanada.com">hola@soymanada.com</a>.
        </p>
        <div className="paycancel__actions">
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            <span>← Volver al perfil del proveedor</span>
          </button>
          <Link to="/" className="btn btn-ghost">
            <span>Ir al inicio</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
