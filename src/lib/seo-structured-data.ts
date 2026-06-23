import type { ProductPublicDto } from "@/types/api/products";
import type { ProductReviewSummary } from "@/services/review.service";

import { absoluteUrl } from "@/lib/public-url";

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
