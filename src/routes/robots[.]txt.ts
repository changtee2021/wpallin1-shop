import { createFileRoute } from "@tanstack/react-router";

import { PREFIXED_LOCALES } from "@/i18n/locales";
import { getPublicUrl } from "@/lib/public-url";

const PRIVATE_ROOTS = [
  "/admin",
  "/account",
  "/dealer",
  "/cart",
  "/checkout",
  "/login",
  "/signup",
  "/auth",
  "/api/",
  "/o/",
  "/quote/",
  "/compare",
  "/order",
];

function disallowLines(): string {
  const lines = PRIVATE_ROOTS.map((path) => `Disallow: ${path}`);
  for (const locale of PREFIXED_LOCALES) {
    for (const path of PRIVATE_ROOTS) {
      if (path.endsWith("/")) continue;
      lines.push(`Disallow: /${locale}${path}`);
    }
  }
  return lines.join("\n");
}

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const base = getPublicUrl().replace(/\/$/, "");
        const body = `# Public catalogue is open to search engines and AI answer engines.
# Bulk trainers that do not send visitors are closed.
# Site guide for assistants: ${base}/llms.txt

User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /
${disallowLines()}

User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

Sitemap: ${base}/sitemap.xml
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
