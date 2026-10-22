import {
  DEFAULT_LOCALE,
  HREFLANG,
  LOCALES,
  OG_LOCALE,
  shouldIgnorePath,
  withLocalePrefix,
  type Locale,
} from "@/i18n/locales";
import { absoluteUrl } from "@/lib/public-url";
import { siteConfig } from "@/lib/site-config";

type PageHeadInput = {
  title: string;
  description: string;
  /** Logical path without locale prefix, e.g. `/products` or `/`. */
  path: string;
  image?: string;
  type?: "website" | "article" | "product";
  jsonLd?: Record<string, unknown>;
  locale?: Locale;
  /** Skip hreflang / index for private areas (account, dealer). */
  noIndex?: boolean;
};

function hreflangLinks(path: string) {
  const bare = path.startsWith("/") ? path : `/${path}`;
  const links = LOCALES.map((locale) => ({
    rel: "alternate" as const,
    hrefLang: HREFLANG[locale],
    href: absoluteUrl(withLocalePrefix(bare, locale)),
  }));
  links.push({
    rel: "alternate",
    hrefLang: "x-default",
    href: absoluteUrl(withLocalePrefix(bare, DEFAULT_LOCALE)),
  });
  return links;
}

/** Per-page title, description, canonical, hreflang and Open Graph tags. */
export function pageHead({
  title,
  description,
  path,
  image,
  type = "website",
  jsonLd,
  locale = DEFAULT_LOCALE,
  noIndex = false,
}: PageHeadInput) {
  const localizedPath = shouldIgnorePath(path)
    ? path
    : withLocalePrefix(path, locale);
  const url = absoluteUrl(localizedPath);
  const imageUrl = image ? absoluteUrl(image) : undefined;
  const localeAlternates = LOCALES.filter((item) => item !== locale).map(
    (item) => ({
      property: "og:locale:alternate",
      content: OG_LOCALE[item],
    }),
  );

  return {
    meta: [
      { title },
      { name: "description", content: description },
      {
        name: "robots",
        content: noIndex
          ? "noindex, nofollow"
          : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { property: "og:site_name", content: siteConfig.name },
      { property: "og:type", content: type },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:locale", content: OG_LOCALE[locale] },
      ...localeAlternates,
      ...(imageUrl
        ? [
            { property: "og:image", content: imageUrl },
            { property: "og:image:alt", content: title },
            { name: "twitter:image", content: imageUrl },
          ]
        : []),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [
      { rel: "canonical", href: url },
      ...(noIndex ? [] : hreflangLinks(path)),
    ],
    scripts: jsonLd
      ? [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }]
      : [],
  };
}

/** Private screens (cart, login, token links) must not be indexed. */
export function noIndexHead() {
  return {
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  };
}
