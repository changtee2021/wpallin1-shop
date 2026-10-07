import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { ProductImage } from "@/components/storefront/product-image";
import { Price } from "@/components/ui/price";
import { cn } from "@/lib/utils";
import type { ProductPublicDto } from "@/types/api/products";

type ShopProductCardProps = {
  product: ProductPublicDto;
  /** Dealer price for the signed-in dealer, when lower than retail. */
  dealerPrice?: number;
  className?: string;
};

export function productAvailabilityLabel(product: ProductPublicDto): string {
  if (product.productType === "custom") return "สั่งทำตามขนาด";
  return product.stock > 0 ? "พร้อมส่ง" : "สั่งจอง";
}

export function ShopProductPrice({
  product,
  dealerPrice,
  size = "sm",
}: {
  product: ProductPublicDto;
  dealerPrice?: number;
  size?: "sm" | "lg";
}) {
  const large = size === "lg";
  if (product.retailPrice <= 0) {
    return (
      <p className={cn("font-medium", large ? "text-xl" : "text-sm")}>
        สอบถามราคา
      </p>
    );
  }

  const showDealer = dealerPrice != null && dealerPrice < product.retailPrice;
  const unit = product.unit ? `/ ${product.unit}` : "";

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span
        className={cn(
          "font-semibold tracking-tight text-foreground",
          large ? "text-3xl" : "text-base",
        )}
      >
        <Price amount={showDealer ? dealerPrice : product.retailPrice} />
      </span>
      {unit ? (
        <span className="text-xs text-muted-foreground">{unit}</span>
      ) : null}
      {showDealer ? (
        <>
          <span className="text-xs text-muted-foreground line-through">
            <Price amount={product.retailPrice} />
          </span>
          <span className="brand-kicker w-full text-[0.625rem] text-primary">
            ราคาตัวแทน
          </span>
        </>
      ) : null}
    </div>
  );
}

export function ShopProductCard({
  product,
  dealerPrice,
  className,
}: ShopProductCardProps) {
  return (
    <Link
      to="/shop/$slug"
      params={{ slug: product.slug }}
      className={cn(
        "group flex flex-col rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4",
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-surface">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <span className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full bg-white/90 text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <p className="brand-index flex items-center gap-2 text-[0.6875rem] text-muted-foreground">
          <span className="truncate">{product.sku}</span>
          <span aria-hidden className="h-px w-3 shrink-0 bg-border" />
          <span className="shrink-0">{productAvailabilityLabel(product)}</span>
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-base leading-snug font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <div className="mt-auto pt-3">
          <ShopProductPrice product={product} dealerPrice={dealerPrice} />
        </div>
      </div>
    </Link>
  );
}
