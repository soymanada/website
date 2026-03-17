// src/components/Hero.jsx
import { Link } from 'react-router-dom';
import { trackEvent, Events } from '../utils/analytics';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__mesh" aria-hidden="true">
        <div className="hero__mesh-orb hero__mesh-orb--1" />
        <div className="hero__mesh-orb hero__mesh-orb--2" />
        <div className="hero__mesh-orb hero__mesh-orb--3" />
      </div>

      <div className="hero__inner container">
        <div className="hero__content">
          <div className="eyebrow anim-fade-up">
            <span className="eyebrow-dot" />
            Comunidad latina conectando con talento local
          </div>

          <h1 className="d-2xl hero__headline anim-fade-up delay-1">
            Encuentra los servicios que <br />
            <em className="hero__headline-em">necesitas en un solo lugar.</em>
          </h1>

          <p className="t-lg hero__sub anim-fade-up delay-2">
            En SoyManada reunimos a profesionales y negocios que trabajan con la comunidad migrante hispanohablante. 
            Explora, revisa opciones y contacta directo.
          </p>

          <div className="hero__actions anim-fade-up delay-3">
            <Link
              to="/proveedores"
              className="btn btn-primary btn-lg"
              onClick={() => trackEvent(Events.CLICK_CATEGORIA, { origen: 'hero_primary' })}
            >
              Explorar proveedores
            </Link>
            <Link
              to="/#categorias"
              className="btn btn-secondary"
            >
              Ver categorías
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}