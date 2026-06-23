import type { SupabaseClient } from "@supabase/supabase-js";

export type CategoryDto = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
};

export async function listAdminCategories(
  supabase: SupabaseClient,
): Promise<CategoryDto[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
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
    sortOrder?: number;
    isActive?: boolean;
  },
): Promise<void> {
  const payload = {
    name: input.name.trim(),
    slug: input.slug.trim(),
    sort_order: input.sortOrder ?? 0,
    is_active: input.isActive ?? true,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", input.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("categories").insert(payload);
  if (error) throw new Error(error.message);
}
