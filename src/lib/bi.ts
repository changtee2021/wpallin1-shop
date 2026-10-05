import { useCallback } from "react";

import { useT } from "@/i18n";
import type { Locale } from "@/i18n/types";

/** Bilingual copy for static brand-site content (page data lives outside the i18n dictionaries). */
export type Bi = { th: string; en: string };

export function bi(locale: Locale, value: Bi): string {
  return value[locale] || value.th;
}

export function useBi() {
  const { locale } = useT();
  return useCallback((value: Bi) => bi(locale, value), [locale]);
}
