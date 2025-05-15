import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../../../../public/locales/en/translation.json';
import frTranslations from '../../../../public/locales/fr/translation.json';
import arTranslations from '../../../../public/locales/ar/translation.json';
import chTranslations from '../../../../public/locales/ch/translation.json';
import jpTranslations from '../../../../public/locales/jp/translation.json';

let lng = 'en'; // Default language

// Check if we are in a browser environment
if (typeof window !== 'undefined') {
  lng = localStorage.getItem('language') || 'en';
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      fr: { translation: frTranslations },
      ar: { translation: arTranslations },
      ch: { translation: chTranslations },
      jp: { translation: jpTranslations },
    },
    lng: lng, 
    fallbackLng: 'en', 
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
