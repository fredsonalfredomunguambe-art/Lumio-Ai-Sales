import { Language } from "../i18n/config";

/**
 * Format currency in USD with locale-aware formatting
 */
export function formatCurrency(
  amount: number,
  language: Language = "en",
  showDecimals: boolean = false
): string {
  const locales = {
    en: "en-US",
    es: "es-ES",
    pt: "pt-BR",
    fr: "fr-FR",
  };

  const formatter = new Intl.NumberFormat(locales[language], {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return formatter.format(amount);
}

/**
 * Format number with locale-aware thousands separator
 */
export function formatNumber(
  value: number,
  language: Language = "en",
  decimals: number = 0
): string {
  const locales = {
    en: "en-US",
    es: "es-ES",
    pt: "pt-BR",
    fr: "fr-FR",
  };

  return new Intl.NumberFormat(locales[language], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format date with locale-aware formatting
 */
export function formatDate(
  date: Date | string,
  language: Language = "en",
  format: "short" | "long" = "short"
): string {
  const locales = {
    en: "en-US",
    es: "es-ES",
    pt: "pt-BR",
    fr: "fr-FR",
  };

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (format === "short") {
    return new Intl.DateTimeFormat(locales[language], {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).format(dateObj);
  }

  return new Intl.DateTimeFormat(locales[language], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
}

/**
 * Format percentage with locale-aware formatting
 */
export function formatPercentage(
  value: number,
  language: Language = "en",
  decimals: number = 1
): string {
  const locales = {
    en: "en-US",
    es: "es-ES",
    pt: "pt-BR",
    fr: "fr-FR",
  };

  return new Intl.NumberFormat(locales[language], {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Compact number format (1K, 1M, 1B)
 */
export function formatCompactNumber(
  value: number,
  language: Language = "en"
): string {
  const locales = {
    en: "en-US",
    es: "es-ES",
    pt: "pt-BR",
    fr: "fr-FR",
  };

  return new Intl.NumberFormat(locales[language], {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}

