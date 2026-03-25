// src/components/dashboard/WeeklyActivity.jsx
// Componente 2 — Actividad por día de semana (barras CSS, sin librería externa)
import './WeeklyActivity.css'

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

// Índice ISO → índice display (lunes=0)
// Supabase devuelve dow: 0=domingo..6=sábado → remapeamos a lunes=0
function remapDow(dow) {
  return dow === 0 ? 6 : dow - 1
}

export default function WeeklyActivity({ activity, loading }) {
  // activity: array de { dow: 0-6, views: n, contacts: n }
  // Construimos estructura normalizada 0-6 (lun-dom)
  const data = Array.from({ length: 7 }, (_, i) => {
    const day = activity?.find(d => remapDow(d.dow) === i)
    return { views: day?.views ?? 0, contacts: day?.contacts ?? 0 }
  })

  const maxVal = Math.max(...data.map(d => Math.max(d.views, d.contacts)), 1)

  if (loading) return (
    <div className="wact">
      <div className="wact__bars">
        {DAYS.map(d => (
          <div key={d} className="wact__col">
            <div className="wact__bar-group">
              <div className="wact__bar wact__bar--skeleton" style={{ height: `${20 + Math.random() * 60}%` }} />
              <div className="wact__bar wact__bar--skeleton" style={{ height: `${10 + Math.random() * 40}%` }} />
            </div>
            <span className="wact__day t-xs">{d}</span>
          </div>
        ))}
      </div>
      <div className="wact__legend">
        <span className="wact__dot wact__dot--views" /> <span className="t-xs">Visitas</span>
        <span className="wact__dot wact__dot--contacts" /> <span className="t-xs">Contactos</span>
      </div>
    </div>
  )

  return (
    <div className="wact">
      <div className="wact__bars">
        {data.map((d, i) => (
          <div key={i} className="wact__col">
            <div className="wact__bar-group">
              <div
                className="wact__bar wact__bar--views"
                style={{ height: `${(d.views / maxVal) * 100}%` }}
                title={`${d.views} visitas`}
              />
              <div
                className="wact__bar wact__bar--contacts"
                style={{ height: `${(d.contacts / maxVal) * 100}%` }}
                title={`${d.contacts} contactos`}
              />
            </div>
            <span className="wact__day t-xs">{DAYS[i]}</span>
          </div>
        ))}
      </div>
      <div className="wact__legend">
        <span className="wact__dot wact__dot--views" /> <span className="t-xs">Visitas</span>
        <span className="wact__dot wact__dot--contacts" /> <span className="t-xs">Contactos</span>
      </div>
    </div>
  )
}
