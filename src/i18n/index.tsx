import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { readStoredLocale, writeStoredLocale } from "@/lib/locale-preference";
import { en } from "./en";
import { th } from "./th";
import type { Locale, TranslationKey, Translations } from "./types";

const dictionaries: Record<Locale, Translations> = { th, en };

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue>({
  locale: "th",
  setLocale: () => {},
  t: (key) => th[key],
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  const setLocale = useCallback((next: Locale) => {
    writeStoredLocale(next);
    setLocaleState(next);
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
    }
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key) => dictionaries[locale][key] ?? dictionaries.th[key] ?? key,
    }),
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

export function translate(locale: Locale, key: TranslationKey): string {
  return dictionaries[locale][key] ?? dictionaries.th[key] ?? key;
}
