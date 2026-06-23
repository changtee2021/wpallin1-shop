import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ProductReviews } from "@/components/storefront/product-reviews";
import { RecentlyViewedSection } from "@/components/storefront/recently-viewed-section";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { fetchProductBySlug } from "@/lib/api.functions";
import { formatPrice } from "@/lib/format";
import { absoluteUrl, getDefaultOgImageUrl } from "@/lib/public-url";
import { buildProductJsonLd } from "@/lib/seo-structured-data";
import { trackRecentlyViewed } from "@/lib/recently-viewed";
import { getAdminClient } from "@/lib/server-fns/_shared";
import { getProductReviewSummary } from "@/services/review.service";
import { useT } from "@/i18n";

export const Route = createFileRoute("/_store/products/$slug")({
  head: ({ loaderData }) => {
    if (!loaderData?.product) return {};

    const { product, reviewSummary } = loaderData;
    const canonical = absoluteUrl(`/products/${product.slug}`);
    const ogImage = product.imageUrl ?? getDefaultOgImageUrl();
    const description = product.description?.slice(0, 160) ?? product.name;

    return {
      meta: [
        { title: `${product.name} | WP ALL` },
        { name: "description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:title", content: product.name },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
        { property: "og:image", content: ogImage },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(buildProductJsonLd(product, reviewSummary)),
        },
      ],
    };
  },
  loader: async ({ params }) => {
    const product = await fetchProductBySlug({ data: { slug: params.slug } });
    if (!product) throw new Error("Product not found");

    const supabase = await getAdminClient();
    const reviewSummary = await getProductReviewSummary(supabase, product.id);

    return { product, reviewSummary };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { product } = Route.useLoaderData();
  const { addItem } = useCart();
  const { t } = useT();
  const [qty, setQty] = useState(product.moq);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    trackRecentlyViewed(product);
  }, [product]);

  async function handleAddToCart() {
    setAdding(true);
    try {
      await addItem(product.id, qty);
      toast.success("เพิ่มลงตะกร้าแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เพิ่มไม่สำเร็จ");
    } finally {
      setAdding(false);
    }
  }

  const hasDiscount =
    product.compareAtPrice != null &&
    product.compareAtPrice > product.retailPrice;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-muted/30">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="size-full object-cover"
            />
          ) : null}
        </div>
        <div>
          {product.categoryName && (
            <Badge variant="secondary">{product.categoryName}</Badge>
          )}
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
            {product.name}
          </h1>
          {product.description && (
            <p className="mt-3 text-muted-foreground">{product.description}</p>
          )}
          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-3xl font-bold text-accent">
              {formatPrice(product.retailPrice)}
            </p>
            {hasDiscount && (
              <p className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice!)}
              </p>
            )}
          </div>
          <Separator className="my-6" />
          <Card>
            <CardContent className="grid gap-2 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">SKU</span>
                <span>{product.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">สต็อก</span>
                <span>
                  {product.stock > 0 ? `${product.stock} ชิ้น` : "สั่งจอง"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ขั้นต่ำ</span>
                <span>{product.moq} ชิ้น</span>
              </div>
            </CardContent>
          </Card>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Input
              type="number"
              min={product.moq}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-24"
            />
            <Button
              className="bg-accent hover:bg-accent/90"
              disabled={adding}
              onClick={() => void handleAddToCart()}
            >
              {adding ? "กำลังเพิ่ม..." : t("nav.cart")}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/cart">ดูตะกร้า</Link>
            </Button>
            <WishlistButton productId={product.id} />
          </div>
        </div>
      </div>
      <div className="mt-12">
        <ProductReviews productId={product.id} />
      </div>
      <RecentlyViewedSection />
    </div>
  );
}
