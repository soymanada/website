// src/utils/analytics.js

const GA_MEASUREMENT_ID = 'G-XXXXXXXX'; // Reemplazar por el ID real [cite: 30]

export const trackEvent = (eventName, params = {}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, params);
  } else if (import.meta.env.DEV) {
    console.log(`[GA4 Event] ${eventName}`, params);
  }
};

export const trackPageView = (path, title) => {
  let pageType = 'otros';
  if (path === '/' || path === '/soy-manada/') pageType = 'home';
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

export const Events = {
  CLICK_CATEGORIA: 'click_categoria',
  PROVEEDOR_VISITADO: 'proveedor_visitado',
  CLICK_WHATSAPP: 'click_whatsapp_proveedor',
  CLICK_APPLY: 'click_apply_provider',
};