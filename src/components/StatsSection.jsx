import { Users, CalendarDays, LayoutGrid, ShieldCheck } from 'lucide-react'
import './StatsSection.css'

const stats = [
  { value: '+500', label: 'miembros en la comunidad', Icon: Users        },
  { value: '2',    label: 'años acompañando',          Icon: CalendarDays },
  { value: '9',    label: 'categorías activas',         Icon: LayoutGrid   },
  { value: '5',    label: 'proveedores verificados',    Icon: ShieldCheck  },
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
