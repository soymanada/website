import { Users, CalendarDays, LayoutGrid, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './StatsSection.css'

export default function StatsSection() {
  const { t } = useTranslation()
  const stats = [
    { value: '+500', labelKey: 'stats.members',    Icon: Users        },
    { value: '2',    labelKey: 'stats.years',       Icon: CalendarDays },
    { value: '9',    labelKey: 'stats.categories',  Icon: LayoutGrid   },
    { value: '7',    labelKey: 'stats.providers',   Icon: ShieldCheck  },
  ]
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
              <span className="stat__label t-sm">{t(s.labelKey)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
