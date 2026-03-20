import { ShieldCheck, LayoutGrid } from 'lucide-react'
import './StatsSection.css'

const stats = [
  { value: '12',  label: 'proveedores verificados', Icon: ShieldCheck },
  { value: '6',   label: 'categorías activas',       Icon: LayoutGrid  },
]

export default function StatsSection() {
  return (
    <section className="stats">
      <div className="container">
        <div className="stats__grid">
          {stats.map((s, i) => (
            <div key={i} className="stat">
              <span className="stat__icon" aria-hidden="true">
                <s.Icon size={24} strokeWidth={1.5} />
              </span>
              <span className="stat__val">{s.value}</span>
              <span className="stat__label t-sm">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
