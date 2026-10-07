import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
} from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  Loader2,
  MessageCircle,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ArrowFillButton } from "@/components/brand/arrow-fill-link";
import { SectionHeading } from "@/components/brand/section-heading";
import {
  DealerGateDialog,
  type DealerGateProduct,
} from "@/components/shop/dealer-gate-dialog";
import {
  productAvailabilityLabel,
  ShopProductCard,
  ShopProductPrice,
} from "@/components/shop/shop-product-card";
import { ProductImage } from "@/components/storefront/product-image";
import { ProductOptionSelectors } from "@/components/storefront/product-option-selectors";
import { Button } from "@/components/ui/button";
import { ListErrorState } from "@/components/ui/list-query-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  buildOptionSnapshot,
  type SelectedProductOptions,
} from "@/domain/product-options";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useMemberProductPrices } from "@/hooks/use-member-product-prices";
import { fetchProductBySlug, fetchPublicProducts } from "@/lib/api.functions";
import { lineOaMessageUrl } from "@/lib/dealer-onboarding";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { ApiListResponse } from "@/types/api/common";
import type { ProductPublicDto } from "@/types/api/products";

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
  pack: "แพ็ก",
  composition: "ส่วนผสม",
  uv_blockage: "กันยูวี",
  openness: "ช่องแสง",
  thickness: "ความหนา",
  fabric_width: "หน้ากว้างผ้า",
  fire_rating: "กันลามไฟ",
};

function formatAttrLabel(key: string): string {
  return (
    ATTRIBUTE_LABELS[key] ??
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function formatAttrValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "ใช่" : "ไม่";
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export const Route = createFileRoute("/_store/shop/$slug")({
  loader: async ({ params }) => {
    const product = (await fetchProductBySlug({
      data: { slug: params.slug },
    })) as ProductPublicDto | null;
    if (!product) throw notFound();
    const related: ProductPublicDto[] = product.categorySlug
      ? await (
          fetchPublicProducts({
            data: { category: product.categorySlug, page: 1, pageSize: 9 },
          }) as Promise<ApiListResponse<ProductPublicDto>>
        )
          .then((res) => res.data.filter((p) => p.id !== product.id))
          .catch(() => [])
      : [];
    return { product, related: related.slice(0, 8) };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.product) return {};
    const { product } = loaderData;
    const head = pageHead({
      title: `${product.name} (${product.sku}) | WP ALL Shop`,
      description:
        product.description?.slice(0, 160) ??
        `${product.name} — สั่งซื้อสำหรับตัวแทนจำหน่าย WP ALL`,
      path: `/shop/${product.slug}`,
      image: product.imageUrl ?? undefined,
      type: "product",
    });
    return product.isMock
      ? {
          ...head,
          meta: [...head.meta, { name: "robots", content: "noindex, follow" }],
        }
      : head;
  },
  pendingComponent: DetailSkeleton,
  errorComponent: ({ reset }) => (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <ListErrorState message="โหลดสินค้าไม่สำเร็จ" onRetry={reset} />
    </div>
  ),
  component: ShopProductPage,
});

function DetailSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-20 pb-16 sm:px-6 md:grid-cols-[1.05fr_1fr] lg:gap-20 lg:px-8">
      <Skeleton className="aspect-[4/5] w-full rounded-sm" />
      <div className="space-y-5 md:pt-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-12 w-4/5" />
        <Skeleton className="h-9 w-1/3" />
        <Skeleton className="h-40 w-full rounded-none" />
        <Skeleton className="h-11 w-44 rounded-full" />
      </div>
    </div>
  );
}

function SectionKicker({
  index,
  children,
}: {
  index: string;
  children: string;
}) {
  return (
    <h2 className="brand-kicker flex items-center gap-3 text-primary">
      <span className="brand-index text-muted-foreground">{index}</span>
      <span aria-hidden className="h-px w-8 bg-border" />
      {children}
    </h2>
  );
}

