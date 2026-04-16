// src/components/HowItWorks.jsx
import { useTranslation } from 'react-i18next'
import './HowItWorks.css'

// Human photos paired with each step (community / belonging)
const STEPS = [
  {
    n: '01',
    img: '/images/nandy%202.jpg',
    imgAltKey: 'how_it_works.img_nandy_work_alt',
    titleKey:  'how_it_works.step1_title',
    bodyKey:   'how_it_works.step1_body',
  },
  {
    n: '02',
    img: '/images/cristobal%202.jpg',
    imgAltKey: 'how_it_works.img_waterfall_alt',
    titleKey:  'how_it_works.step2_title',
    bodyKey:   'how_it_works.step2_body',
  },
  {
    n: '03',
    img: '/images/nandy%203.jpg',
    imgAltKey: 'how_it_works.img_person3_alt',
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
            <div key={n.src} className="how__nature-item">
              <img
                src={n.src}
                alt={t(n.altKey)}
                className="how__nature-img"
                loading="lazy"
              />
              <span className="how__nature-label" aria-hidden="true">
                {t(n.labelKey)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
