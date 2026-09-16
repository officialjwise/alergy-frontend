import type { Language, LanguageCode } from '@/types';

/** Order and native names exactly as in the "Select Language" sheet of the PDF. */
export const LANGUAGES: readonly Language[] = [
  { code: 'en', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh', nativeName: '中文', flag: '🇨🇳' },
  { code: 'hi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'pt', nativeName: 'Português', flag: '🇧🇷' },
] as const;

export const LANGUAGE_CODES: readonly LanguageCode[] = LANGUAGES.map((l) => l.code);

export const isLanguageCode = (value: string): value is LanguageCode =>
  (LANGUAGE_CODES as readonly string[]).includes(value);
