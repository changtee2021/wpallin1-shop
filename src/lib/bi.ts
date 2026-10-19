import { useCallback } from "react";

import { useT } from "@/i18n";
import { fromEnglish } from "@/i18n/content/sea";
import type { Locale } from "@/i18n/locales";

/**
 * Localized static copy. `th` and `en` are required; other locales optional.
 * Missing keys fall back: active → dictionary (by English source) → en → th.
 */
export type Localized = {
  th: string;
  en: string;
} & Partial<Record<Exclude<Locale, "th" | "en">, string>>;

/** @deprecated Use Localized — alias kept for existing imports. */
export type Bi = Localized;

export function bi(locale: Locale, value: Localized): string {
  const fromLocale = value[locale];
  if (fromLocale) return fromLocale;
  if (locale === "th") return value.th;
  if (locale === "en") return value.en;
  // Copy the Thai page shows in English (th === en) stays English everywhere.
  if (value.th === value.en) return value.en;
  // An explicit empty `en` means the line is hidden outside Thai; never leak Thai instead.
  return fromEnglish(locale, value.en) ?? value.en;
}

/**
 * English copy that is shown in English on every locale by design (kickers, display names).
 * Only Thai copy is translated per locale.
 */
export function enText(_locale: Locale, en: string): string {
  return en;
}

export function useEnText() {
  return useCallback((en: string) => en, []);
}

export function useBi() {
  const { locale } = useT();
  return useCallback((value: Localized) => bi(locale, value), [locale]);
}
