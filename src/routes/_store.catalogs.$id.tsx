import {
  createFileRoute,
  Link,
  notFound,
  redirect,
} from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

import { CatalogCategoryProducts } from "@/components/storefront/catalog-category-products";
import { CatalogDealerLock } from "@/components/storefront/catalog-dealer-lock";
import { CatalogStickyCta } from "@/components/storefront/catalog-sticky-cta";
import { CatalogViewer } from "@/components/storefront/catalog-viewer";
import { MarketingCatalogGrid } from "@/components/storefront/marketing-catalog-grid";
import { Button } from "@/components/ui/button";
import { useMemberProductPrices } from "@/hooks/use-member-product-prices";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchCatalogCategoryProducts,
  fetchMarketingCatalogAccess,
  fetchRelatedMarketingCatalogs,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { isUuid } from "@/lib/catalog-slug";
import { absoluteUrl, getDefaultOgImageUrl } from "@/lib/public-url";
import { useT } from "@/i18n";
import type { ProductPublicDto } from "@/types/api/products";
import type {
  MarketingCatalogAccessDto,
  MarketingCatalogDto,
} from "@/types/api/marketing-catalogs";

const searchSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
});

export const Route = createFileRoute("/_store/catalogs/$id")({
  validateSearch: searchSchema,
  head: ({ loaderData }) => {
    if (!loaderData?.access) return {};
    const { catalog } = loaderData.access;
    const canonical = absoluteUrl(`/catalogs/${catalog.slug}`);
    const description =
      catalog.description?.slice(0, 160) ??
      `${catalog.title} — WP ALL product catalog`;
    const ogImage = catalog.coverImageUrl ?? getDefaultOgImageUrl();

    return {
      meta: [
        { title: `${catalog.title} | WP ALL Catalog` },
        { name: "description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:title", content: catalog.title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
        { property: "og:image", content: ogImage },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  loader: async ({ params }) => {
    const access = await fetchMarketingCatalogAccess({
      data: { ref: params.id },
    });
    if (!access) throw notFound();

    if (isUuid(params.id) && access.catalog.slug !== params.id) {
      throw redirect({
        to: "/catalogs/$id",
        params: { id: access.catalog.slug },
        replace: true,
      });
    }

    const related =
      access.access === "full"
        ? await fetchRelatedMarketingCatalogs({
            data: { catalogId: access.catalog.id, limit: 4 },
          })
        : [];

    const categoryProducts =
      access.access === "full"
        ? await fetchCatalogCategoryProducts({
            data: { catalogId: access.catalog.id, limit: 8 },
          })
        : { products: [], shopCategorySlug: null };

    return { access, related, categoryProducts };
  },
  component: CatalogViewerPage,
});

function CatalogViewerPage() {
  const { t } = useT();
  const { session } = useAuth();
  const authOpts = authServerFnOptions(session);
  const loaderData = Route.useLoaderData();
  const [access, setAccess] = useState<MarketingCatalogAccessDto>(
    loaderData.access,
  );
  const [related, setRelated] = useState<MarketingCatalogDto[]>(
    loaderData.related,
  );
  const [categoryProducts, setCategoryProducts] = useState<ProductPublicDto[]>(
    loaderData.categoryProducts.products,
  );
  const [shopCategorySlug, setShopCategorySlug] = useState<string | null>(
    loaderData.categoryProducts.shopCategorySlug,
  );
  const memberPrices = useMemberProductPrices(categoryProducts);
  const { page } = Route.useSearch();
  const { catalog } = access;
  const locked = access.access === "locked";

  useEffect(() => {
    setAccess(loaderData.access);
    setRelated(loaderData.related);
    setCategoryProducts(loaderData.categoryProducts.products);
    setShopCategorySlug(loaderData.categoryProducts.shopCategorySlug);
  }, [loaderData.access, loaderData.related, loaderData.categoryProducts]);

  useEffect(() => {
    if (!session?.access_token) return;
    void (async () => {
      const next = await fetchMarketingCatalogAccess({
        data: { ref: catalog.slug },
        ...authOpts,
      });
      if (!next) return;
      setAccess(next);
      if (next.access === "full") {
        const [items, productsResult] = await Promise.all([
          fetchRelatedMarketingCatalogs({
            data: { catalogId: next.catalog.id, limit: 4 },
            ...authOpts,
          }),
          fetchCatalogCategoryProducts({
            data: { catalogId: next.catalog.id, limit: 8 },
          }),
        ]);
        setRelated(items);
        setCategoryProducts(productsResult.products);
        setShopCategorySlug(productsResult.shopCategorySlug);
      } else {
        setRelated([]);
        setCategoryProducts([]);
        setShopCategorySlug(null);
      }
    })();
  }, [session?.access_token, catalog.slug, authOpts]);

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 pb-8 sm:px-6 sm:py-6 md:py-8">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 sm:h-9 sm:px-3"
          asChild
        >
          <Link to="/catalogs">
            <ArrowLeft className="size-4 shrink-0" />
            <span className="hidden sm:inline">
              {t("catalogs.viewer.back")}
            </span>
          </Link>
        </Button>
      </div>

      <header className="mb-4 space-y-1.5 sm:mb-6 sm:space-y-2">
        <h1 className="text-lg font-bold leading-tight sm:text-2xl">
          {catalog.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-sm">
          {catalog.categoryName ? <span>{catalog.categoryName}</span> : null}
          {catalog.version ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] sm:text-xs">
              {catalog.version}
            </span>
          ) : null}
          {catalog.pageCount ? (
            <span>
              {catalog.pageCount} {t("catalogs.card.pages")}
            </span>
          ) : null}
        </div>
        {catalog.description ? (
          <p className="line-clamp-2 text-xs text-muted-foreground sm:line-clamp-none sm:text-sm">
            {catalog.description}
          </p>
        ) : null}
      </header>

      {locked ? (
        <CatalogDealerLock catalog={catalog} />
      ) : catalog.pdfUrl ? (
        <>
          <CatalogViewer
            pdfUrl={catalog.pdfUrl}
            title={catalog.title}
            slug={catalog.slug}
            catalogId={catalog.id}
            allowDownload={catalog.allowDownload}
            initialPage={page ?? 1}
          />
          <CatalogStickyCta className="mt-4 sm:mt-6" />
        </>
      ) : (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          {t("catalogs.viewer.noPdf")}
        </div>
      )}

      {!locked && categoryProducts.length > 0 ? (
        <section className="mt-10 sm:mt-12">
          <CatalogCategoryProducts
            products={categoryProducts}
            categoryName={catalog.categoryName}
            shopCategorySlug={shopCategorySlug}
            memberPrices={memberPrices}
          />
        </section>
      ) : null}

      {!locked && related.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold">
            {t("catalogs.viewer.related")}
          </h2>
          <MarketingCatalogGrid catalogs={related} compact />
        </section>
      ) : null}

    </div>
  );
}
