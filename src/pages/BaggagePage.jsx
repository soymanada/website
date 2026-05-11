import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import data from '../data/baggage.json'
import './BaggagePage.css'

const { items, airlines } = data

function feeColor(display, from) {
  if (from === 9999 || from === 999) return 'bag__fee-amount--na'
  if (from === 0) return 'bag__fee-amount--free'
  return ''
}

export default function BaggagePage() {
  const { t } = useTranslation()
  const [selectedItem, setSelectedItem] = useState(null)

  const selected = items.find(i => i.slug === selectedItem)

  const sorted = selectedItem
    ? [...airlines].sort((a, b) => {
        const fa = a.fees[selectedItem]?.from ?? 9999
        const fb = b.fees[selectedItem]?.from ?? 9999
        return fa - fb
      })
    : airlines

  return (
    <main>
      {/* Hero */}
      <section className="bag__hero">
        <div className="bag__hero-orb" />
        <div className="container">
          <span className="bag__badge">✈️ Herramienta gratuita</span>
          <h1 className="d-md bag__title">Simulador de equipaje</h1>
          <p className="t-lg bag__sub">
            Consulta los costos de equipaje extra, instrumentos, bicicletas y mascotas
            en las principales aerolineas con rutas desde Latinoamérica.
          </p>
          <div className="bag__disclaimer">
            <span className="bag__disclaimer-icon">⚠️</span>
            <span>
              Las tarifas son aproximadas y pueden cambiar. Siempre confirma con la aerolinea
              antes de volar — los precios varían según ruta, fecha y tarifa contratada.
            </span>
          </div>
        </div>
      </section>

      {/* Simulator */}
      <section className="bag__simulator">
        <div className="container">

          {/* Item selector */}
          <p className="bag__item-label">¿Qué necesitas llevar?</p>
          <div className="bag__item-chips">
            {items.map(item => (
              <button
                key={item.slug}
                className={`bag__item-chip${selectedItem === item.slug ? ' bag__item-chip--active' : ''}`}
                onClick={() => setSelectedItem(selectedItem === item.slug ? null : item.slug)}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Selected item header */}
          {selected && (
            <div className="bag__selected-item">
              <div className="bag__selected-emoji">{selected.emoji}</div>
              <div>
                <p className="t-base bag__selected-name">{selected.label}</p>
                <p className="bag__selected-desc">{selected.desc}</p>
              </div>
            </div>
          )}

          {/* Cards */}
          {selectedItem ? (
            <div className="bag__grid">
              {sorted.map(airline => {
                const fee = airline.fees[selectedItem]
                if (!fee) return null
                const colorClass = feeColor(fee.display, fee.from)
                return (
                  <div key={airline.slug} className="bag__card">
                    <div className="bag__card-header">
                      <div>
                        <p className="bag__card-airline">{airline.name}</p>
                        <p className="bag__card-routes">{airline.hub} · {airline.routes}</p>
                      </div>
                      <div className="bag__card-fee">
                        <p className={`bag__fee-amount ${colorClass}`}>{fee.display}</p>
                      </div>
                    </div>

                    <div className="bag__card-divider" />

                    <p className="bag__card-limits">
                      <span className="bag__card-limits-icon">📐</span>
                      {fee.limits}
                    </p>
                    <p className="bag__card-note">{fee.note}</p>

                    <a
                      href={airline.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bag__card-link"
                    >
                      Ver tarifas oficiales →
                    </a>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bag__prompt">
              <div className="bag__prompt-icon">🧳</div>
              <p className="t-lg">Selecciona un ítem arriba para ver los costos por aerolinea.</p>
            </div>
          )}

        </div>
      </section>
    </main>
  )
}
