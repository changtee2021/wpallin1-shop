import type { ProductPublicDto } from "@/types/api/products";
import type { ProductReviewSummary } from "@/services/review.service";

import { absoluteUrl } from "@/lib/public-url";
import { siteConfig } from "@/lib/site-config";

/**
 * Organization + WebSite for the home page. Tells Google the site name, the other names
 * people know the brand by (so old "WP BLINDS" searches land here), logo, contact and socials.
 */
export function buildOrganizationJsonLd(): Record<string, unknown> {
  const siteUrl = absoluteUrl("/");
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
        logo: absoluteUrl("/icon-512.png"),
        slogan: siteConfig.slogan,
        address: {
          "@type": "PostalAddress",
          streetAddress: `${siteConfig.addressEn.line1}, ${siteConfig.addressEn.line2}`,
          addressLocality: "Bangkok",
          postalCode: "10510",
          addressCountry: "TH",
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            telephone: "+66-2-334-0235",
            availableLanguage: ["th", "en"],
          },
        ],
        sameAs: [siteConfig.facebookUrl, siteConfig.lineUrl],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        url: siteUrl,
        name: siteConfig.name,
        alternateName: "WP ALL IN 1",
        inLanguage: ["th", "en"],
        publisher: { "@id": `${siteUrl}#organization` },
      },
    ],
  };
}

export function buildProductJsonLd(
  product: ProductPublicDto,
  reviewSummary?: ProductReviewSummary,
): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.name,
    sku: product.sku,
    url: absoluteUrl(`/products/${product.slug}`),
    offers: {
      "@type": "Offer",
      priceCurrency: "THB",
      price: product.retailPrice,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
      url: absoluteUrl(`/products/${product.slug}`),
    },
  };

  if (product.imageUrl) {
    jsonLd.image = product.imageUrl;
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
