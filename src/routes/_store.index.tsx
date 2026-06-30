import { createFileRoute } from "@tanstack/react-router";

import { PageLoading } from "@/components/loading";
import { CategoryImageGrid } from "@/components/storefront/category-image-grid";
import { HomeCatalogCta } from "@/components/storefront/catalog-category-hero";
import { HomeCapabilities } from "@/components/storefront/home/home-capabilities";
import { HomeCta } from "@/components/storefront/home/home-cta";
import { HomeDealerCta } from "@/components/storefront/home/home-dealer-cta";
import { HomeHero } from "@/components/storefront/home/home-hero";
import { HomeInspirationPreview } from "@/components/storefront/home/home-inspiration-preview";
import { HomeProcess } from "@/components/storefront/home/home-process";
import { HomeSolutions } from "@/components/storefront/home/home-solutions";
import { HomeValuePillars } from "@/components/storefront/home/home-value-pillars";
import { ProductFeed } from "@/components/storefront/product-feed";
import { StorePage } from "@/components/layout/store-page";
import { resolveInspirationRooms } from "@/data/inspiration-fallback";
import { useMemberProductPrices } from "@/hooks/use-member-product-prices";
import { useT } from "@/i18n";
import {
  fetchCategories,
  fetchHeroBanners,
  fetchPublicInspirationRooms,
  fetchPublicProducts,
} from "@/lib/api.functions";

export const Route = createFileRoute("/_store/")({
  loader: async () => {
    const productQuery = {
      pageSize: 8,
      sortBy: "created_at" as const,
      sortDir: "desc" as const,
    };

    const [
      featuredResult,
      fallbackResult,
      categories,
      heroBanners,
      inspirationRooms,
    ] = await Promise.all([
      fetchPublicProducts({
        data: { ...productQuery, featured: true },
      }),
      fetchPublicProducts({ data: productQuery }),
      fetchCategories(),
      fetchHeroBanners(),
      fetchPublicInspirationRooms().then((rooms) =>
        resolveInspirationRooms(async () => rooms),
      ),
    ]);

    const featuredProducts = featuredResult.data.length
      ? featuredResult.data
      : fallbackResult.data;

    return { featuredProducts, categories, heroBanners, inspirationRooms };
  },
  pendingComponent: () => <PageLoading variant="grid" />,
  component: HomePage,
});

function HomePage() {
  const { t } = useT();
  const { featuredProducts, categories, heroBanners, inspirationRooms } =
    Route.useLoaderData();
  const memberPrices = useMemberProductPrices(featuredProducts);

  return (
    <StorePage className="space-y-8 sm:space-y-10 md:space-y-12">
      <HomeHero banners={heroBanners} />

      {categories.length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-bold text-primary sm:mb-5 sm:text-xl">
            {t("home.categories.title")}
          </h2>
          <CategoryImageGrid categories={categories} />
        </section>
      ) : null}

      <ProductFeed
        title={t("home.popular.title")}
        products={featuredProducts}
        memberPrices={memberPrices}
        seeAllHref="/shop"
        seeAllLabel={t("home.featured.seeAll")}
      />

      <div className="space-y-10 md:space-y-14">
        <HomeValuePillars />
        <HomeInspirationPreview rooms={inspirationRooms} />
        <HomeCapabilities />
        <HomeCatalogCta
          title={t("home.catalogs.title")}
          body={t("home.catalogs.body")}
          cta={t("home.catalogs.cta")}
        />
        <HomeSolutions />
        <HomeDealerCta />
        <HomeProcess />
        <HomeCta />
      </div>
    </StorePage>
  );
}
