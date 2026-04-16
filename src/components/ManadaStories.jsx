// src/components/ManadaStories.jsx
import { useTranslation } from 'react-i18next'
import './ManadaStories.css'

const STORIES = [
  { key: 'daniela', img: '/images/story-daniela-toronto.jpg' },
  { key: 'hugo',    img: '/images/story-hugo-banff.jpg'      },
  { key: 'claudia', img: '/images/story-claudia-sunpeaks.jpg'},
  { key: 'amelia',  img: '/images/story-Amelia-nova.jpg'     },
]

export default function ManadaStories() {
  const { t } = useTranslation()

  return (
    <section className="mstories section">
      <div className="container">
        <div className="mstories__header">
          <p className="eyebrow mstories__eyebrow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor"
              width="13" height="13" aria-hidden="true">
              <polygon points="2,13 30,16 2,2"/>
              <polygon points="2,19 30,16 2,30"/>
            </svg>
            {t('manadaStories.eyebrow')}
          </p>
          <h2 className="d-xl mstories__title">{t('manadaStories.title')}</h2>
          <p className="t-lg mstories__subtitle">{t('manadaStories.subtitle')}</p>
        </div>

        <div className="mstories__track">
          {STORIES.map(s => (
            <article key={s.key} className="mstory-card">
              <div className="mstory-card__img-wrap">
                <img
                  src={s.img}
                  alt={t(`manadaStories.items.${s.key}.alt`)}
                  className="mstory-card__img"
                  loading="lazy"
                />
              </div>
              <div className="mstory-card__body">
                <div className="mstory-card__meta">
                  <strong className="mstory-card__name">
                    {t(`manadaStories.items.${s.key}.name`)}
                  </strong>
                  <span className="mstory-card__location">
                    {t(`manadaStories.items.${s.key}.location`)}
                  </span>
                </div>
                <p className="mstory-card__quote">
                  &ldquo;{t(`manadaStories.items.${s.key}.quote`)}&rdquo;
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
