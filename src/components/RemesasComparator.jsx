// src/components/RemesasComparator.jsx
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { REMESAS_PLATFORMS, CURRENCY_PAIRS, ORIGIN_CURRENCIES } from '../data/remesas.config'
import './RemesasComparator.css'

function SkeletonRow() {
  return (
    <tr className="remcomp__row">
      <td><div className="remcomp__skel remcomp__skel--name" /></td>
      <td><div className="remcomp__skel remcomp__skel--rate" /></td>
      <td><div className="remcomp__skel remcomp__skel--amount" /></td>
      <td><div className="remcomp__skel remcomp__skel--btn" /></td>
    </tr>
  )
}

export default function RemesasComparator() {
  const { t } = useTranslation()

  const [fromCurrency, setFromCurrency] = useState('CAD')
  const [toCurrency,   setToCurrency]   = useState(CURRENCY_PAIRS[0].code)
  const [amount,       setAmount]       = useState(500)
  const [rates,        setRates]        = useState(null)
  const [status,       setStatus]       = useState('loading') // loading | error | ready

  // Fetch se repite solo cuando cambia la moneda de origen
  const fetchRates = useCallback(async () => {
    setStatus('loading')
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`)
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      setRates(data.rates)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [fromCurrency])

  useEffect(() => { fetchRates() }, [fetchRates])

  const numericAmount = Math.max(0, parseFloat(amount) || 0)

  const rows = rates
    ? [...REMESAS_PLATFORMS]
        .map(p => {
          const base      = rates[toCurrency] ?? 0
          const effective = base * (1 - p.spread)
          return { ...p, effective, received: numericAmount * effective }
        })
        .sort((a, b) => b.received - a.received)
    : []

  const fmtReceived = (val) =>
    new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(val)

  const fmtRate = (rate) =>
    new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(rate)

  const originLabel = ORIGIN_CURRENCIES.find(c => c.code === fromCurrency)?.code ?? fromCurrency

  return (
    <div className="remcomp">
      <div className="remcomp__header">
        <h2 className="remcomp__title d-md">{t('remesas_comp.title')}</h2>
        <span className="remcomp__updated t-xs">{t('remesas_comp.updated')}</span>
      </div>

      {/* Controles */}
      <div className="remcomp__controls">
        <div className="remcomp__control-group">
          <label className="remcomp__label t-xs">{t('remesas_comp.from_currency_label')}</label>
          <select
            className="remcomp__select"
            value={fromCurrency}
            onChange={e => setFromCurrency(e.target.value)}
          >
            {ORIGIN_CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.label} ({c.code})</option>
            ))}
          </select>
        </div>

        <div className="remcomp__control-group">
          <label className="remcomp__label t-xs">{t('remesas_comp.amount_label')}</label>
          <div className="remcomp__amount-wrap">
            <span className="remcomp__prefix">{fromCurrency} $</span>
            <input
              type="number"
              className="remcomp__amount-input"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="1"
              step="50"
            />
          </div>
        </div>

        <div className="remcomp__control-group">
          <label className="remcomp__label t-xs">{t('remesas_comp.to_currency_label')}</label>
          <select
            className="remcomp__select"
            value={toCurrency}
            onChange={e => setToCurrency(e.target.value)}
          >
            {CURRENCY_PAIRS.map(p => (
              <option key={p.code} value={p.code}>{p.label} ({p.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="remcomp__table-wrap">
        <table className="remcomp__table">
          <thead>
            <tr>
              <th>{t('remesas_comp.col_platform')}</th>
              <th>1 {originLabel} =</th>
              <th>{t('remesas_comp.col_receive')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {status === 'loading' && [0, 1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}

            {status === 'error' && (
              <tr>
                <td colSpan={4} className="remcomp__error-cell">
                  <p className="t-sm">{t('remesas_comp.error')}</p>
                  <button className="remcomp__retry-btn" onClick={fetchRates}>
                    {t('remesas_comp.retry')}
                  </button>
                </td>
              </tr>
            )}

            {status === 'ready' && rows.map((p, i) => (
              <tr key={p.id} className={`remcomp__row${i === 0 ? ' remcomp__row--best' : ''}`}>
                <td className="remcomp__cell-name">
                  <span className="remcomp__platform-name">{p.name}</span>
                  {i === 0 && (
                    <span className="remcomp__badge remcomp__badge--best">
                      {t('remesas_comp.best_badge')}
                    </span>
                  )}
                  {p.label && (
                    <span className="remcomp__badge remcomp__badge--promo">{p.label}</span>
                  )}
                </td>
                <td className="remcomp__cell-rate">
                  {fmtRate(p.effective)} {toCurrency}
                </td>
                <td className="remcomp__cell-receive">
                  <strong>{fmtReceived(p.received)} {toCurrency}</strong>
                </td>
                <td className="remcomp__cell-cta">
                  <a
                    href={p.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="remcomp__cta-btn"
                  >
                    {t('remesas_comp.cta', { name: p.name })}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="remcomp__disclaimer t-xs">{t('remesas_comp.disclaimer')}</p>
    </div>
  )
}
