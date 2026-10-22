import type { ProductPublicDto } from "@/types/api/products";
import type { ProductReviewSummary } from "@/services/review.service";

import { COMMERCE_ENABLED } from "@/lib/features";
import { absoluteUrl } from "@/lib/public-url";
import { siteConfig } from "@/lib/site-config";
import {
  DEFAULT_LOCALE,
  HREFLANG,
  LOCALES,
  withLocalePrefix,
  type Locale,
} from "@/i18n/locales";

function telephoneE164(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("66")) return `+${digits}`;
  if (digits.startsWith("0")) return `+66${digits.slice(1)}`;
  return `+${digits}`;
}

function sameAsLinks(): string[] {
  const urls = [
    siteConfig.facebookUrl,
    siteConfig.lineUrl,
    ...siteConfig.whatsapp.map((item) => item.href),
    ...siteConfig.social.map((item) => item.href),
  ];
  return [...new Set(urls.filter((url) => url.startsWith("http")))];
}

/**
 * Organization + WebSite for the home page. Tells Google the site name, the other names
 * people know the brand by (so old "WP BLINDS" searches land here), logo, contact and socials.
 */
export function buildOrganizationJsonLd(): Record<string, unknown> {
  const siteUrl = absoluteUrl("/");
  const languages = LOCALES.map((locale) => HREFLANG[locale]);
  const website: Record<string, unknown> = {
    "@type": "WebSite",
    "@id": `${siteUrl}#website`,
    url: siteUrl,
    name: siteConfig.name,
    alternateName: ["WP ALL IN 1", "WP BLINDS"],
    inLanguage: languages,
    publisher: { "@id": `${siteUrl}#organization` },
  };

  if (COMMERCE_ENABLED) {
    website.potentialAction = {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/shop")}?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    };
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}#organization`,
        name: siteConfig.name,
        alternateName: ["WP ALL IN 1", "WP BLINDS", siteConfig.legalNameEn],
        legalName: siteConfig.legalNameEn,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/icon-512.png"),
          width: 512,
          height: 512,
        },
        slogan: siteConfig.slogan,
        email: siteConfig.emailTo,
        telephone: telephoneE164(siteConfig.phoneTel),
        address: {
          "@type": "PostalAddress",
          streetAddress: `${siteConfig.addressEn.line1}, ${siteConfig.addressEn.line2}`,
          addressLocality: "Bangkok",
          postalCode: "10510",
          addressCountry: "TH",
        },
        areaServed: ["Thailand", "Myanmar", "Laos", "Cambodia", "Vietnam"].map(
          (name) => ({ "@type": "Country", name }),
        ),
        knowsAbout: [
          "curtains",
          "blinds",
          "curtain tracks",
          "smart curtain motors",
          "fabric printing",
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            telephone: telephoneE164(siteConfig.phoneTel),
            email: siteConfig.emailTo,
            availableLanguage: languages,
            areaServed: "TH",
          },
        ],
        sameAs: sameAsLinks(),
      },
      website,
    ],
  };
}

/** Store / showroom facts for the contact page. Hours are omitted until the company confirms them. */
export function buildLocalBusinessJsonLd(): Record<string, unknown> {
  const siteUrl = absoluteUrl("/");
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${siteUrl}#localbusiness`,
    name: siteConfig.name,
    legalName: siteConfig.legalNameEn,
    url: absoluteUrl("/contact"),
    image: absoluteUrl("/home/hero-living-curtains.png"),
    telephone: telephoneE164(siteConfig.phoneTel),
    email: siteConfig.emailTo,
    parentOrganization: { "@id": `${siteUrl}#organization` },
    address: {
      "@type": "PostalAddress",
      streetAddress: `${siteConfig.address.line1} ${siteConfig.address.line2}`,
      addressLocality: "กรุงเทพมหานคร",
      postalCode: "10510",
      addressCountry: "TH",
    },
    hasMap: siteConfig.mapsUrl,
    currenciesAccepted: "THB",
    areaServed: "TH",
  };
}

export function buildBreadcrumbJsonLd(
  locale: Locale,
  items: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(withLocalePrefix(item.path, locale)),
    })),
  };
}

export function buildProductJsonLd(
  product: ProductPublicDto,
  reviewSummary?: ProductReviewSummary,
  locale: Locale = DEFAULT_LOCALE,
): Record<string, unknown> {
  const path = `/shop/${product.slug}`;
  const url = absoluteUrl(withLocalePrefix(path, locale));
  const jsonLd: Record<string, unknown> = {
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.name,
    sku: product.sku,
    url,
    brand: { "@type": "Brand", name: siteConfig.name },
    manufacturer: { "@type": "Organization", name: siteConfig.legalNameEn },
  };

  if (product.imageUrl) {
    jsonLd.image = absoluteUrl(product.imageUrl);
  }
  if (product.categoryName) {
    jsonLd.category = product.categoryName;
  }

  if (COMMERCE_ENABLED && product.retailPrice > 0) {
    jsonLd.offers = {
      "@type": "Offer",
      priceCurrency: "THB",
      price: product.retailPrice.toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      url,
      seller: { "@type": "Organization", name: siteConfig.name },
    };
  }

  if (reviewSummary && reviewSummary.count > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviewSummary.average,
      reviewCount: reviewSummary.count,
    };
  }

  return jsonLd;
}
