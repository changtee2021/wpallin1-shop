import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locales";

/**
 * Legacy localStorage key — no longer drives the storefront language
 * (URLs do). Kept so older clients do not throw when reading.
 */
const STORAGE_KEY = "wpall_retail_locale";

export function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const value = localStorage.getItem(STORAGE_KEY);
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function writeStoredLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, locale);
}
