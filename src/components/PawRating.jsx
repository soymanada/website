// src/components/PawRating.jsx — rating visual con huellitas
import './PawRating.css'

// SVG de huella como path para poder hacer clip parcial
function PawSvg({ fill = 1, size = 16 }) {
  const id = `paw-clip-${Math.random().toString(36).slice(2)}`
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 32 32"
      className="paw-rating__svg"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width={32 * fill} height="32" />
        </clipPath>
      </defs>
      {/* Huella vacía (fondo) */}
      <g opacity="0.18">
        <ellipse cx="16" cy="25" rx="8" ry="5.5" fill="currentColor"/>
        <ellipse cx="4.5" cy="15" rx="3.2" ry="4" transform="rotate(-25,4.5,15)" fill="currentColor"/>
        <ellipse cx="11" cy="8" rx="3.2" ry="4" transform="rotate(-10,11,8)" fill="currentColor"/>
        <ellipse cx="21" cy="8" rx="3.2" ry="4" transform="rotate(10,21,8)" fill="currentColor"/>
        <ellipse cx="27.5" cy="15" rx="3.2" ry="4" transform="rotate(25,27.5,15)" fill="currentColor"/>
      </g>
      {/* Huella rellena (clip según fill 0–1) */}
      <g clipPath={`url(#${id})`}>
        <ellipse cx="16" cy="25" rx="8" ry="5.5" fill="currentColor"/>
        <ellipse cx="4.5" cy="15" rx="3.2" ry="4" transform="rotate(-25,4.5,15)" fill="currentColor"/>
        <ellipse cx="11" cy="8" rx="3.2" ry="4" transform="rotate(-10,11,8)" fill="currentColor"/>
        <ellipse cx="21" cy="8" rx="3.2" ry="4" transform="rotate(10,21,8)" fill="currentColor"/>
        <ellipse cx="27.5" cy="15" rx="3.2" ry="4" transform="rotate(25,27.5,15)" fill="currentColor"/>
      </g>
    </svg>
  )
}

// rating: número 0–5 (ej: 4.3)
// count:  nro de evaluaciones
// size:   'sm' | 'md'
// interactive: si es clickeable (para el modal)
// onSelect: callback(n) cuando clickean una huella
export default function PawRating({
  rating = 0,
  count,
  size = 'md',
  interactive = false,
  hovered = 0,
  onSelect,
  onHover,
  onLeave,
}) {
  const pawSize = size === 'sm' ? 14 : 18

  return (
    <div className={`paw-rating paw-rating--${size}${interactive ? ' paw-rating--interactive' : ''}`}>
      <div className="paw-rating__paws">
        {[1, 2, 3, 4, 5].map(n => {
          const fill = interactive
            ? (hovered >= n ? 1 : 0)
            : Math.min(1, Math.max(0, rating - (n - 1)))
          return (
            <button
              key={n}
              type="button"
              className="paw-rating__btn"
              disabled={!interactive}
              onClick={() => interactive && onSelect?.(n)}
              onMouseEnter={() => interactive && onHover?.(n)}
              onMouseLeave={() => interactive && onLeave?.()}
              aria-label={`${n} huella${n > 1 ? 's' : ''}`}
            >
              <PawSvg fill={fill} size={pawSize} />
            </button>
          )
        })}
      </div>
      {rating > 0 && (
        <span className="paw-rating__score">{rating.toFixed(1)}</span>
      )}
      {count != null && (
        <span className="paw-rating__count">({count})</span>
      )}
    </div>
  )
}
