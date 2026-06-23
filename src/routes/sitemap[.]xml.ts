import { createFileRoute } from "@tanstack/react-router";

import { fetchPublicProducts } from "@/lib/api.functions";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const base =
          process.env.VITE_APP_PUBLIC_URL ?? "https://wpallin1-shop.vercel.app";
        const products = await fetchPublicProducts({
          data: { page: 1, pageSize: 500 },
        });

        const urls = [
          "",
          "/shop",
          "/configurator",
          "/about",
          "/contact",
          ...products.data.map((p) => `/products/${p.slug}`),
        ];

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) => `  <url><loc>${base}${path}</loc><changefreq>weekly</changefreq></url>`,
  )
  .join("\n")}
</urlset>`;

        return new Response(body, {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
