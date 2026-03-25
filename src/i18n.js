import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    supportedLngs: ['es', 'en', 'fr-CA'],
    // Carga los JSON desde /public/locales/
    backend: { loadPath: '/locales/{{lng}}/translation.json' },
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'soymanada_lang',
    },
    // Recursos inline como fallback mientras carga el backend
    resources: {},
  })

export default i18n
