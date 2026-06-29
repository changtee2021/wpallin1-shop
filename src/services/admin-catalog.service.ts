import type { SupabaseClient } from "@supabase/supabase-js";

import type { AdminOptionGroupInput } from "@/domain/product-options";
import type { ProductPublicDto } from "@/types/api/products";
import {
  listProductOptionGroups,
  syncProductOptionGroups,
} from "@/services/product-options.service";

export type AdminProductInput = {
  name: string;
  slug: string;
  sku?: string;
  categoryId?: string | null;
  description?: string;
  retailPrice: number;
  dealerPrice?: number;
  stockQty?: number;
  minOrderQty?: number;
  imageUrl?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  optionGroups?: AdminOptionGroupInput[];
};

export type AdminProductRow = {
  id: string;
  slug: string;
  sku: string | null;
  name: string;
  imageUrl: string | null;
  retailPrice: number;
  stockQty: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryName: string | null;
};

export async function listAdminProducts(
  supabase: SupabaseClient,
): Promise<AdminProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, sku, name, image_url, retail_price, stock_qty, is_active, is_featured, category_id",
    )
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  const { data: categories } = await supabase
    .from("product_categories")
    .select("id, name");

  const catMap = new Map((categories ?? []).map((c) => [c.id, c.name]));

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    imageUrl: row.image_url ?? null,
    retailPrice: Number(row.retail_price),
    stockQty: Number(row.stock_qty),
    isActive: row.is_active,
    isFeatured: row.is_featured,
    categoryName: row.category_id
      ? (catMap.get(row.category_id) ?? null)
      : null,
  }));
}

export async function getAdminProduct(
  supabase: SupabaseClient,
  id: string,
): Promise<(AdminProductInput & { id: string }) | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const optionGroups = await listProductOptionGroups(supabase, id);
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    sku: data.sku ?? undefined,
    categoryId: data.category_id,
    description: data.description ?? undefined,
    retailPrice: Number(data.retail_price),
    dealerPrice: Number(data.dealer_price),
    stockQty: Number(data.stock_qty),
    minOrderQty: data.min_order_qty,
    imageUrl: data.image_url ?? undefined,
    isFeatured: data.is_featured,
    isActive: data.is_active,
    optionGroups,
  };
}

export async function createProduct(
  supabase: SupabaseClient,
  input: AdminProductInput,
): Promise<ProductPublicDto["id"]> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name.trim(),
      slug: input.slug.trim(),
      sku: input.sku?.trim() || null,
      category_id: input.categoryId || null,
      description: input.description?.trim() || null,
      retail_price: input.retailPrice,
      dealer_price: input.dealerPrice ?? input.retailPrice * 0.75,
      stock_qty: input.stockQty ?? 0,
      min_order_qty: input.minOrderQty ?? 1,
      image_url: input.imageUrl || null,
      is_featured: input.isFeatured ?? false,
      is_active: input.isActive ?? true,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  if (input.optionGroups?.length) {
    await syncProductOptionGroups(supabase, data.id, input.optionGroups);
  }
  return data.id;
}

export async function updateProduct(
  supabase: SupabaseClient,
  id: string,
  input: AdminProductInput,
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({
      name: input.name.trim(),
      slug: input.slug.trim(),
      sku: input.sku?.trim() || null,
      category_id: input.categoryId || null,
      description: input.description?.trim() || null,
      retail_price: input.retailPrice,
      dealer_price: input.dealerPrice ?? input.retailPrice * 0.75,
      stock_qty: input.stockQty ?? 0,
      min_order_qty: input.minOrderQty ?? 1,
      image_url: input.imageUrl || null,
      is_featured: input.isFeatured ?? false,
      is_active: input.isActive ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  if (input.optionGroups !== undefined) {
    await syncProductOptionGroups(supabase, id, input.optionGroups);
  }
}

export async function toggleProductActive(
  supabase: SupabaseClient,
  id: string,
  isActive: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
