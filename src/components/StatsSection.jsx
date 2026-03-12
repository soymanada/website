import './StatsSection.css'

const stats = [
  { value: '+2.000', label: 'personas ayudadas',         icon: '🤝' },
  { value: '12',     label: 'proveedores verificados',   icon: '✦' },
  { value: '6',      label: 'categorías activas',        icon: '📂' },
  { value: '100%',   label: 'gratuito para ti',          icon: '🆓' },
]

export default function StatsSection() {
  return (
    <section className="stats">
      <div className="container">
        <div className="stats__grid">
          {stats.map((s, i) => (
            <div key={i} className="stat">
              <span className="stat__icon" aria-hidden="true">{s.icon}</span>
              <span className="stat__val">{s.value}</span>
              <span className="stat__label t-sm">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
