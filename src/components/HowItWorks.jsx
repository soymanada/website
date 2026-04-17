// src/components/HowItWorks.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './HowItWorks.css'

const STEPS = [
  {
    n: '01',
    img: '/images/oso%20nandy%20usable.jpg',
    imgAltKey: 'how_it_works.img_bear_alt',
    titleKey:  'how_it_works.step1_title',
    bodyKey:   'how_it_works.step1_body',
  },
  {
    n: '02',
    img: '/images/pajaro%20nandy%20(usable).jpg',
    imgAltKey: 'how_it_works.img_bird_alt',
    titleKey:  'how_it_works.step2_title',
    bodyKey:   'how_it_works.step2_body',
  },
  {
    n: '03',
    img: '/images/pajaro%20nandy%20usable%20otro.jpg',
    imgAltKey: 'how_it_works.img_bird2_alt',
    titleKey:  'how_it_works.step3_title',
    bodyKey:   'how_it_works.step3_body',
  },
]

// Nature photos — identity / sense of place (decorative strip, not primary)
const NATURE = [
  { src: '/images/zorro%20nandy%20usable.jpg',           altKey: 'how_it_works.img_fox_alt',   labelKey: 'how_it_works.label_fox'   },
  { src: '/images/auroras%20boreales%20nandy%20usable.jpg', altKey: 'how_it_works.img_aurora_alt', labelKey: 'how_it_works.label_aurora' },
  { src: '/images/buho%20nandy%20usable.jpg',             altKey: 'how_it_works.img_owl_alt',   labelKey: 'how_it_works.label_owl'   },
]

export default function HowItWorks() {
  const { t } = useTranslation()
  const [lightbox, setLightbox] = useState(null)

  return (
    <section className="how section">
      <div className="how__bg-orb how__bg-orb--1" aria-hidden="true" />
      <div className="how__bg-orb how__bg-orb--2" aria-hidden="true" />

      <div className="container how__inner">
        {/* Header */}
        <div className="how__header">
          <p className="eyebrow how__eyebrow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor"
              width="13" height="13" aria-hidden="true">
              <polygon points="2,13 30,16 2,2"/>
              <polygon points="2,19 30,16 2,30"/>
            </svg>
            {t('how_it_works.eyebrow')}
          </p>
          <h2 className="d-xl how__title">{t('how_it_works.title')}</h2>
          <p className="t-lg how__lead">{t('how_it_works.lead')}</p>
        </div>

        {/* Steps — alternating image/text rows */}
        <div className="how__steps">
          {STEPS.map((s, i) => (
            <div key={s.n} className={`how-row${i % 2 === 1 ? ' how-row--reverse' : ''}`}>
              <div className="how-row__text">
                <span className="how-row__num" aria-hidden="true">{s.n}</span>
                <h3 className="how-row__title">{t(s.titleKey)}</h3>
                <p  className="how-row__body">{t(s.bodyKey)}</p>
              </div>
              <div className="how-row__img-wrap">
                <img
                  src={s.img}
                  alt={t(s.imgAltKey)}
                  className="how-row__img"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Nature identity strip */}
        <div className="how__nature" aria-label={t('how_it_works.nature_strip_label')}>
          {NATURE.map(n => (
            <button
              key={n.src}
              className="how__nature-item"
              onClick={() => setLightbox({ src: n.src, alt: t(n.altKey) })}
              aria-label={t(n.altKey)}
            >
              <img
                src={n.src}
                alt={t(n.altKey)}
                className="how__nature-img"
                loading="lazy"
              />
              <span className="how__nature-zoom" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </span>
              <span className="how__nature-label" aria-hidden="true">
                {t(n.labelKey)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="how__lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          <button className="how__lightbox-close" onClick={() => setLightbox(null)} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="how__lightbox-img"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}
