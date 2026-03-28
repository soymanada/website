import { useEffect, useState } from 'react'
import { Users, CalendarDays, LayoutGrid, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './StatsSection.css'

const TICKER_COUNT = 5

export default function StatsSection() {
  const { t } = useTranslation()
  const [tickerIdx, setTickerIdx] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setTickerIdx(i => (i + 1) % TICKER_COUNT)
        setFade(true)
      }, 350)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    { value: '+500', labelKey: 'stats.members',   Icon: Users        },
    { value: '2',    labelKey: 'stats.years',      Icon: CalendarDays },
    { value: '11',   labelKey: 'stats.categories', Icon: LayoutGrid   },
    { value: '12',   labelKey: 'stats.providers',  Icon: ShieldCheck  },
  ]

  return (
    <section className="stats">
      <div className="container">

        {/* Social proof ticker */}
        <div className="stats__ticker">
          <span className="stats__ticker-dot" aria-hidden="true" />
          <span
            className={`stats__ticker-text ${fade ? 'stats__ticker-text--in' : 'stats__ticker-text--out'}`}
          >
            {t(`stats.ticker_${tickerIdx}`)}
          </span>
        </div>

        {/* Stats grid */}
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
