import { z } from "zod";

import type { ConfiguratorDraft } from "@/domain/configurator";

export const configuratorSearchSchema = z.object({
  type: z.enum(["pleated", "eyelet", "wave"]).optional(),
  fabric: z.string().uuid().optional(),
  w: z.coerce.number().min(1).max(10000).optional(),
  h: z.coerce.number().min(1).max(10000).optional(),
  rail: z.string().min(1).optional(),
  install: z.string().min(1).optional(),
});

export type ConfiguratorSearch = z.infer<typeof configuratorSearchSchema>;

export function draftFromConfiguratorSearch(
  search: ConfiguratorSearch,
): Partial<ConfiguratorDraft> {
  const draft: Partial<ConfiguratorDraft> = {};
  if (search.type) draft.productType = search.type;
  if (search.fabric) draft.fabricId = search.fabric;
  if (search.w != null) draft.widthCm = search.w;
  if (search.h != null) draft.heightCm = search.h;
  if (search.rail) draft.railOptionKey = search.rail;
  if (search.install) draft.installationOptionKey = search.install;
  return draft;
}

export function buildConfiguratorShareUrl(
  draft: ConfiguratorDraft,
  origin = typeof window !== "undefined" ? window.location.origin : "",
): string {
  const params = new URLSearchParams();
  if (draft.productType) params.set("type", draft.productType);
  if (draft.fabricId) params.set("fabric", draft.fabricId);
  if (draft.widthCm) params.set("w", String(draft.widthCm));
  if (draft.heightCm) params.set("h", String(draft.heightCm));
  if (draft.railOptionKey) params.set("rail", draft.railOptionKey);
  if (draft.installationOptionKey)
    params.set("install", draft.installationOptionKey);
  const qs = params.toString();
  return `${origin}/configurator${qs ? `?${qs}` : ""}`;
}

export function buildConfiguratorSearchFromHotspot(hotspot: {
  fabricId?: string | null;
  configuratorProductType?: string | null;
}): ConfiguratorSearch {
  const search: ConfiguratorSearch = {};
  if (
    hotspot.configuratorProductType === "pleated" ||
    hotspot.configuratorProductType === "eyelet" ||
    hotspot.configuratorProductType === "wave"
  ) {
    search.type = hotspot.configuratorProductType;
  }
  if (hotspot.fabricId) search.fabric = hotspot.fabricId;
  return search;
}
