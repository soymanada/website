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
  if (path === '/') pageType = 'home';
  else if (path.includes('/categoria/')) pageType = 'categoria';
  else if (path.includes('/proveedores')) pageType = 'otros';
  else if (path.includes('/proveedor/')) pageType = 'proveedor';
  else if (['/privacidad', '/terminos'].includes(path)) pageType = 'legal';

  trackEvent('page_view', {
    page_path: path,
    page_title: title,
    page_type: pageType,
    send_to: GA_MEASUREMENT_ID
  });
};

// Dejamos este objeto para que los componentes puedan usar nombres estandarizados
export const Events = {
  CLICK_CATEGORIA:      'click_categoria',
  PROVEEDOR_VISITADO:   'proveedor_visitado',
  CLICK_WHATSAPP:       'click_whatsapp_proveedor',
  CLICK_APPLY:          'click_apply_provider',       // conservado (sin usos activos)
  CLICK_APPLY_PROVIDER: 'click_apply_provider',       // CTASection.jsx, ProvidersPage.jsx
  VIEW_CATEGORY_PAGE:   'view_category_page',         // CategoryPage.jsx:16
  CLICK_CATEGORY_CARD:  'click_category_card',        // CategoryPage.jsx:86
};