function QtyStepper({
  value,
  min,
  onChange,
}: {
  value: number;
  min: number;
  onChange: (next: number) => void;
}) {
  const buttonClass =
    "flex size-11 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:opacity-40";
  return (
    <div className="inline-flex h-11 items-center overflow-hidden rounded-full border border-border">
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="ลดจำนวน"
      >
        <Minus className="size-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        value={value}
        onChange={(event) => {
          const next = Number(event.target.value);
          onChange(Number.isFinite(next) ? Math.max(min, next) : min);
        }}
        className="h-full w-14 border-x border-border bg-transparent text-center text-sm tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        aria-label="จำนวน"
      />
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(value + 1)}
        aria-label="เพิ่มจำนวน"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

function ShopProductPage() {
  const { product, related } = Route.useLoaderData();
  const navigate = useNavigate();
  const { user, isDealer, loading: authLoading } = useAuth();
  const { addItem } = useCart();
  const dealerPrices = useMemberProductPrices([product]);
  const relatedPrices = useMemberProductPrices(related);
  const [qty, setQty] = useState(Math.max(1, product.moq));
  const [busy, setBusy] = useState<"cart" | "buy" | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] =
    useState<SelectedProductOptions>(() => {
      const initial: SelectedProductOptions = {};
      for (const group of product.optionGroups) {
        if (group.choices[0]) initial[group.groupKey] = group.choices[0].key;
      }
      return initial;
    });

  const { priceDelta } = buildOptionSnapshot(
    product.optionGroups,
    selectedOptions,
  );
  const dealerBase = dealerPrices[product.id];
  const pricedProduct = {
    ...product,
    retailPrice: product.retailPrice > 0 ? product.retailPrice + priceDelta : 0,
  };
  const dealerPrice = dealerBase != null ? dealerBase + priceDelta : undefined;
  const unitPrice =
    dealerPrice != null && dealerPrice < pricedProduct.retailPrice
      ? dealerPrice
      : pricedProduct.retailPrice;

  const gateProduct: DealerGateProduct = {
    name: product.name,
    sku: product.sku,
    slug: product.slug,
    imageUrl: product.imageUrl,
  };
  const lineAskHref = lineOaMessageUrl(
    `สอบถามสินค้า ${product.name} (SKU ${product.sku})`,
  );

  async function handlePurchase(mode: "cart" | "buy") {
    if (authLoading) return;
    if (!isDealer) {
      setGateOpen(true);
      return;
    }
    setBusy(mode);
    try {
      await addItem(product.id, qty, selectedOptions);
      if (mode === "buy") {
        void navigate({ to: "/cart" });
      } else {
        toast.success("เพิ่มลงตะกร้าแล้ว", {
          action: {
            label: "ดูตะกร้า",
            onClick: () => void navigate({ to: "/cart" }),
          },
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เพิ่มไม่สำเร็จ");
    } finally {
      setBusy(null);
    }
  }

  const facts = [
    { label: "รหัสสินค้า", value: product.sku },
    ...(product.categoryName
      ? [{ label: "หมวด", value: product.categoryName }]
      : []),
    {
      label: "สถานะ",
      value:
        product.productType === "standard" && product.stock > 0
          ? `พร้อมส่ง · ${product.stock.toLocaleString()} ${product.unit ?? "ชิ้น"}`
          : productAvailabilityLabel(product),
    },
    {
      label: "สั่งขั้นต่ำ",
      value: `${product.moq} ${product.unit ?? "ชิ้น"}`,
    },
    ...(product.leadTimeDays != null
      ? [{ label: "ระยะผลิต", value: `${product.leadTimeDays} วัน` }]
      : []),
  ];

  const attributeEntries = product.attributes
    ? Object.entries(product.attributes).filter(
        ([, value]) => value != null && value !== "",
      )
    : [];

  const buyButtons = (compact: boolean) => (
    <>
      <ArrowFillButton
        onLight
        className={cn(compact ? "flex-1" : "min-w-44")}
        disabled={busy !== null}
        aria-busy={busy === "buy"}
        onClick={() => void handlePurchase("buy")}
      >
        {busy === "buy" ? "กำลังเพิ่ม…" : "สั่งซื้อเลย"}
      </ArrowFillButton>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-11 rounded-full border-foreground/20",
          compact ? "w-11 px-0" : "px-5",
        )}
        disabled={busy !== null}
        onClick={() => void handlePurchase("cart")}
      >
        {busy === "cart" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <ShoppingCart className="size-4" aria-hidden />
        )}
        <span className={cn(compact ? "sr-only" : "ml-2")}>ใส่ตะกร้า</span>
      </Button>
    </>
  );

  return (
    <div className="pb-28 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground"
        >
          <Link
            to="/shop"
            className="inline-flex min-h-11 items-center gap-2 font-medium text-primary hover:text-primary/80"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Shop
          </Link>
          {product.categorySlug ? (
            <>
              <span aria-hidden className="h-px w-4 bg-border" />
              <Link
                to="/shop"
                search={{ category: product.categorySlug }}
                className="inline-flex min-h-11 items-center hover:text-foreground"
              >
                {product.categoryName}
              </Link>
            </>
          ) : null}
        </nav>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pt-4 pb-16 sm:px-6 md:grid-cols-[1.05fr_1fr] lg:gap-20 lg:px-8 lg:pb-24">
        <div className="md:sticky md:top-28 md:self-start">
          <div className="aspect-[4/5] overflow-hidden rounded-sm bg-surface">
            <ProductImage src={product.imageUrl} alt={product.name} />
          </div>
        </div>

        <div className="md:pt-4">
          <p className="hero-blur-in brand-kicker flex items-center gap-3 text-primary">
            <span aria-hidden className="h-px w-8 bg-accent" />
            {productAvailabilityLabel(product)}
          </p>
          <h1 className="mt-5 text-[clamp(2rem,4.2vw,3.25rem)] leading-[1.1] font-medium tracking-tight text-balance text-foreground">
            {product.name}
          </h1>

          <div className="mt-8">
            <ShopProductPrice
              product={pricedProduct}
              dealerPrice={dealerPrice}
              size="lg"
            />
            {!isDealer && !authLoading && product.retailPrice > 0 ? (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                ราคาปลีกแนะนำ ร้านค้าที่เป็นตัวแทนเห็นราคาตัวแทนหลังเข้าสู่ระบบ{" "}
                <button
                  type="button"
                  onClick={() => setGateOpen(true)}
                  className="min-h-8 font-medium text-primary underline-offset-4 hover:underline"
                >
                  {user ? "เปิดบัญชีตัวแทน" : "เข้าสู่ระบบ / เปิดบัญชี"}
                </button>
              </p>
            ) : null}
          </div>

          <dl className="mt-10 divide-y divide-border border-y border-border">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="grid grid-cols-[6.5rem_1fr] gap-4 py-3 text-sm"
              >
                <dt className="text-muted-foreground">{fact.label}</dt>
                <dd className="text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>

          {product.optionGroups.length > 0 ? (
            <div className="mt-8">
              <ProductOptionSelectors
                groups={product.optionGroups}
                value={selectedOptions}
                onChange={setSelectedOptions}
              />
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <QtyStepper
              value={qty}
              min={Math.max(1, product.moq)}
              onChange={setQty}
            />
            {unitPrice > 0 ? (
              <p className="text-sm text-muted-foreground">
                รวม{" "}
                <span className="text-lg font-medium text-foreground tabular-nums">
                  ฿{(unitPrice * qty).toLocaleString()}
                </span>
              </p>
            ) : null}
          </div>

          <div className="mt-6 hidden flex-wrap gap-3 md:flex">
            {buyButtons(false)}
          </div>

          <a
            href={lineAskHref}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <MessageCircle className="size-4" aria-hidden />
            ถามเรื่องสินค้านี้กับเซลทาง LINE
            <ArrowUpRight className="size-3.5" aria-hidden />
          </a>

          {product.description ? (
            <div className="mt-14">
              <SectionKicker index="01">รายละเอียด</SectionKicker>
              <p className="mt-5 text-base leading-8 whitespace-pre-line text-pretty text-foreground/85">
                {product.description}
              </p>
            </div>
          ) : null}

          {attributeEntries.length > 0 ? (
            <div className="mt-14">
              <SectionKicker index={product.description ? "02" : "01"}>
                สเปก
              </SectionKicker>
              <dl className="mt-5 divide-y divide-border border-y border-border">
                {attributeEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-4 py-3 text-sm"
                  >
                    <dt className="text-muted-foreground">
                      {formatAttrLabel(key)}
                    </dt>
                    <dd>{formatAttrValue(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-border bg-surface/50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <SectionHeading
              kicker="More in this category"
              title={product.categoryName ?? "สินค้าที่เกี่ยวข้อง"}
              action={
                <Link
                  to="/shop"
                  search={{ category: product.categorySlug ?? undefined }}
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
                >
                  ดูทั้งหมด
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              }
            />
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4">
              {related.map((item) => (
                <ShopProductCard
                  key={item.id}
                  product={item}
                  dealerPrice={relatedPrices[item.id]}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pt-3 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-2">{buyButtons(true)}</div>
      </div>

      <DealerGateDialog
        open={gateOpen}
        onOpenChange={setGateOpen}
        product={gateProduct}
      />
    </div>
  );
}
