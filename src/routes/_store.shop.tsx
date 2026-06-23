import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ProductFeed } from "@/components/storefront/product-feed";
import { SearchBar } from "@/components/storefront/search-bar";
import { Checkbox } from "@/components/ui/checkbox";
import { useMemberProductPrices } from "@/hooks/use-member-product-prices";
import { fetchCategories, fetchPublicProducts } from "@/lib/api.functions";
import { useT } from "@/i18n";

const shopSearchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.number().optional(),
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
          sortBy: "created_at",
          sortDir: "desc",
        },
      }),
      fetchCategories(),
    ]);
    return { products, categories };
  },
  component: ShopPage,
});

function ShopPage() {
  const { t } = useT();
  const search = Route.useSearch();
  const { products, categories } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const memberPrices = useMemberProductPrices(products.data);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 lg:hidden">
        <SearchBar defaultValue={search.search ?? ""} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden space-y-4 rounded-xl border bg-white p-4 lg:block">
          <p className="text-sm font-semibold text-primary">
            {t("shop.filters")}
          </p>
          <div className="space-y-2">
            <button
              type="button"
              className="block w-full text-left text-sm hover:text-primary"
              onClick={() =>
                navigate({
                  search: { ...search, category: undefined, page: 1 },
                })
              }
            >
              ทั้งหมด
            </button>
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={search.category === cat.slug}
                  onCheckedChange={(checked) =>
                    navigate({
                      search: {
                        ...search,
                        category: checked ? cat.slug : undefined,
                        page: 1,
                      },
                    })
                  }
                />
                <span>{cat.name}</span>
              </label>
            ))}
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              แสดง {products.data.length} จาก {products.meta.total} รายการ
            </span>
            {search.search && <span>ค้นหา: &quot;{search.search}&quot;</span>}
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
    </div>
  );
}
