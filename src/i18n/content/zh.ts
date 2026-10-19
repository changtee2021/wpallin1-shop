import type { Locale } from "@/i18n/locales";

import { ZH_PART1 } from "./zh-part1";
import { ZH_PART2 } from "./zh-part2";
import { ZH_PART3 } from "./zh-part3";
import { ZH_PART4 } from "./zh-part4";
import { ZH_PART5 } from "./zh-part5";

/** English source text → [Simplified, Traditional] for static content that only ships th/en. */
export const ZH_CONTENT: Record<string, readonly [string, string]> = {
  ...ZH_PART1,
  ...ZH_PART2,
  ...ZH_PART3,
  ...ZH_PART4,
  ...ZH_PART5,
};

export function zhFromEnglish(
  locale: Locale,
  en: string | undefined,
): string | undefined {
  if (!en) return undefined;
  if (locale === "zh-hans") return ZH_CONTENT[en]?.[0];
  if (locale === "zh-hant") return ZH_CONTENT[en]?.[1];
  return undefined;
}
