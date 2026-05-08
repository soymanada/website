import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Importar los JSONs directamente — disponibles sincrónicamente desde el primer render
import es from '../public/locales/es/translation.json'
import en from '../public/locales/en/translation.json'
import frCA from '../public/locales/fr-CA/translation.json'

// Limpia valores inválidos de localStorage antes de inicializar
const storedLang = localStorage.getItem('soymanada_lang')
const validLangs = ['es', 'en', 'fr-CA']
if (storedLang && !validLangs.some(l => storedLang.startsWith(l.split('-')[0]))) {
  localStorage.removeItem('soymanada_lang')
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es:      { translation: es },
      en:      { translation: en },
      'fr-CA': { translation: frCA },
    },
    fallbackLng: 'es',
    supportedLngs: ['es', 'en', 'fr-CA'],
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'soymanada_lang',
    },
    // i18next v25 resuelve init() como Promise incluso con recursos en memoria.
    // Sin esto react-i18next v16 puede suspender el árbol antes de que
    // las traducciones estén disponibles y mostrar las claves literales.
    initImmediate: false,
    react: { useSuspense: false },
  })

export default i18n
