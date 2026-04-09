// src/components/ManadaStories.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './ManadaStories.css'

const PEOPLE = [
  { id: 'cristobal', name: 'Cristóbal', city: 'Calgary, AB', handle: '@obalgaratek', photo: '/community/story-cristobal-calgary.jpg', quoteKey: 'community.cristobal_quote' },
  { id: 'valeria',   name: 'Valeria',   city: 'Banff, AB',   handle: null,            photo: '/community/story-valeria-banff.jpg',    quoteKey: 'community.valeria_quote'   },
  { id: 'nandy',     name: 'Nandy',     city: 'Quebec, QC',  handle: null,            photo: '/community/story-nandy-quebec.jpg',     quoteKey: 'community.nandy_quote'     },
]

export default function ManadaStories() {
  const { t } = useTranslation()
  const [active, setActive] = useState(0)

  return (
    <section className="mstories" aria-label={t('community.title')}>
      <div className="container mstories__inner">

        <div className="mstories__header">
          <p className="mstories__eyebrow">{t('community.eyebrow')}</p>
          <h2 className="mstories__title">{t('community.title')}</h2>
          <p className="mstories__sub">{t('community.sub')}</p>
        </div>

        <div className="mstories__cards" role="list">
          {PEOPLE.map((s, i) => (
            <article key={s.id} className="mstories__card" role="listitem" aria-label={s.name}>
              <div className="mstories__photo-wrap">
                <img src={s.photo} alt={`${s.name} · ${s.city}`} className="mstories__photo" loading="lazy" />
                <div className="mstories__photo-overlay">
                  <span className="mstories__name">{s.name}</span>
                  <span className="mstories__city">{s.city}</span>
                  {s.handle && <span className="mstories__handle">{s.handle}</span>}
                </div>
              </div>
              <blockquote className="mstories__quote">
                <span className="mstories__quote-mark" aria-hidden="true">"</span>
                {t(s.quoteKey)}
              </blockquote>
            </article>
          ))}
        </div>

        <div className="mstories__indicators" role="tablist" aria-label={t('community.title')}>
          {PEOPLE.map((s, i) => (
            <button key={s.id} role="tab" aria-selected={active === i} aria-label={s.name}
              className={`mstories__dot${active === i ? ' mstories__dot--on' : ''}`}
              onClick={() => setActive(i)} />
          ))}
        </div>

      </div>
    </section>
  )
}
