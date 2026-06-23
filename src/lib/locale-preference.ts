import type { Locale } from "@/i18n/types";

const STORAGE_KEY = "wpall_retail_locale";

export function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "th";
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "en" ? "en" : "th";
}

export function writeStoredLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, locale);
}
