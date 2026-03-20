import React from 'react'
import './HowItWorks.css'

const steps = [
  { n: '01', icon: '🗂️', title: 'Explora categorías', body: 'Seguros, migración, trabajo, alojamiento, idiomas. Todo ordenado, sin ruido.' },
  { n: '02', icon: '👤', title: 'Revisa el proveedor', body: 'Nombre, servicio, países, idiomas y si está verificado por la comunidad Manada.' },
  { n: '03', icon: '💬', title: 'Contáctalos directo', body: 'Un clic y abre WhatsApp. Sin formularios. Sin esperas. Hablas hoy mismo.' },
]

export default function HowItWorks() {
  return (
    /* Forzamos el fondo oscuro que ves en localhost directamente aquí */
    <section className="how section" style={{ backgroundColor: '#1A113C', position: 'relative', overflow: 'hidden', padding: '100px 0' }}>
      <div className="how__bg-orb how__bg-orb--1" aria-hidden="true" />
      <div className="how__bg-orb how__bg-orb--2" aria-hidden="true" />
      
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="how__header" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p className="eyebrow how__eyebrow" style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.20)', color: '#EBE5FF' }}>
            Simple y rápido
          </p>
          <h2 className="d-xl how__title" style={{ color: '#FFFFFF', marginTop: '16px', fontSize: 'clamp(32px, 5vw, 64px)' }}>
            ¿Cómo funciona?
          </h2>
          <p className="t-lg how__lead" style={{ color: '#EBE5FF', maxWidth: '600px', margin: '16px auto 0', opacity: 0.9 }}>
            De "no sé a quién llamar" a hablar con alguien de confianza en tres pasos.
          </p>
        </div>

        <div className="how__steps" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px' 
        }}>
          {steps.map((s, i) => (
            <div key={s.n} className="how-step" style={{ 
              position: 'relative',
              padding: '40px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '32px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="how-step__num" style={{ 
                color: 'rgba(255, 255, 255, 0.1)', 
                fontSize: '64px', 
                fontWeight: '900',
                position: 'absolute',
                top: '20px',
                right: '32px'
              }}>
                {s.n}
              </div>
              
              <div className="how-step__icon" aria-hidden="true" style={{ fontSize: '40px', marginBottom: '24px' }}>
                {s.icon}
              </div>
              
              <h3 className="how-step__title" style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
                {s.title}
              </h3>
              
              <p className="how-step__body t-md" style={{ color: '#EBE5FF', lineHeight: '1.6', opacity: 0.8 }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}