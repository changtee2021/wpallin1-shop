import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ProductImage } from "@/components/storefront/product-image";
import { ProductOptionSelectors } from "@/components/storefront/product-option-selectors";
import { ProductReviews } from "@/components/storefront/product-reviews";
import { RecentlyViewedSection } from "@/components/storefront/recently-viewed-section";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import {
  fetchProductBySlug,
  fetchProductReviewSummary,
} from "@/lib/api.functions";
import { formatPrice } from "@/lib/format";
import {
  buildOptionSnapshot,
  type SelectedProductOptions,
} from "@/domain/product-options";
import { absoluteUrl, getDefaultOgImageUrl } from "@/lib/public-url";
import { buildProductJsonLd } from "@/lib/seo-structured-data";
import { trackRecentlyViewed } from "@/lib/recently-viewed";
import { useT } from "@/i18n";

const ATTRIBUTE_LABELS: Record<string, string> = {
  color: "สี",
  material: "วัสดุ",
  opacity: "ความทึบแสง",
  style: "สไตล์",
  size: "ขนาด",
  width: "ความกว้าง",
  height: "ความสูง",
  length: "ความยาว",
  pattern: "ลวดลาย",
  finish: "พื้นผิว",
  warranty: "การรับประกัน",
  origin: "แหล่งผลิต",
  brand: "แบรนด์",
  fabric: "เนื้อผ้า",
  moq: "ขั้นต่ำ",
  pack: "แพ็ก",
};

function formatAttrLabel(key: string): string {
  if (ATTRIBUTE_LABELS[key]) return ATTRIBUTE_LABELS[key];
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatAttrValue(value: unknown): string {
  if (value == null) return "-";
  if (typeof value === "boolean") return value ? "ใช่" : "ไม่";
  if (Array.isArray(value)) return value.map((v) => String(v)).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

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

    const reviewSummary = await fetchProductReviewSummary({
      data: { productId: product.id },
    }).catch(() => ({ average: 0, count: 0 }));

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
  const [selectedOptions, setSelectedOptions] = useState<SelectedProductOptions>(
    () => {
      const initial: SelectedProductOptions = {};
      for (const group of product.optionGroups) {
        if (group.choices[0]) {
          initial[group.groupKey] = group.choices[0].key;
        }
      }
      return initial;
    },
  );

  const optionSnapshot = buildOptionSnapshot(
    product.optionGroups,
    selectedOptions,
  );
  const displayPrice = product.retailPrice + optionSnapshot.priceDelta;

  useEffect(() => {
    trackRecentlyViewed(product);
  }, [product]);

  async function handleAddToCart() {
    setAdding(true);
    try {
      await addItem(product.id, qty, selectedOptions);
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

  const attributeEntries = product.attributes
    ? Object.entries(product.attributes).filter(
        ([, value]) => value != null && value !== "",
      )
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-muted/30">
          <ProductImage src={product.imageUrl} alt={product.name} />
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
              {formatPrice(displayPrice)}
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
                <span>
                  {product.moq} {product.unit ?? "ชิ้น"}
                </span>
              </div>
              {product.unit && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">หน่วย</span>
                  <span>{product.unit}</span>
                </div>
              )}
              {product.weightKg != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">น้ำหนัก</span>
                  <span>{product.weightKg} กก.</span>
                </div>
              )}
              {product.leadTimeDays != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ระยะเวลาผลิต</span>
                  <span>{product.leadTimeDays} วัน</span>
                </div>
              )}
            </CardContent>
          </Card>

          <ProductOptionSelectors
            groups={product.optionGroups}
            value={selectedOptions}
            onChange={setSelectedOptions}
          />

          {attributeEntries.length > 0 && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <h2 className="mb-3 text-sm font-semibold">รายละเอียดสินค้า</h2>
                <div className="grid gap-2 text-sm">
                  {attributeEntries.map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-4">
                      <span className="text-muted-foreground">
                        {formatAttrLabel(key)}
                      </span>
                      <span className="text-right">
                        {formatAttrValue(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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
