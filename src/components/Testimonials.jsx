// src/components/Testimonials.jsx
import './Testimonials.css'

const ITEMS = [
  { text: 'Este grupo me salvó literal cuando llegué. Los datos de arriendo son oro puro.', name: 'Diego V.', city: 'Vancouver' },
  { text: 'Por fin un lugar donde los proveedores no te intentan estafar. Gracias Manada.', name: 'Sofía R.', city: 'Calgary' },
  { text: 'El comparador de remesas me ahorró 40 dólares en mi primer envío. 10/10.', name: 'Martín G.', city: 'Montreal' },
  { text: 'Llegué sin conocer a nadie y la comunidad me conectó con trabajo en dos semanas.', name: 'Valentina M.', city: 'Toronto' },
  { text: 'Las guías de primeros pasos son las más claras que encontré. Sin letra chica.', name: 'Rodrigo S.', city: 'Ottawa' },
]

export default function Testimonials() {
  return (
    <section className="tst">
      <div className="container">
        <p className="tst__eyebrow">🐾 La Manada habla</p>
        <h2 className="tst__title">Lo que dice nuestra comunidad</h2>
        <div className="tst__track">
          {ITEMS.map((t, i) => (
            <article key={i} className="tst__card">
              <p className="tst__text">"{t.text}"</p>
              <footer className="tst__footer">
                <span className="tst__paw" aria-hidden="true">🐾</span>
                <div>
                  <strong className="tst__name">{t.name}</strong>
                  <span className="tst__city">{t.city}</span>
                </div>
              </footer>
            </article>
          ))}
        </div>
        <div className="tst__dots" aria-hidden="true">
          {ITEMS.map((_, i) => <span key={i} className="tst__dot" />)}
        </div>
      </div>
    </section>
  )
}
