// src/components/RemesasComparator.jsx
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { REMESAS_PLATFORMS, CURRENCY_PAIRS, ORIGIN_CURRENCIES } from '../data/remesas.config'
import './RemesasComparator.css'

// Unión de todas las monedas disponibles (origen + destino sin duplicados)
const ALL_CURRENCIES = [
  ...ORIGIN_CURRENCIES,
  ...CURRENCY_PAIRS.filter(
    p => !ORIGIN_CURRENCIES.some(o => o.code === p.code)
  ),
]

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
  const [toCurrency,   setToCurrency]   = useState('CLP')
  const [amount,       setAmount]       = useState(500)
  const [rates,        setRates]        = useState(null)
  const [status,       setStatus]       = useState('loading')

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

  // Swap: intercambia origen y destino
  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  // Si el usuario cambia origen y coincide con destino, ajusta destino
  const handleFromChange = (val) => {
    setFromCurrency(val)
    if (val === toCurrency) {
      const other = ALL_CURRENCIES.find(c => c.code !== val)
      if (other) setToCurrency(other.code)
    }
  }

  const handleToChange = (val) => {
    setToCurrency(val)
    if (val === fromCurrency) {
      const other = ALL_CURRENCIES.find(c => c.code !== val)
      if (other) setFromCurrency(other.code)
    }
  }

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

  const fromLabel = ALL_CURRENCIES.find(c => c.code === fromCurrency)?.code ?? fromCurrency

  return (
    <div className="remcomp">
      <div className="remcomp__header">
        <h2 className="remcomp__title d-md">{t('remesas_comp.title')}</h2>
        <span className="remcomp__updated t-xs">{t('remesas_comp.updated')}</span>
      </div>

      {/* Controles */}
      <div className="remcomp__controls">

        {/* Origen */}
        <div className="remcomp__control-group">
          <label className="remcomp__label t-xs">{t('remesas_comp.from_currency_label')}</label>
          <select
            className="remcomp__select"
            value={fromCurrency}
            onChange={e => handleFromChange(e.target.value)}
          >
            {ALL_CURRENCIES.map(c => (
              <option key={c.code} value={c.code} disabled={c.code === toCurrency}>
                {c.label} ({c.code})
              </option>
            ))}
          </select>
        </div>

        {/* Monto */}
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

        {/* Botón swap */}
        <button
          className="remcomp__swap-btn"
          onClick={handleSwap}
          title={t('remesas_comp.swap_tooltip')}
          aria-label={t('remesas_comp.swap_tooltip')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 16V4m0 0L3 8m4-4 4 4"/>
            <path d="M17 8v12m0 0 4-4m-4 4-4-4"/>
          </svg>
        </button>

        {/* Destino */}
        <div className="remcomp__control-group">
          <label className="remcomp__label t-xs">{t('remesas_comp.to_currency_label')}</label>
          <select
            className="remcomp__select"
            value={toCurrency}
            onChange={e => handleToChange(e.target.value)}
          >
            {ALL_CURRENCIES.map(c => (
              <option key={c.code} value={c.code} disabled={c.code === fromCurrency}>
                {c.label} ({c.code})
              </option>
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
              <th>1 {fromLabel} =</th>
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
