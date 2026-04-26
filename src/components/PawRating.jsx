// src/components/PawRating.jsx — rating visual con huellitas
import './PawRating.css'

// ── Color semántico según rating ─────────────────────────────────
function pawColor(rating) {
  if (rating >= 4.0) return '#2E7D32'  // verde
  if (rating >= 3.0) return '#F9A825'  // amarillo
  if (rating >= 2.0) return '#E65100'  // naranja
  return '#C62828'                      // rojo
}

// ── Microcopy emocional ───────────────────────────────────────────
function pawLabel(rating) {
  if (rating >= 4.5) return 'La manada lo respalda'
  if (rating >= 4.0) return 'Muy buena experiencia'
  if (rating >= 3.0) return 'Buena experiencia'
  if (rating >= 2.0) return 'Puede mejorar'
  return 'Cuidado'
}

// SVG de huella como path para poder hacer clip parcial
// filled: color activo (string hex o 'currentColor')
// La huella vacía siempre es gris neutro fijo, sin heredar el color activo
function PawSvg({ fill = 1, size = 16, filledColor = 'currentColor' }) {
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
      {/* Huella vacía — gris neutro fijo, no hereda el color activo */}
      <g>
        <ellipse cx="16" cy="25" rx="8" ry="5.5" fill="#BDBDBD" opacity="0.20"/>
        <ellipse cx="4.5" cy="15" rx="3.2" ry="4" transform="rotate(-25,4.5,15)" fill="#BDBDBD" opacity="0.20"/>
        <ellipse cx="11" cy="8" rx="3.2" ry="4" transform="rotate(-10,11,8)" fill="#BDBDBD" opacity="0.20"/>
        <ellipse cx="21" cy="8" rx="3.2" ry="4" transform="rotate(10,21,8)" fill="#BDBDBD" opacity="0.20"/>
        <ellipse cx="27.5" cy="15" rx="3.2" ry="4" transform="rotate(25,27.5,15)" fill="#BDBDBD" opacity="0.20"/>
      </g>
      {/* Huella rellena — color activo, clipeado según fill 0–1 */}
      <g clipPath={`url(#${id})`}>
        <ellipse cx="16" cy="25" rx="8" ry="5.5" fill={filledColor}/>
        <ellipse cx="4.5" cy="15" rx="3.2" ry="4" transform="rotate(-25,4.5,15)" fill={filledColor}/>
        <ellipse cx="11" cy="8" rx="3.2" ry="4" transform="rotate(-10,11,8)" fill={filledColor}/>
        <ellipse cx="21" cy="8" rx="3.2" ry="4" transform="rotate(10,21,8)" fill={filledColor}/>
        <ellipse cx="27.5" cy="15" rx="3.2" ry="4" transform="rotate(25,27.5,15)" fill={filledColor}/>
      </g>
    </svg>
  )
}

// rating:    número 0–5 (ej: 4.3)
// count:     nro de evaluaciones
// size:      'sm' | 'md'
// interactive: si es clickeable (para el modal)
// showLabel: muestra el microcopy emocional (default false)
// onSelect:  callback(n) cuando clickean una huella
export default function PawRating({
  rating = 0,
  count,
  size = 'md',
  interactive = false,
  hovered = 0,
  showLabel = false,
  onSelect,
  onHover,
  onLeave,
}) {
  const pawSize = size === 'sm' ? 14 : 18

  // El rating efectivo para calcular color: en interactivo usa hover si existe
  const effectiveRating = interactive ? (hovered || rating) : rating
  const activeColor = effectiveRating > 0 ? pawColor(effectiveRating) : '#BDBDBD'

  return (
    <div
      className={`paw-rating paw-rating--${size}${interactive ? ' paw-rating--interactive' : ''}`}
      style={{ color: activeColor }}
    >
      <div className="paw-rating__paws">
        {[1, 2, 3, 4, 5].map(n => {
          const fill = interactive
            ? (hovered >= n ? 1 : (rating >= n ? 1 : 0))
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
              <PawSvg fill={fill} size={pawSize} filledColor={activeColor} />
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

      {showLabel && effectiveRating > 0 && (
        <span className="paw-rating__label">{pawLabel(effectiveRating)}</span>
      )}
    </div>
  )
}
