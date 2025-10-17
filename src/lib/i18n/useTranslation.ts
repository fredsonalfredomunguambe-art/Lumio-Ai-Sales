import { useState, useEffect } from "react";
import {
  Language,
  getLanguage,
  setLanguage as setStoredLanguage,
} from "./config";
import enTranslations from "./translations/en.json";
import esTranslations from "./translations/es.json";
import ptTranslations from "./translations/pt.json";
import frTranslations from "./translations/fr.json";

const translations = {
  en: enTranslations,
  es: esTranslations,
  pt: ptTranslations,
  fr: frTranslations,
};

export function useTranslation() {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    setLanguageState(getLanguage());
  }, []);

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
      if (!value) break;
    }

    return value || key;
  };

  const setLanguage = (lang: Language) => {
    setStoredLanguage(lang);
    setLanguageState(lang);
  };

  return { t, language, setLanguage };
}

