import React from 'react'
import './VerificationBadge.css'

export default function VerificationBadge() {
  return (
    <div className="v-badge" aria-label="Proveedor Verificado">
      <span className="v-badge__icon">✦</span>
      <div className="v-badge__tooltip">
        <p className="t-xs"><strong>Sello de Confianza Manada</strong></p>
        <p className="t-xs">Identidad validada y historial positivo comprobado en la comunidad.</p>
      </div>
    </div>
  )
}