import { z } from "zod";

export const searchIntentFiltersSchema = z.object({
  style: z.array(z.string()).optional(),
  color: z.array(z.string()).optional(),
  material: z.array(z.string()).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  productType: z.enum(["standard", "custom"]).optional(),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export const searchIntentSchema = z.object({
  keywords: z.array(z.string()).default([]),
  category: z.string().optional(),
  filters: searchIntentFiltersSchema.optional(),
  explanationTh: z.string().default(""),
});

export type SearchIntent = z.infer<typeof searchIntentSchema>;
export type SearchIntentFilters = z.infer<typeof searchIntentFiltersSchema>;

export function searchIntentToProductQuery(
  intent: SearchIntent,
  page = 1,
  pageSize = 24,
  sortBy?: "name" | "retail_price" | "created_at",
  sortDir?: "asc" | "desc",
) {
  const searchText = intent.keywords.join(" ").trim() || undefined;
  const f = intent.filters;
  return {
    page,
    pageSize,
    category: intent.category,
    search: searchText,
    minPrice: f?.minPrice,
    maxPrice: f?.maxPrice,
    productType: f?.productType,
    inStock: f?.inStock,
    featured: f?.featured,
    style: f?.style,
    color: f?.color,
    material: f?.material,
    sortBy,
    sortDir,
  };
}
