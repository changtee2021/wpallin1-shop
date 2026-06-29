import { createFileRoute } from "@tanstack/react-router";

import { PageLoading } from "@/components/loading";
import { CategoryImageGrid } from "@/components/storefront/category-image-grid";
import { HomeCatalogCta } from "@/components/storefront/catalog-category-hero";
import { HomeCapabilities } from "@/components/storefront/home/home-capabilities";
import { HomeCta } from "@/components/storefront/home/home-cta";
import { HomeHero } from "@/components/storefront/home/home-hero";
import { HomeProcess } from "@/components/storefront/home/home-process";
import { HomeSolutions } from "@/components/storefront/home/home-solutions";
import { ProductFeed } from "@/components/storefront/product-feed";
import { useMemberProductPrices } from "@/hooks/use-member-product-prices";
import { useT } from "@/i18n";
import {
  fetchCategories,
  fetchHeroBanners,
  fetchPublicProducts,
} from "@/lib/api.functions";

export const Route = createFileRoute("/_store/")({
  loader: async () => {
    const productQuery = {
      pageSize: 8,
      sortBy: "created_at" as const,
      sortDir: "desc" as const,
    };

    const [featuredResult, fallbackResult, categories, heroBanners] =
      await Promise.all([
        fetchPublicProducts({
          data: { ...productQuery, featured: true },
        }),
        fetchPublicProducts({ data: productQuery }),
        fetchCategories(),
        fetchHeroBanners(),
      ]);

    const featuredProducts = featuredResult.data.length
      ? featuredResult.data
      : fallbackResult.data;

    return { featuredProducts, categories, heroBanners };
  },
  pendingComponent: () => <PageLoading variant="grid" />,
  component: HomePage,
});

function HomePage() {
  const { t } = useT();
  const { featuredProducts, categories, heroBanners } = Route.useLoaderData();
  const memberPrices = useMemberProductPrices(featuredProducts);

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:px-6 sm:py-8 md:space-y-14">
      <HomeHero banners={heroBanners} />
      <HomeCapabilities />
      {categories.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-primary sm:text-xl">
            {t("home.categories.title")}
          </h2>
          <CategoryImageGrid categories={categories} />
        </section>
      )}
      <HomeCatalogCta
        title={t("home.catalogs.title")}
        body={t("home.catalogs.body")}
        cta={t("home.catalogs.cta")}
      />
      <ProductFeed
        title={t("home.featured.title")}
        products={featuredProducts}
        memberPrices={memberPrices}
        seeAllHref="/shop"
        seeAllLabel={t("home.featured.seeAll")}
      />
      <HomeSolutions />
      <HomeProcess />
      <HomeCta />
    </div>
  );
}
