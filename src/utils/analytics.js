// src/utils/analytics.js

const GA_MEASUREMENT_ID = 'G-8THTZR9NSJ';

export const trackEvent = (eventName, params = {}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, params);
  } else if (import.meta.env.DEV) {
    console.log(`[GA4 Event] ${eventName}`, params);
  }
};

export const trackPageView = (path, title) => {
  let pageType = 'otros';
  if (path === '/')                                    pageType = 'home';
  else if (path.includes('/categoria/'))               pageType = 'categoria';
  else if (path === '/proveedores')                    pageType = 'directorio';
  else if (path.includes('/registro-proveedores'))     pageType = 'registro';
  else if (path === '/login')                          pageType = 'login';
  else if (path === '/reset-password')                 pageType = 'reset_password';
  else if (path.includes('/proveedor/'))               pageType = 'proveedor';
  else if (['/privacidad', '/terminos'].includes(path)) pageType = 'legal';
  // ── Rutas nuevas ──────────────────────────────────────────────
  else if (path === '/primeros-pasos')                 pageType = 'primeros_pasos';
  else if (path === '/planes')                         pageType = 'planes';
  else if (path === '/cuenta')                         pageType = 'cuenta';
  else if (path.includes('/sala/'))                    pageType = 'sala_reserva';
  else if (path === '/opinar')                         pageType = 'opinar';
  else if (path === '/mi-perfil')                      pageType = 'mi_perfil';
  else if (path.startsWith('/admin'))                  pageType = 'admin';

  trackEvent('page_view', {
    page_path:  path,
    page_title: title,
    page_type:  pageType,
    send_to:    GA_MEASUREMENT_ID
  });
};

// ── Catálogo de eventos estandarizados ───────────────────────────
export const Events = {
  // Navegación
  CLICK_CATEGORIA:      'click_categoria',
  VIEW_CATEGORY_PAGE:   'view_category_page',
  CLICK_CATEGORY_CARD:  'click_category_card',

  // Directorio
  SEARCH_DIRECTORIO:    'search_directorio',      // búsqueda por texto
  FILTER_CATEGORIA:     'filter_categoria',        // filtro por categoría
  FILTER_PAIS:          'filter_pais',             // filtro por país
  FILTER_VERIFICADOS:   'filter_verificados',      // toggle solo verificados

  // Proveedores
  PROVEEDOR_VISITADO:   'proveedor_visitado',
  CLICK_WHATSAPP:       'click_whatsapp_proveedor',
  CONTACT_PROVIDER:     'contact_provider',           // outbound contact (whatsapp/instagram/phone)
  PAYMENT_LINK_CLICK:   'payment_link_click',          // migrante abre link de pago externo del proveedor
  CLICK_APPLY_PROVIDER: 'click_apply_provider',

  // Auth gate
  GATE_CLICK:           'gate_click',              // anónimo intenta ver contacto

  // Auth — nombres estándar GA4
  LOGIN:                'login',                   // login exitoso (GA4 estándar)
  SIGN_UP:              'sign_up',                 // registro nuevo (GA4 estándar)
  LOGOUT:               'logout',
};
