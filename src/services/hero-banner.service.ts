import type { SupabaseClient } from "@supabase/supabase-js";

import type { HeroBannerDto } from "@/types/api/hero-banners";

const SETTINGS_KEY = "home.hero_banners";

function parseBanners(raw: unknown): HeroBannerDto[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const imageUrl =
        typeof row.imageUrl === "string" ? row.imageUrl.trim() : "";
      if (!imageUrl) return null;
      return {
        id:
          typeof row.id === "string" && row.id.length > 0
            ? row.id
            : crypto.randomUUID(),
        imageUrl,
        linkUrl:
          typeof row.linkUrl === "string" && row.linkUrl.trim()
            ? row.linkUrl.trim()
            : null,
        alt:
          typeof row.alt === "string" && row.alt.trim()
            ? row.alt.trim()
            : null,
        sortOrder:
          typeof row.sortOrder === "number" && Number.isFinite(row.sortOrder)
            ? row.sortOrder
            : index,
        isActive: row.isActive !== false,
      } satisfies HeroBannerDto;
    })
    .filter((item): item is HeroBannerDto => item != null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listHeroBanners(
  supabase: SupabaseClient,
  { activeOnly = false }: { activeOnly?: boolean } = {},
): Promise<HeroBannerDto[]> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const banners = parseBanners(data?.value);
  return activeOnly ? banners.filter((b) => b.isActive) : banners;
}

export async function saveHeroBanners(
  supabase: SupabaseClient,
  banners: HeroBannerDto[],
): Promise<void> {
  const payload = banners
    .map((banner, index) => ({
      ...banner,
      sortOrder: index,
      imageUrl: banner.imageUrl.trim(),
      linkUrl: banner.linkUrl?.trim() || null,
      alt: banner.alt?.trim() || null,
    }))
    .filter((banner) => banner.imageUrl.length > 0);

  const { error } = await supabase.from("settings").upsert(
    {
      key: SETTINGS_KEY,
      value: payload,
      description: "Homepage hero banner slides",
      is_public: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) throw new Error(error.message);
}
