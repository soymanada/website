import './HowItWorks.css'

const steps = [
  { n: '01', icon: '🗂️', title: 'Explora categorías', body: 'Seguros, migración, trabajo, alojamiento, idiomas. Todo ordenado, sin ruido.' },
  { n: '02', icon: '👤', title: 'Revisa el proveedor', body: 'Nombre, servicio, países, idiomas y si está verificado por la comunidad Manada.' },
  { n: '03', icon: '💬', title: 'Contáctalos directo', body: 'Un clic y abre WhatsApp. Sin formularios. Sin esperas. Hablas hoy mismo.' },
]

export default function HowItWorks() {
  return (
    <section className="how section">
      <div className="how__bg-orb how__bg-orb--1" aria-hidden="true" />
      <div className="how__bg-orb how__bg-orb--2" aria-hidden="true" />
      <div className="container">
        <div className="how__header">
          <p className="eyebrow how__eyebrow">Simple y rápido</p>
          <h2 className="d-xl how__title">¿Cómo funciona?</h2>
          <p className="t-lg how__lead">De "no sé a quién llamar" a hablar con alguien de confianza en tres pasos.</p>
        </div>

        <div className="how__steps">
          {steps.map((s, i) => (
            <div key={s.n} className="how-step">
              <div className="how-step__num">{s.n}</div>
              <div className="how-step__icon" aria-hidden="true">{s.icon}</div>
              <h3 className="how-step__title">{s.title}</h3>
              <p className="how-step__body t-md">{s.body}</p>
              {i < steps.length - 1 && (
                <div className="how-step__connector" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M14 6l6 6-6 6" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
