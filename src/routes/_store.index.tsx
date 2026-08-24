import { createFileRoute } from "@tanstack/react-router";

import { PageLoading } from "@/components/loading";
import { CategoryImageGrid } from "@/components/storefront/category-image-grid";
import { HomeCapabilities } from "@/components/storefront/home/home-capabilities";
import { HomeCatalogSection } from "@/components/storefront/home/home-catalog-section";
import { HomeDealerCta } from "@/components/storefront/home/home-dealer-cta";
import { HomeFactoryTour3D } from "@/components/storefront/home/home-factory-tour-3d";
import { HomeGalleryStrip } from "@/components/storefront/home/home-gallery-strip";
import { HomeHero } from "@/components/storefront/home/home-hero";
import { HomeStatsBand } from "@/components/storefront/home/home-stats-band";
import { ProductFeed } from "@/components/storefront/product-feed";
import { RevealOnScroll } from "@/components/storefront/reveal-on-scroll";
import { StorePage } from "@/components/layout/store-page";
import { useMemberProductPrices } from "@/hooks/use-member-product-prices";
import { useT } from "@/i18n";
import {
  fetchCategories,
  fetchPublicMarketingCatalogs,
  fetchPublicProducts,
} from "@/lib/api.functions";

export const Route = createFileRoute("/_store/")({
  loader: async () => {
    const productQuery = {
      pageSize: 8,
      sortBy: "created_at" as const,
      sortDir: "desc" as const,
    };

    const [featuredResult, fallbackResult, categories, catalogs] =
      await Promise.all([
        fetchPublicProducts({
          data: { ...productQuery, featured: true },
        }),
        fetchPublicProducts({ data: productQuery }),
        fetchCategories(),
        fetchPublicMarketingCatalogs({ data: {} }),
      ]);

    const featuredProducts = featuredResult.data.length
      ? featuredResult.data
      : fallbackResult.data;

    return { featuredProducts, categories, catalogs };
  },
  pendingComponent: () => <PageLoading variant="grid" />,
  component: HomePage,
});

function HomePage() {
  const { t } = useT();
  const { featuredProducts, categories, catalogs } = Route.useLoaderData();
  const memberPrices = useMemberProductPrices(featuredProducts);

  return (
    <>
      <HomeHero />
      <RevealOnScroll direction="none">
        <HomeGalleryStrip />
      </RevealOnScroll>
      <StorePage className="space-y-8 sm:space-y-10 md:space-y-12">
        {categories.length > 0 ? (
          <RevealOnScroll>
            <section>
              <h2 className="mb-4 text-lg font-bold text-primary sm:mb-5 sm:text-xl">
                {t("home.categories.title")}
              </h2>
              <CategoryImageGrid categories={categories} />
            </section>
          </RevealOnScroll>
        ) : null}

        <RevealOnScroll>
          <ProductFeed
            title={t("home.popular.title")}
            products={featuredProducts}
            memberPrices={memberPrices}
            seeAllHref="/shop"
            seeAllLabel={t("home.featured.seeAll")}
          />
        </RevealOnScroll>

        <HomeCatalogSection catalogs={catalogs} />

        <div className="space-y-10 md:space-y-14">
          <div>
            <RevealOnScroll>
              <HomeStatsBand />
            </RevealOnScroll>
            <RevealOnScroll>
              <HomeFactoryTour3D />
            </RevealOnScroll>
          </div>
          <RevealOnScroll>
            <HomeDealerCta />
          </RevealOnScroll>
        </div>
      </StorePage>
      <HomeCapabilities />
    </>
  );
}
