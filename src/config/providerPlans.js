// src/config/providerPlans.js
// Fuente única de verdad para nombres visibles y precios de planes de proveedor.
// Las keys internas (bronze / silver / gold) no cambian — solo la capa visible.

export const PROVIDER_PLANS = {
  bronze: {
    code:     'bronze',
    uiName:   'Wonderer',
    icon:     '✨',
    priceCLP: 0,
    priceUSD: 0,
  },
  silver: {
    code:     'silver',
    uiName:   'Cub',
    icon:     '🐾',
    priceCLP: 4990,
    priceUSD: 5,
  },
  gold: {
    code:     'gold',
    uiName:   'Wolf',
    icon:     '🐺',
    priceCLP: 9990,
    priceUSD: 10,
  },
}

/** Orden numérico para sorting: mayor = mejor tier */
export const TIER_RANK = { gold: 3, silver: 2, bronze: 1 }

/**
 * Devuelve el nombre visible de un tier dado su código interno.
 * Fallback al código capitalizado si no existe.
 */
export function planUiName(tierCode) {
  return PROVIDER_PLANS[tierCode]?.uiName
    ?? (tierCode ? tierCode.charAt(0).toUpperCase() + tierCode.slice(1) : null)
}
