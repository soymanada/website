// src/components/ManadaStories.jsx
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import CommunityPhotoModal from './CommunityPhotoModal'
import './ManadaStories.css'

const STORIES = [
  { key: 'cristobal', img: '/images/story-cristobal-calgary.jpg' },
  { key: 'valeria',   img: '/images/story-valeria-banff.jpg'     },
  { key: 'nandy',     img: '/images/story-nandy-quebec.jpg'      },
  { key: 'daniela',   img: '/images/story-daniela-toronto.jpg'   },
  { key: 'hugo',      img: '/images/story-hugo-banff.jpg'        },
  { key: 'claudia',   img: '/images/story-claudia-sunpeaks.jpg'  },
  { key: 'amelia',    img: '/images/story-Amelia-nova.jpg'       },
]

export default function ManadaStories() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const trackRef = useRef(null)
  const [lightbox,    setLightbox]    = useState(null)
  const [showPhotoModal, setShowPhotoModal] = useState(false)

  const scroll = (dir) => {
    if (!trackRef.current) return
    const card = trackRef.current.querySelector('.mstory-card')
    if (!card) return
    trackRef.current.scrollBy({ left: dir * (card.offsetWidth + 20), behavior: 'smooth' })
  }

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
          <button className="mstories__share-btn" onClick={() => setShowPhotoModal(true)}>
            {t('community_photos.cta')}
          </button>
        </div>

        <div className="mstories__carousel">
          <button className="mstories__arrow mstories__arrow--prev" onClick={() => scroll(-1)} aria-label="Anterior">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div className="mstories__track" ref={trackRef}>
            {STORIES.map(s => (
              <article key={s.key} className="mstory-card">
                <button
                  className="mstory-card__img-wrap"
                  onClick={() => setLightbox({ src: s.img, alt: t(`manadaStories.items.${s.key}.alt`) })}
                  aria-label={t(`manadaStories.items.${s.key}.alt`)}
                >
                  <img
                    src={s.img}
                    alt={t(`manadaStories.items.${s.key}.alt`)}
                    className="mstory-card__img"
                    loading="lazy"
                  />
                  <span className="mstory-card__zoom" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                  </span>
                </button>
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

          <button className="mstories__arrow mstories__arrow--next" onClick={() => scroll(1)} aria-label="Siguiente">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <CommunityPhotoModal
        open={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        userId={user?.id}
      />

      {lightbox && (
        <div className="mstories__lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          <button className="mstories__lightbox-close" onClick={() => setLightbox(null)} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="mstories__lightbox-img"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}
