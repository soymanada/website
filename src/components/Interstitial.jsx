// src/components/Interstitial.jsx
import React from 'react';
import './Interstitial.css';

export default function Interstitial({ providerName, platform }) {
  return (
    <div className="interstitial">
      <div className="interstitial__content">
        <div className="interstitial__loader" />
        <h3 className="t-lg">Estableciendo conexión segura</h3>
        <p className="t-sm">
          Verificando perfil de <strong>{providerName}</strong> en {platform}...
        </p>
        <div className="interstitial__footer">
          <span className="v-badge__icon">✦</span>
          <span className="label">Protegido por SoyManada</span>
        </div>
      </div>
    </div>
  );
}