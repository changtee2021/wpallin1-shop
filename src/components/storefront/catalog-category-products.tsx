import { ProductFeed } from "@/components/storefront/product-feed";
import { useT } from "@/i18n";
import type { ProductPublicDto } from "@/types/api/products";

type Props = {
  products: ProductPublicDto[];
  categoryName: string | null;
  shopCategorySlug: string | null;
  memberPrices?: Record<string, number>;
};

export function CatalogCategoryProducts({
  products,
  categoryName,
  shopCategorySlug,
  memberPrices,
}: Props) {
  const { t } = useT();

  if (!products.length) return null;

  const title = categoryName
    ? t("catalogs.viewer.categoryProducts").replace("{category}", categoryName)
    : t("catalogs.viewer.categoryProductsFallback");

  const seeAllHref = shopCategorySlug
    ? `/shop?category=${encodeURIComponent(shopCategorySlug)}`
    : "/shop";

  return (
    <ProductFeed
      title={title}
      products={products}
      memberPrices={memberPrices}
      seeAllHref={seeAllHref}
      seeAllLabel={t("catalogs.viewer.seeCategoryProducts")}
      emptyMessage={t("catalogs.viewer.categoryProductsEmpty")}
    />
  );
}
