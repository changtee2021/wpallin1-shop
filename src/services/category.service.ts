import type { SupabaseClient } from "@supabase/supabase-js";

export type CategoryDto = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export async function listAdminCategories(
  supabase: SupabaseClient,
): Promise<CategoryDto[]> {
  const { data, error } = await supabase
    .from("product_categories")
    .select("id, name, slug, image_url, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }));
}

export async function saveCategory(
  supabase: SupabaseClient,
  input: {
    id?: string;
    name: string;
    slug: string;
    imageUrl?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  },
): Promise<void> {
  const payload = {
    name: input.name.trim(),
    slug: input.slug.trim(),
    image_url: input.imageUrl?.trim() || null,
    sort_order: input.sortOrder ?? 0,
    is_active: input.isActive ?? true,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { error } = await supabase
      .from("product_categories")
      .update(payload)
      .eq("id", input.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("product_categories").insert(payload);
  if (error) throw new Error(error.message);
}
