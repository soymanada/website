// src/components/PawIcon.jsx — huella SoyManada reutilizable
export default function PawIcon({ size = 14, className = '', style = {} }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="currentColor"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden="true"
    >
      <ellipse cx="16" cy="25" rx="8" ry="5.5"/>
      <ellipse cx="4.5" cy="15" rx="3.2" ry="4" transform="rotate(-25, 4.5, 15)"/>
      <ellipse cx="11" cy="8" rx="3.2" ry="4" transform="rotate(-10, 11, 8)"/>
      <ellipse cx="21" cy="8" rx="3.2" ry="4" transform="rotate(10, 21, 8)"/>
      <ellipse cx="27.5" cy="15" rx="3.2" ry="4" transform="rotate(25, 27.5, 15)"/>
    </svg>
  )
}
