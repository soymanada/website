// src/data/remesas.config.js — configuración central del comparador de remesas
// Actualizar aquí cuando lleguen los links de afiliado reales.

export const REMESAS_PLATFORMS = [
  {
    id: 'wise',
    name: 'Wise',
    spread: 0.005,
    label: null,
    affiliateUrl: 'https://wise.com/invite', // reemplazar con link Partnerize cuando llegue
  },
  {
    id: 'global66',
    name: 'Global66',
    spread: 0.01,
    label: null,
    affiliateUrl: 'https://global66.com', // reemplazar con link afiliado cuando llegue
  },
  {
    id: 'remitly',
    name: 'Remitly',
    spread: 0.015,
    label: 'Promo primer envío',
    affiliateUrl: 'https://remitly.com',
  },
  {
    id: 'currencybird',
    name: 'CurrencyBird',
    spread: 0.012,
    label: null,
    affiliateUrl: 'https://currencybird.cl',
  },
  {
    id: 'westernunion',
    name: 'Western Union',
    spread: 0.025,
    label: 'Comisión incluida',
    affiliateUrl: 'https://westernunion.com',
  },
]

export const CURRENCY_PAIRS = [
  // Destinos principales LatAm
  { code: 'CLP', label: 'Chile',            flag: 'CL' },
  { code: 'COP', label: 'Colombia',         flag: 'CO' },
  { code: 'ARS', label: 'Argentina',        flag: 'AR' },
  { code: 'MXN', label: 'México',           flag: 'MX' },
  { code: 'VES', label: 'Venezuela',        flag: 'VE' },
  { code: 'PEN', label: 'Perú',             flag: 'PE' },
  // Destinos WH — moneda única (Europa: DE, AT, ES, FR, LU, PT, IE)
  { code: 'EUR', label: 'Europa (€)',        flag: 'EU' },
  { code: 'AUD', label: 'Australia',        flag: 'AU' },
  { code: 'NZD', label: 'Nueva Zelanda',    flag: 'NZ' },
  { code: 'JPY', label: 'Japón',            flag: 'JP' },
  { code: 'KRW', label: 'Corea del Sur',    flag: 'KR' },
  { code: 'SEK', label: 'Suecia',           flag: 'SE' },
  { code: 'DKK', label: 'Dinamarca',        flag: 'DK' },
  { code: 'PLN', label: 'Polonia',          flag: 'PL' },
  { code: 'CZK', label: 'Rep. Checa',       flag: 'CZ' },
  { code: 'HUF', label: 'Hungría',          flag: 'HU' },
  { code: 'ISK', label: 'Islandia',         flag: 'IS' },
  // Otros destinos frecuentes
  { code: 'GBP', label: 'Reino Unido',      flag: 'GB' },
  { code: 'USD', label: 'Estados Unidos',   flag: 'US' },
]

// Monedas de origen disponibles
export const ORIGIN_CURRENCIES = [
  { code: 'CAD', label: 'Dólares canadienses', flag: 'CA' },
  { code: 'CLP', label: 'Pesos chilenos',      flag: 'CL' },
]
