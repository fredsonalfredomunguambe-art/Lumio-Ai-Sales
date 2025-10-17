export const languages = {
  en: { 
    name: 'English', 
    flag: '🇺🇸',
    locale: 'en-US',
    dateFormat: 'MM/DD/YYYY',
  },
  es: { 
    name: 'Español', 
    flag: '🇪🇸',
    locale: 'es-ES',
    dateFormat: 'DD/MM/YYYY',
  },
  pt: { 
    name: 'Português', 
    flag: '🇧🇷',
    locale: 'pt-BR',
    dateFormat: 'DD/MM/YYYY',
  },
  fr: { 
    name: 'Français', 
    flag: '🇫🇷',
    locale: 'fr-FR',
    dateFormat: 'DD/MM/YYYY',
  },
} as const;

export type Language = keyof typeof languages;

export const defaultLanguage: Language = 'en';

export function getLanguage(): Language {
  if (typeof window === 'undefined') return defaultLanguage;
  
  const stored = localStorage.getItem('lumio-language');
  if (stored && stored in languages) {
    return stored as Language;
  }
  
  return defaultLanguage;
}

export function setLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('lumio-language', lang);
}


