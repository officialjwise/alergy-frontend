import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { isLanguageCode } from './languages';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import hi from './locales/hi.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';
import type { LanguageCode } from '@/types';

export const resources = {
  en: { translation: en },
  zh: { translation: zh },
  hi: { translation: hi },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  ru: { translation: ru },
  pt: { translation: pt },
} as const;

/** App-owned i18next instance (avoids sharing the global singleton with libraries). */
export const i18n = createInstance();

/** Best language from the device settings, falling back to English. */
export function detectDeviceLanguage(): LanguageCode {
  for (const locale of getLocales()) {
    const code = locale.languageCode ?? '';
    if (isLanguageCode(code)) return code;
  }
  return 'en';
}

export function initI18n(language: LanguageCode): typeof i18n {
  if (!i18n.isInitialized) {
    void i18n.use(initReactI18next).init({
      resources,
      lng: language,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      returnNull: false,
      initAsync: false,
    });
  } else if (i18n.language !== language) {
    void i18n.changeLanguage(language);
  }
  return i18n;
}

export function setLanguage(language: LanguageCode): void {
  void i18n.changeLanguage(language);
}
