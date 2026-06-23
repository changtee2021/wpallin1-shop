import { createFileRoute } from "@tanstack/react-router";

import { CategoryRail } from "@/components/storefront/category-rail";
import { ProductFeed } from "@/components/storefront/product-feed";
import { PromoBanner } from "@/components/storefront/promo-banner";
import { useMemberProductPrices } from "@/hooks/use-member-product-prices";
import { fetchCategories, fetchPublicProducts } from "@/lib/api.functions";

export const Route = createFileRoute("/_store/")({
  loader: async () => {
    const [products, categories] = await Promise.all([
      fetchPublicProducts({
        data: { pageSize: 16, sortBy: "created_at", sortDir: "desc" },
      }),
      fetchCategories(),
    ]);
    return { products: products.data, categories };
  },
  component: HomePage,
});

function HomePage() {
  const { products, categories } = Route.useLoaderData();
  const memberPrices = useMemberProductPrices(products);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6">
      <PromoBanner />
      {categories.length > 0 && <CategoryRail categories={categories} />}
      <ProductFeed
        title="สินค้าแนะนำ"
        products={products}
        memberPrices={memberPrices}
      />
    </div>
  );
}
