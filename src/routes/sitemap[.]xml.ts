import { createFileRoute } from "@tanstack/react-router";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  INSPIRATION_FALLBACK_ROOMS,
  resolveInspirationRooms,
} from "@/data/inspiration-fallback";
import { CATALOG_PRODUCTS, PRODUCT_CATEGORIES } from "@/data/products-catalog";
import { PROJECTS } from "@/data/projects";
import {
  DEFAULT_LOCALE,
  HREFLANG,
  LOCALES,
  withLocalePrefix,
} from "@/i18n/locales";
import { COMMERCE_ENABLED, DEALER_ONLY_PURCHASE } from "@/lib/features";
import { buildInspirationMaterials } from "@/lib/inspiration-materials";
import { absoluteUrl, getPublicUrl } from "@/lib/public-url";
import { isMockProductSource } from "@/domain/mock-product";
import { getAdminClient } from "@/lib/server-fns/_shared";
import { listPublicMarketingCatalogs } from "@/services/marketing-catalog.service";
import { listPublicInspirationRooms } from "@/services/inspiration.service";
import { getPublicMaterials } from "@/services/inspiration-material.service";

type SitemapImage = { loc: string; title?: string };

type SitemapEntry = {
  path: string;
  lastmod?: string;
  changefreq?: "weekly" | "monthly" | "yearly";
  images?: SitemapImage[];
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

function imageLoc(src: string | null | undefined): string | undefined {
  if (!src) return undefined;
  if (
    src.startsWith("https://") ||
    src.startsWith("http://") ||
    src.startsWith("/")
  ) {
    return absoluteUrl(src);
  }
  return undefined;
}

function renderUrl(base: string, entry: SitemapEntry): string {
  const bare = entry.path;
  const alternates = LOCALES.map((locale) => {
    const href = escapeXml(`${base}${withLocalePrefix(bare || "/", locale)}`);
    return `    <xhtml:link rel="alternate" hreflang="${HREFLANG[locale]}" href="${href}" />`;
  });
  const xDefault = escapeXml(
    `${base}${withLocalePrefix(bare || "/", DEFAULT_LOCALE)}`,
  );
  alternates.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefault}" />`,
  );

  const images = (entry.images ?? [])
    .map((image) => {
      const title = image.title
        ? `\n      <image:title>${escapeXml(image.title)}</image:title>`
        : "";
      return `    <image:image>\n      <image:loc>${escapeXml(image.loc)}</image:loc>${title}\n    </image:image>`;
    })
    .join("\n");

  return LOCALES.map((locale) => {
    const loc = escapeXml(`${base}${withLocalePrefix(bare || "/", locale)}`);
    const lastmod = entry.lastmod
      ? `\n    <lastmod>${entry.lastmod}</lastmod>`
      : "";
    const imageBlock = images ? `\n${images}` : "";
    return `  <url>
    <loc>${loc}</loc>${lastmod}
    <changefreq>${entry.changefreq ?? "weekly"}</changefreq>
${alternates.join("\n")}${imageBlock}
  </url>`;
  }).join("\n");
}

async function adminClient(): Promise<SupabaseClient> {
  return (await getAdminClient()) as SupabaseClient;
}

async function loadInspirationEntries(): Promise<SitemapEntry[]> {
  try {
    const supabase = await adminClient();
    const published = await resolveInspirationRooms(() =>
      listPublicInspirationRooms(supabase),
    );
    const seen = new Set(published.map((room) => room.slug));
    const rooms = [
      ...published,
      ...INSPIRATION_FALLBACK_ROOMS.filter((room) => !seen.has(room.slug)),
    ];
    const materialRooms = published.length
      ? published
      : INSPIRATION_FALLBACK_ROOMS;
    let materials: ReturnType<typeof buildInspirationMaterials> = [];
    try {
      const dbMaterials = await getPublicMaterials(supabase);
      materials = buildInspirationMaterials(materialRooms, dbMaterials);
    } catch (err) {
      console.error("[sitemap] materials fetch failed:", err);
      materials = buildInspirationMaterials(materialRooms, []);
    }

    return [
      ...rooms.map((room) => {
        const loc = imageLoc(room.imageUrl);
        return {
          path: `/inspiration/${room.slug}`,
          lastmod: formatLastmod(room.updatedAt),
          changefreq: "monthly" as const,
          images: loc ? [{ loc, title: room.title }] : undefined,
        };
      }),
      ...materials.map((material) => {
        const loc = imageLoc(material.imageUrl);
        return {
          path: `/inspiration/materials/${material.slug}`,
          changefreq: "monthly" as const,
          images: loc ? [{ loc, title: material.label }] : undefined,
        };
      }),
    ];
  } catch (err) {
    console.error("[sitemap] inspiration fetch failed:", err);
    return INSPIRATION_FALLBACK_ROOMS.map((room) => {
      const loc = imageLoc(room.imageUrl);
      return {
        path: `/inspiration/${room.slug}`,
        lastmod: formatLastmod(room.updatedAt),
        changefreq: "monthly" as const,
        images: loc ? [{ loc, title: room.title }] : undefined,
      };
    });
  }
}

