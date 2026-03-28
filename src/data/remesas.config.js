// src/data/remesas.config.js — configuración central del comparador de remesas
// Actualizar aquí cuando lleguen los links de afiliado reales.

export const REMESAS_PLATFORMS = [
  {
    id: 'wise',
    name: 'Wise',
    spread: 0.005,
    label: null,
    color: '#2ECC71',
    affiliateUrl: 'https://wise.com/invite', // reemplazar con link Partnerize cuando llegue
    logo: 'wise',
  },
  {
    id: 'global66',
    name: 'Global66',
    spread: 0.01,
    label: null,
    color: '#1A1A2E',
    affiliateUrl: 'https://global66.com', // reemplazar con link afiliado cuando llegue
    logo: 'global66',
  },
  {
    id: 'remitly',
    name: 'Remitly',
    spread: 0.015,
    label: 'Promo primer envío',
    color: '#003087',
    affiliateUrl: 'https://remitly.com',
    logo: 'remitly',
  },
  {
    id: 'currencybird',
    name: 'CurrencyBird',
    spread: 0.012,
    label: null,
    color: '#00A86B',
    affiliateUrl: 'https://currencybird.cl',
    logo: 'currencybird',
  },
  {
    id: 'westernunion',
    name: 'Western Union',
    spread: 0.025,
    label: 'Comisión incluida',
    color: '#C8960C',
    affiliateUrl: 'https://westernunion.com',
    logo: 'westernunion',
  },
]

export const CURRENCY_PAIRS = [
  { from: 'CAD', to: 'CLP', label: 'Chile' },
  { from: 'CAD', to: 'COP', label: 'Colombia' },
  { from: 'CAD', to: 'ARS', label: 'Argentina' },
  { from: 'CAD', to: 'MXN', label: 'México' },
  { from: 'CAD', to: 'VES', label: 'Venezuela' },
  { from: 'CAD', to: 'PEN', label: 'Perú' },
]
