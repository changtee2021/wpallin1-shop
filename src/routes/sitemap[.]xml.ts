import { createFileRoute } from "@tanstack/react-router";

import { getPublicUrl } from "@/lib/public-url";
import { getAdminClient } from "@/lib/server-fns/_shared";
import { listPublicProducts } from "@/services/catalog.service";
import { listPublicMarketingCatalogs } from "@/services/marketing-catalog.service";

type SitemapEntry = {
  path: string;
  lastmod?: string;
};

function formatLastmod(iso?: string | null): string | undefined {
  if (!iso) return undefined;
  const date = iso.slice(0, 10);
  return date.length === 10 ? date : undefined;
}

function renderUrl(base: string, entry: SitemapEntry): string {
  const loc = `${base}${entry.path}`;
  const lastmod = entry.lastmod
    ? `\n    <lastmod>${entry.lastmod}</lastmod>`
    : "";
  return `  <url><loc>${loc}</loc>${lastmod}\n    <changefreq>weekly</changefreq>\n  </url>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const base = getPublicUrl().replace(/\/$/, "");
        const staticEntries: SitemapEntry[] = [
          { path: "" },
          { path: "/shop" },
          { path: "/catalogs" },
          { path: "/configurator" },
          { path: "/about" },
          { path: "/contact" },
          { path: "/terms" },
          { path: "/privacy" },
          { path: "/cookies" },
        ];

        const productEntries: SitemapEntry[] = [];
        try {
          const supabase = await getAdminClient();
          let page = 1;
          let totalPages = 1;

          while (page <= totalPages) {
            const batch = await listPublicProducts(supabase, {
              page,
              pageSize: 100,
            });
            productEntries.push(
              ...batch.data
                .filter((product) => !product.isMock)
                .map((product) => ({
                  path: `/products/${product.slug}`,
                  lastmod: formatLastmod(product.createdAt),
                })),
            );
            totalPages = Math.max(1, batch.meta.totalPages || 1);
            page += 1;
          }
        } catch (err) {
          console.error("[sitemap] product fetch failed:", err);
        }

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

        const urls = [...staticEntries, ...productEntries, ...catalogEntries];

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
