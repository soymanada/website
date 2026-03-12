export function trackEvent(eventName, payload = {}) {
  if (import.meta.env.DEV) console.log(`[Analytics] ${eventName}`, payload)
  // Plausible: if (typeof window.plausible === 'function') window.plausible(eventName, { props: payload })
  // GA4:       if (typeof window.gtag === 'function') window.gtag('event', eventName, payload)
}

export const Events = {
  CLICK_CATEGORY_CARD:    'click_category_card',
  VIEW_CATEGORY_PAGE:     'view_category_page',
  CLICK_WHATSAPP:         'click_whatsapp',
  CLICK_INSTAGRAM:        'click_instagram',
  CLICK_PROVIDER_WEBSITE: 'click_provider_website',
  CLICK_APPLY_PROVIDER:   'click_apply_provider',
  SCROLL_50:  'scroll_50',
  SCROLL_75:  'scroll_75',
  SCROLL_100: 'scroll_100',
}

export function initScrollTracking() {
  const done = { 50: false, 75: false, 100: false }
  function onScroll() {
    const pct = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
    if (pct >= 50  && !done[50])  { done[50]  = true; trackEvent(Events.SCROLL_50) }
    if (pct >= 75  && !done[75])  { done[75]  = true; trackEvent(Events.SCROLL_75) }
    if (pct >= 100 && !done[100]) { done[100] = true; trackEvent(Events.SCROLL_100) }
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}
