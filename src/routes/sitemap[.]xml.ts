import { createFileRoute } from "@tanstack/react-router";

import {
  CATALOG_PRODUCTS,
  PRODUCT_CATEGORY_IDS,
} from "@/data/products-catalog";
import { PROJECTS } from "@/data/projects";
import { getPublicUrl } from "@/lib/public-url";
import { getAdminClient } from "@/lib/server-fns/_shared";
import { listPublicMarketingCatalogs } from "@/services/marketing-catalog.service";

type SitemapEntry = {
  path: string;
  lastmod?: string;
  changefreq?: "weekly" | "monthly" | "yearly";
};

function formatLastmod(iso?: string | null): string | undefined {
  if (!iso) return undefined;
  const date = iso.slice(0, 10);
  return date.length === 10 ? date : undefined;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderUrl(base: string, entry: SitemapEntry): string {
  const loc = escapeXml(`${base}${entry.path}`);
  const lastmod = entry.lastmod
    ? `\n    <lastmod>${entry.lastmod}</lastmod>`
    : "";
  return `  <url><loc>${loc}</loc>${lastmod}\n    <changefreq>${entry.changefreq ?? "weekly"}</changefreq>\n  </url>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const base = getPublicUrl().replace(/\/$/, "");
        const staticEntries: SitemapEntry[] = [
          { path: "" },
          { path: "/products" },
          { path: "/projects" },
          { path: "/about", changefreq: "monthly" },
          { path: "/partners", changefreq: "monthly" },
          { path: "/catalogs" },
          { path: "/contact", changefreq: "monthly" },
          { path: "/faq", changefreq: "monthly" },
          { path: "/terms", changefreq: "yearly" },
          { path: "/privacy", changefreq: "yearly" },
          { path: "/cookies", changefreq: "yearly" },
        ];

        const categoryEntries: SitemapEntry[] = PRODUCT_CATEGORY_IDS.map(
          (id) => ({
            path: `/products?category=${id}`,
          }),
        );
        const productEntries: SitemapEntry[] = CATALOG_PRODUCTS.map(
          (product) => ({
            path: `/products/${product.slug}`,
            changefreq: "monthly",
          }),
        );
        const projectEntries: SitemapEntry[] = PROJECTS.map((project) => ({
          path: `/projects/${project.slug}`,
          changefreq: "monthly",
        }));

        const catalogEntries: SitemapEntry[] = [];
        try {
          const supabase = await getAdminClient();
          const catalogs = await listPublicMarketingCatalogs(supabase);
          catalogEntries.push(
            ...catalogs
              .filter((catalog) => catalog.visibility === "public")
              .map((catalog) => ({
                path: `/catalogs/${catalog.slug}`,
                lastmod: formatLastmod(catalog.updatedAt),
              })),
          );
        } catch (err) {
          console.error("[sitemap] catalog fetch failed:", err);
        }

        const urls = [
          ...staticEntries,
          ...categoryEntries,
          ...productEntries,
          ...projectEntries,
          ...catalogEntries,
        ];

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((entry) => renderUrl(base, entry)).join("\n")}
</urlset>`;

        return new Response(body, {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
