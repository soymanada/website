import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Importar los JSONs directamente — disponibles sincrónicamente desde el primer render
import es from '../public/locales/es/translation.json'
import en from '../public/locales/en/translation.json'
import frCA from '../public/locales/fr-CA/translation.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es:    { translation: es },
      en:    { translation: en },
      'fr-CA': { translation: frCA },
    },
    fallbackLng: 'es',
    supportedLngs: ['es', 'en', 'fr-CA'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'soymanada_lang',
    },
  })

export default i18n
