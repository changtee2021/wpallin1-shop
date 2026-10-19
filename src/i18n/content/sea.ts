import type { Locale } from "@/i18n/locales";

import { SEA_KM } from "./sea-km";
import { SEA_LO } from "./sea-lo";
import { SEA_MY } from "./sea-my";
import { zhFromEnglish } from "./zh";

const SEA_CONTENT: Partial<Record<Locale, Record<string, string>>> = {
  my: SEA_MY,
  lo: SEA_LO,
  km: SEA_KM,
};

/** Translation of static English source copy for locales that are not shipped inline. */
export function fromEnglish(
  locale: Locale,
  en: string | undefined,
): string | undefined {
  if (!en) return undefined;
  return zhFromEnglish(locale, en) ?? SEA_CONTENT[locale]?.[en];
}

/** For `locale !== "th" ? labelEn : label` call sites: translated copy, else English. */
export function localizeEnglish(locale: Locale, en: string): string {
  return fromEnglish(locale, en) ?? en;
}
