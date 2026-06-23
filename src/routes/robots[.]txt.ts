import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const base =
          process.env.VITE_APP_PUBLIC_URL ?? "https://wpallin1-shop.vercel.app";
        const body = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;
        return new Response(body, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      },
    },
  },
});
