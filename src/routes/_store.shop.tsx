import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { CategoryRail } from "@/components/storefront/category-rail";
import { ProductFeed } from "@/components/storefront/product-feed";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemberProductPrices } from "@/hooks/use-member-product-prices";
import { fetchCategories, fetchPublicProducts } from "@/lib/api.functions";

const shopSearchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.number().optional(),
  sortBy: z.enum(["created_at", "name", "retail_price"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

export const Route = createFileRoute("/_store/shop")({
  validateSearch: shopSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const page = deps.page ?? 1;
    const [products, categories] = await Promise.all([
      fetchPublicProducts({
        data: {
          page,
          pageSize: 24,
          search: deps.search,
          category: deps.category,
          sortBy: deps.sortBy ?? "created_at",
          sortDir: deps.sortDir ?? "desc",
        },
      }),
      fetchCategories(),
    ]);
    return { products, categories };
  },
  component: ShopPage,
});

function ShopPage() {
  const search = Route.useSearch();
  const { products, categories } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const memberPrices = useMemberProductPrices(products.data);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {categories.length > 0 ? (
        <div className="mb-6">
          <CategoryRail
            categories={categories}
            activeSlug={search.category}
            showAll
          />
        </div>
      ) : null}

      <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>
              แสดง {products.data.length} จาก {products.meta.total} รายการ
            </span>
            <div className="flex items-center gap-2">
              {search.search && <span>ค้นหา: &quot;{search.search}&quot;</span>}
              <Select
                value={`${search.sortBy ?? "created_at"}:${search.sortDir ?? "desc"}`}
                onValueChange={(value) => {
                  const [sortBy, sortDir] = value.split(":") as [
                    "created_at" | "name" | "retail_price",
                    "asc" | "desc",
                  ];
                  navigate({ search: { ...search, sortBy, sortDir, page: 1 } });
                }}
              >
                <SelectTrigger className="h-8 w-44">
                  <SelectValue placeholder="เรียงลำดับ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at:desc">ใหม่ล่าสุด</SelectItem>
                  <SelectItem value="retail_price:asc">ราคาต่ำ-สูง</SelectItem>
                  <SelectItem value="retail_price:desc">ราคาสูง-ต่ำ</SelectItem>
                  <SelectItem value="name:asc">ชื่อ A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ProductFeed
            products={products.data}
            title="สินค้าทั้งหมด"
            memberPrices={memberPrices}
          />
          {products.meta.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                type="button"
                disabled={(search.page ?? 1) <= 1}
                className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
                onClick={() =>
                  navigate({
                    search: { ...search, page: (search.page ?? 1) - 1 },
                  })
                }
              >
                ก่อนหน้า
              </button>
              <span className="flex items-center px-2 text-sm">
                {search.page ?? 1} / {products.meta.totalPages}
              </span>
              <button
                type="button"
                disabled={(search.page ?? 1) >= products.meta.totalPages}
                className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
                onClick={() =>
                  navigate({
                    search: { ...search, page: (search.page ?? 1) + 1 },
                  })
                }
              >
                ถัดไป
              </button>
            </div>
          )}
        </div>
    </div>
  );
}
