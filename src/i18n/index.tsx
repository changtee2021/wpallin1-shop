import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";

import { en } from "./en";
import { km } from "./km";
import {
  DEFAULT_LOCALE,
  HTML_LANG,
  localeFromHref,
  setActiveLocale,
  switchLocalePath,
  type Locale,
} from "./locales";
import { lo } from "./lo";
import { my } from "./my";
import { th } from "./th";
import type {
  PartialTranslations,
  TranslationKey,
  Translations,
} from "./types";
import { ZH_DICT_EXTRA } from "./zh-dict-extra";
import { zhHans } from "./zh-hans";
import { zhHant } from "./zh-hant";

const zhExtra = (index: 0 | 1): PartialTranslations =>
  Object.fromEntries(
    Object.entries(ZH_DICT_EXTRA).map(([key, pair]) => [key, pair?.[index]]),
  );

const dictionaries: Record<Locale, PartialTranslations | Translations> = {
  th,
  en,
  my,
  lo,
  km,
  "zh-hans": { ...zhExtra(0), ...zhHans },
  "zh-hant": { ...zhExtra(1), ...zhHant },
};

const THAI_SCRIPT = /[\u0E00-\u0E7F]/;

/**
 * Resolve a key: active locale, then English, then Thai, then the key itself.
 * Keys the Thai site already shows in English stay English on every locale.
 */
export function translate(locale: Locale, key: TranslationKey): string {
  const own = dictionaries[locale][key];
  // Thai copy that is already English (About Us, FAQ, brand names) stays
  // English — unless this locale has its own wording for that key.
  if (locale !== "th" && th[key] && !THAI_SCRIPT.test(th[key])) {
    if (own && own !== th[key]) return own;
    return en[key] || th[key];
  }
  return own || (locale !== "en" && en[key]) || th[key] || key;
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => th[key],
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const publicHref = useRouterState({
    select: (s) => s.location.publicHref ?? s.location.href,
  });
  const locale = localeFromHref(publicHref);

  useEffect(() => {
    setActiveLocale(locale);
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      setActiveLocale(next);
      const url = new URL(publicHref, window.location.origin);
      // router.navigate() would compare the de-localized href, see the same
      // page, and skip the history update — push the public URL directly.
      router.history.push(
        `${switchLocalePath(url.pathname, next)}${url.search}${url.hash}`,
      );
    },
    [locale, publicHref, router],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t: (key) => translate(locale, key) }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const { locale, t } = useContext(I18nContext);
  return { locale, t };
}

export function useLocaleControl() {
  const { locale, setLocale } = useContext(I18nContext);
  return { locale, setLocale };
}

export type { Locale, TranslationKey, Translations, PartialTranslations };
export {
  DEFAULT_LOCALE,
  HREFLANG,
  HTML_LANG,
  LOCALES,
  LOCALE_OPTIONS,
  OG_LOCALE,
  fontStylesheetForLocale,
  getActiveLocale,
  isLocale,
  localeFromHref,
  localeFromPath,
  setActiveLocale,
  stripLocalePrefix,
  switchLocalePath,
  withLocalePrefix,
  shouldIgnorePath,
} from "./locales";
