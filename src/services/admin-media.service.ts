import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminMediaAssetDto = {
  id: string;
  url: string;
  storagePath: string;
  folder: string;
  label: string | null;
  createdAt: string;
};

type MediaRow = {
  id: string;
  url: string;
  storage_path: string;
  folder: string;
  label: string | null;
  created_at: string;
};

function mapRow(row: MediaRow): AdminMediaAssetDto {
  return {
    id: row.id,
    url: row.url,
    storagePath: row.storage_path,
    folder: row.folder,
    label: row.label,
    createdAt: row.created_at,
  };
}

export async function listAdminMediaAssets(
  supabase: SupabaseClient,
  folder?: string,
): Promise<AdminMediaAssetDto[]> {
  let query = supabase
    .from("admin_media_assets")
    .select("id, url, storage_path, folder, label, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (folder) {
    query = query.eq("folder", folder);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRow(row as MediaRow));
}

export async function createAdminMediaAsset(
  supabase: SupabaseClient,
  input: {
    url: string;
    storagePath: string;
    folder?: string;
    label?: string | null;
  },
): Promise<AdminMediaAssetDto> {
  const { data, error } = await supabase
    .from("admin_media_assets")
    .insert({
      url: input.url,
      storage_path: input.storagePath,
      folder: input.folder ?? "general",
      label: input.label?.trim() || null,
    })
    .select("id, url, storage_path, folder, label, created_at")
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as MediaRow);
}
