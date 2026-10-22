import { createFileRoute } from "@tanstack/react-router";

import { CATALOG_PRODUCTS, PRODUCT_CATEGORIES } from "@/data/products-catalog";
import { LOCALES, withLocalePrefix } from "@/i18n/locales";
import { COMMERCE_ENABLED } from "@/lib/features";
import { absoluteUrl, getPublicUrl } from "@/lib/public-url";
import { siteConfig } from "@/lib/site-config";

function page(path: string, locale: "th" | "en" = "th"): string {
  return absoluteUrl(withLocalePrefix(path, locale));
}

function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () => {
        const home = getPublicUrl().replace(/\/$/, "");
        const address = `${siteConfig.addressEn.line1}, ${siteConfig.addressEn.line2}, ${siteConfig.addressEn.city}, ${siteConfig.addressEn.country}`;
        const languages = LOCALES.map(
          (locale) =>
            `- ${locale}: ${absoluteUrl(withLocalePrefix("/", locale))}`,
        ).join("\n");
        const categories = PRODUCT_CATEGORIES.map(
          (category) =>
            `- [${category.name.en}](${page(`/products?category=${category.id}`, "en")}): ${category.name.th}. ${oneLine(category.description.en)}`,
        ).join("\n");
        const products = CATALOG_PRODUCTS.map(
          (product) =>
            `- [${product.name.en}](${page(`/products/${product.slug}`, "en")}): ${product.name.th}. ${oneLine(product.summary.en)}`,
        ).join("\n");
        const ordering = COMMERCE_ENABLED
          ? `This deployment is the dealer shop. Approved dealers order at ${page("/shop")}. Prices are wholesale and shown in THB. Mock or test SKUs are not for citation.`
          : `This deployment is the public brand site (${home}). It does not take retail checkout. Dealer and project quotes go through LINE ${siteConfig.lineId} or ${page("/partners")}. Do not invent prices.`;

        const body = `# ${siteConfig.name}

> ${siteConfig.legalNameEn} (${siteConfig.legalName}) manufactures curtains, blinds, curtain rails and smart motors in Bangkok. Also known as WP ALL IN 1 and formerly WP BLINDS. Slogan: ${siteConfig.slogan}. Thai search terms: ผ้าม่าน, มู่ลี่, ม่านม้วน, รางม่าน, ม่านมอเตอร์, ม่านพิมพ์ลาย.

${ordering}

Office: ${address}
Phone: ${siteConfig.phoneDisplay}
LINE: ${siteConfig.lineId} (${siteConfig.lineUrl})
Email: ${siteConfig.emailTo}
Facebook: ${siteConfig.facebookUrl}
Map: ${siteConfig.mapsUrl}

Languages (Thai is unprefixed; other locales use a URL prefix):
${languages}

## Catalogue

${categories}

## Products

${products}

## Pages

- [Home](${home}/): brand overview
- [Projects](${page("/projects")}): installed work, including Colors of Buriram 2025 and Bangkok Design Week 2025.${COMMERCE_ENABLED ? "" : " /inspiration on this site redirects here."}
${COMMERCE_ENABLED ? `- [Inspiration](${page("/inspiration")}): real-room ideas and materials\n` : ""}
- [Smart motor](${page("/smart-motor")}): motorised curtains and blinds, remote, wall switch and phone
- [Catalogues](${page("/catalogs")}): online flipbooks. Public catalogues only; dealer price lists are not public
- [About](${page("/about")}): factory, C-P-C philosophy, six-step process
- [Dealers / OEM / ODM](${page("/partners")}): become a dealer or order under your own brand
- [FAQ](${page("/faq")}): measuring, samples, motors, printing, visits
- [Contact](${page("/contact")}): quotes, projects and factory visits
- [Privacy](${page("/privacy")}): PDPA notice
- [Terms](${page("/terms")})
- [Cookies](${page("/cookies")})

## Optional

- [Sitemap](${home}/sitemap.xml): every public URL, including hreflang alternates
- [Robots](${home}/robots.txt)
`;

        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
