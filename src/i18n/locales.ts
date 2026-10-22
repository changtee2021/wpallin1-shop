/** Supported storefront locales. Thai is the default (unprefixed URLs). */
export const LOCALES = [
  "th",
  "en",
  "my",
  "lo",
  "km",
  "vi",
  "zh-hans",
  "zh-hant",
] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "th";

/** Locales that appear as a URL prefix (all except Thai). */
export const PREFIXED_LOCALES = LOCALES.filter(
  (l): l is Exclude<Locale, "th"> => l !== "th",
);

/** BCP 47 / hreflang codes (Chinese needs script tags). */
export const HREFLANG: Record<Locale, string> = {
  th: "th",
  en: "en",
  my: "my",
  lo: "lo",
  km: "km",
  vi: "vi",
  "zh-hans": "zh-Hans",
  "zh-hant": "zh-Hant",
};

/** HTML lang attribute values. */
export const HTML_LANG: Record<Locale, string> = {
  th: "th",
  en: "en",
  my: "my",
  lo: "lo",
  km: "km",
  vi: "vi",
  "zh-hans": "zh-Hans",
  "zh-hant": "zh-Hant",
};

/** Open Graph locale tags. */
export const OG_LOCALE: Record<Locale, string> = {
  th: "th_TH",
  en: "en_US",
  my: "my_MM",
  lo: "lo_LA",
  km: "km_KH",
  vi: "vi_VN",
  "zh-hans": "zh_CN",
  "zh-hant": "zh_TW",
};

export type LocaleOption = {
  value: Locale;
  /** Short label in the language switcher (e.g. TH, MY). */
  label: string;
  /** Native name for title/aria. */
  name: string;
};

export const LOCALE_OPTIONS: LocaleOption[] = [
  { value: "th", label: "TH", name: "ไทย" },
  { value: "en", label: "EN", name: "English" },
  { value: "my", label: "MY", name: "မြန်မာ" },
  { value: "lo", label: "LO", name: "ລາວ" },
  { value: "km", label: "KM", name: "ខ្មែរ" },
  { value: "vi", label: "VI", name: "Tiếng Việt" },
  { value: "zh-hans", label: "简", name: "简体中文" },
  { value: "zh-hant", label: "繁", name: "繁體中文" },
];

/**
 * Paths that never get a locale prefix (admin, auth callbacks, tokens, SEO files).
 */
const IGNORE_PATH_RE =
  /^\/(?:admin(?:\/|$)|auth(?:\/|$)|api(?:\/|$)|o\/|quote\/|sitemap\.xml$|robots\.txt$|llms\.txt$)/;

export function shouldIgnorePath(pathname: string): boolean {
  return IGNORE_PATH_RE.test(pathname);
}

export function isLocale(value: string | undefined | null): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}

/** Extract locale from a public pathname. Thai when no prefix. */
export function localeFromPath(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0]?.toLowerCase();
  if (first && isLocale(first) && first !== "th") return first;
  return DEFAULT_LOCALE;
}

/** Strip a known locale prefix. `/my/products` → `/products`. */
export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0]?.toLowerCase();
  if (first && isLocale(first) && first !== "th") {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

/** Add locale prefix. Thai stays unprefixed. Supports `?query` suffixes. */
export function withLocalePrefix(pathname: string, locale: Locale): string {
  const [pathPart, queryPart] = pathname.split("?");
  const bare = stripLocalePrefix(pathPart || "/");
  let result: string;
  if (locale === DEFAULT_LOCALE || shouldIgnorePath(bare)) {
    result = bare;
  } else if (bare === "/") {
    result = `/${locale}`;
  } else {
    result = `/${locale}${bare}`;
  }
  return queryPart !== undefined ? `${result}?${queryPart}` : result;
}

/** Build public path for the same logical page in another locale. */
export function switchLocalePath(
  publicPathname: string,
  nextLocale: Locale,
): string {
  if (shouldIgnorePath(stripLocalePrefix(publicPathname))) {
    return stripLocalePrefix(publicPathname);
  }
  return withLocalePrefix(publicPathname, nextLocale);
}

/** Locale of a public href (`/my/products?x=1`, or an absolute URL). */
export function localeFromHref(href: string | undefined | null): Locale {
  if (!href) return DEFAULT_LOCALE;
  try {
    return localeFromPath(new URL(href, "http://local").pathname);
  } catch {
    return DEFAULT_LOCALE;
  }
}

// Client-only: one user per tab, so a module value is safe in the browser.
// On the server every request gets its own router, see createLocaleRewrite().
let clientLocale: Locale = DEFAULT_LOCALE;

export function getActiveLocale(): Locale {
  return clientLocale;
}

export function setActiveLocale(locale: Locale): void {
  if (typeof window !== "undefined") clientLocale = locale;
}

function addPrefix(url: URL, locale: Locale): URL {
  if (shouldIgnorePath(url.pathname) || locale === DEFAULT_LOCALE) return url;
  if (url.pathname.split("/").filter(Boolean)[0] === locale) return url;
  const next = new URL(url);
  next.pathname = withLocalePrefix(url.pathname, locale);
  return next;
}

function removePrefix(url: URL): { url: URL; locale: Locale } {
  if (shouldIgnorePath(url.pathname)) return { url, locale: DEFAULT_LOCALE };
  const locale = localeFromPath(url.pathname);
  if (locale === DEFAULT_LOCALE) return { url, locale };
  const next = new URL(url);
  next.pathname = stripLocalePrefix(url.pathname);
  return { url: next, locale };
}

/**
 * Router rewrite pair. The locale lives in this closure so concurrent SSR
 * requests (one router each) never share a language.
 */
export function createLocaleRewrite() {
  let routerLocale: Locale = DEFAULT_LOCALE;
  const isServer = typeof window === "undefined";
  return {
    input: ({ url }: { url: URL }) => {
      const result = removePrefix(url);
      if (!shouldIgnorePath(result.url.pathname)) {
        routerLocale = result.locale;
        setActiveLocale(result.locale);
      }
      return result.url;
    },
    output: ({ url }: { url: URL }) =>
      addPrefix(url, isServer ? routerLocale : getActiveLocale()),
  };
}

/** @deprecated Kept for imports; prefer createLocaleRewrite(). */
export function deLocalizeUrl(url: URL): URL {
  return removePrefix(url).url;
}

/** @deprecated Kept for imports; prefer createLocaleRewrite(). */
export function localizeUrl(url: URL): URL {
  return addPrefix(url, getActiveLocale());
}

/** Google Fonts stylesheet URL for a locale (Thai/en use the default Plex Thai). */
export function fontStylesheetForLocale(locale: Locale): string | null {
  switch (locale) {
    case "my":
      return "https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar:wght@400;500;600&display=swap";
    case "lo":
      return "https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600&display=swap";
    case "km":
      return "https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600&family=Noto+Sans+Khmer:wght@400;500;600&display=swap";
    case "vi":
      return "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600&display=swap";
    case "zh-hans":
      return "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&display=swap";
    case "zh-hant":
      return "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600&display=swap";
    default:
      return null;
  }
}
