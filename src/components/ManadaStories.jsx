// src/components/ManadaStories.jsx
import { useState } from 'react'
import './ManadaStories.css'

const STORIES = [
  {
    id: 'cristobal',
    name: 'Cristóbal',
    city: 'Calgary, AB',
    handle: '@obalgaratek',
    photo: '/community/story-cristobal-calgary.jpg',
    quote:
      'Encontré trabajo en demolición en menos de dos semanas. Lo más difícil fue conseguir alojamiento y gestionar los pagos al llegar. La Manada me ayudó con toda la información de documentos antes de salir de Chile.',
  },
  {
    id: 'valeria',
    name: 'Valeria',
    city: 'Banff, AB',
    handle: null,
    photo: '/community/story-valeria-banff.jpg',
    quote:
      'Llegué desde El Bosque con inglés muy básico y mucho miedo. La Manada me dijo que simplemente me lanzara — y tenían razón. Acá lo aprendes mucho más rápido que en cualquier curso.',
  },
  {
    id: 'nandy',
    name: 'Nandy',
    city: 'Quebec, QC',
    handle: null,
    photo: '/community/story-nandy-quebec.jpg',
    quote:
      'Conseguí trabajo en cuidado infantil antes de salir de Chile. Llegué con todo organizado gracias a la Manada: seguro de viaje, orientación, logística. El francés era lo más difícil, pero una familia bilingüe me ayudó a adaptarme rápido.',
  },
]

export default function ManadaStories() {
  const [active, setActive] = useState(0)

  return (
    <section className="mstories" aria-label="Historias de la comunidad">
      <div className="container mstories__inner">

        {/* Header */}
        <div className="mstories__header">
          <p className="mstories__eyebrow">Comunidad real</p>
          <h2 className="mstories__title">Historias reales de la Manada en Canadá</h2>
          <p className="mstories__sub">
            No son estadísticas. Son personas como tú que ya dieron el paso.
          </p>
        </div>

        {/* Group photo */}
        <div className="mstories__photo-wrap">
          <img
            src="/community/community-junta-2025.png"
            alt="Encuentro de la comunidad SoyManada 2025"
            className="mstories__group-photo"
            loading="lazy"
          />
          <div className="mstories__photo-caption">Encuentro de la Manada · 2025</div>
        </div>

        {/* Story cards — desktop grid / mobile carousel */}
        <div className="mstories__cards" role="list">
          {STORIES.map((s, i) => (
            <article
              key={s.id}
              className={`mstories__card${active === i ? ' mstories__card--active' : ''}`}
              role="listitem"
              aria-label={`Historia de ${s.name}`}
            >
              <div className="mstories__card-top">
                <img
                  src={s.photo}
                  alt={`Foto de ${s.name}`}
                  className="mstories__avatar"
                  loading="lazy"
                />
                <div className="mstories__meta">
                  <span className="mstories__name">{s.name}</span>
                  <span className="mstories__city">{s.city}</span>
                  {s.handle && <span className="mstories__handle">{s.handle}</span>}
                </div>
              </div>
              <blockquote className="mstories__quote">
                <span className="mstories__quote-mark" aria-hidden="true">"</span>
                {s.quote}
              </blockquote>
            </article>
          ))}
        </div>

        {/* Mobile carousel indicators */}
        <div className="mstories__indicators" role="tablist" aria-label="Navegar historias">
          {STORIES.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={active === i}
              aria-label={`Historia de ${s.name}`}
              className={`mstories__dot${active === i ? ' mstories__dot--on' : ''}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
