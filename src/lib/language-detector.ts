import franc from "franc";

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  iso639_1: string;
}

const LANGUAGE_MAP: Record<string, string> = {
  eng: "en",
  por: "pt",
  spa: "es",
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  pt: "Portuguese",
  es: "Spanish",
};

export function detectLanguage(text: string): LanguageDetectionResult {
  const detected = franc(text, { minLength: 10 });

  if (detected === "und" || !LANGUAGE_MAP[detected]) {
    return {
      language: "English",
      confidence: 0.5,
      iso639_1: "en",
    };
  }

  const iso639_1 = LANGUAGE_MAP[detected];

  return {
    language: LANGUAGE_NAMES[iso639_1],
    confidence: 0.9,
    iso639_1,
  };
}

export function getLanguageInstruction(language: string): string {
  const instructions: Record<string, string> = {
    en: "Respond in English",
    pt: "Responda em Português",
    es: "Responde en Español",
  };

  return instructions[language] || instructions["en"];
}