async function loadShopEntries(): Promise<SitemapEntry[]> {
  if (!COMMERCE_ENABLED) return [];
  const entries: SitemapEntry[] = [{ path: "/shop" }];
  try {
    const supabase = await adminClient();
    const pageSize = 1000;
    for (let from = 0; from < 20000; from += pageSize) {
      const { data, error } = await supabase
        .from("products_public")
        .select("slug, created_at, image_url, tags, metadata, is_active")
        .eq("is_active", true)
        .order("slug", { ascending: true })
        .range(from, from + pageSize - 1);
      if (error) {
        console.error("[sitemap] shop products failed:", error.message);
        break;
      }
      const rows = data ?? [];
      for (const row of rows) {
        const slug = typeof row.slug === "string" ? row.slug : "";
        if (!slug) continue;
        const tags = Array.isArray(row.tags)
          ? row.tags.filter((tag): tag is string => typeof tag === "string")
          : null;
        const metadata =
          row.metadata &&
          typeof row.metadata === "object" &&
          !Array.isArray(row.metadata)
            ? (row.metadata as Record<string, unknown>)
            : null;
        if (isMockProductSource({ slug, tags, metadata })) continue;
        const loc = imageLoc(
          typeof row.image_url === "string" ? row.image_url : null,
        );
        entries.push({
          path: `/shop/${slug}`,
          lastmod: formatLastmod(
            typeof row.created_at === "string" ? row.created_at : null,
          ),
          changefreq: "weekly",
          images: loc ? [{ loc }] : undefined,
        });
      }
      if (rows.length < pageSize) break;
    }
  } catch (err) {
    console.error("[sitemap] shop products failed:", err);
  }
  return entries;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const base = getPublicUrl().replace(/\/$/, "");
        const staticEntries: SitemapEntry[] = [
          ...(DEALER_ONLY_PURCHASE ? [] : [{ path: "" }]),
          { path: "/products" },
          { path: "/projects" },
          ...(COMMERCE_ENABLED ? [{ path: "/inspiration" }] : []),
          { path: "/smart-motor", changefreq: "monthly" },
          { path: "/about", changefreq: "monthly" },
          { path: "/partners", changefreq: "monthly" },
          { path: "/catalogs" },
          { path: "/contact", changefreq: "monthly" },
          { path: "/faq", changefreq: "monthly" },
          { path: "/terms", changefreq: "yearly" },
          { path: "/privacy", changefreq: "yearly" },
          { path: "/cookies", changefreq: "yearly" },
        ];

        const categoryEntries: SitemapEntry[] = PRODUCT_CATEGORIES.map(
          (category) => {
            const loc = imageLoc(category.image);
            return {
              path: `/products?category=${category.id}`,
              images: loc ? [{ loc, title: category.name.en }] : undefined,
            };
          },
        );
        const productEntries: SitemapEntry[] = CATALOG_PRODUCTS.map(
          (product) => {
            const images = [product.image, ...(product.gallery ?? [])]
              .slice(0, 3)
              .map((src) => imageLoc(src))
              .filter((src): src is string => Boolean(src))
              .map((loc) => ({ loc, title: product.name.en }));
            return {
              path: `/products/${product.slug}`,
              changefreq: "monthly" as const,
              images,
            };
          },
        );
        const projectEntries: SitemapEntry[] = PROJECTS.map((project) => {
          const loc = imageLoc(project.cover);
          return {
            path: `/projects/${project.slug}`,
            changefreq: "monthly" as const,
            images: loc ? [{ loc, title: project.title.en }] : undefined,
          };
        });

        const catalogEntries: SitemapEntry[] = [];
        try {
          const supabase = await adminClient();
          const catalogs = await listPublicMarketingCatalogs(supabase);
          catalogEntries.push(
            ...catalogs
              .filter((catalog) => catalog.visibility === "public")
              .map((catalog) => {
                const loc = imageLoc(catalog.coverImageUrl);
                return {
                  path: `/catalogs/${catalog.slug}`,
                  lastmod: formatLastmod(catalog.updatedAt),
                  images: loc ? [{ loc }] : undefined,
                };
              }),
          );
        } catch (err) {
          console.error("[sitemap] catalog fetch failed:", err);
        }

        const [inspirationEntries, shopEntries] = await Promise.all([
          COMMERCE_ENABLED ? loadInspirationEntries() : Promise.resolve([]),
          loadShopEntries(),
        ]);

        const urls = [
          ...staticEntries,
          ...categoryEntries,
          ...productEntries,
          ...projectEntries,
          ...catalogEntries,
          ...inspirationEntries,
          ...shopEntries,
        ];

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map((entry) => renderUrl(base, entry)).join("\n")}
</urlset>`;

        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
