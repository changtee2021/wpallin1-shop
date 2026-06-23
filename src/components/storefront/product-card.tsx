import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import type { ProductPublicDto } from "@/types/api/products";

type ProductCardProps = {
  product: ProductPublicDto;
  memberPrice?: number;
};

export function ProductCard({ product, memberPrice }: ProductCardProps) {
  const displayPrice = memberPrice ?? product.retailPrice;
  const hasMemberDiscount =
    memberPrice != null && memberPrice < product.retailPrice;
  const hasCompareDiscount =
    !hasMemberDiscount &&
    product.compareAtPrice != null &&
    product.compareAtPrice > product.retailPrice;

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group block"
    >
      <Card className="overflow-hidden border-border/60 bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="size-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              ไม่มีรูป
            </div>
          )}
          {product.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-accent text-white hover:bg-accent">
              แนะนำ
            </Badge>
          )}
        </div>
        <div className="space-y-1 p-3">
          <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-snug">
            {product.name}
          </p>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-base font-semibold text-accent">
              {formatPrice(displayPrice)}
            </span>
            {hasMemberDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.retailPrice)}
              </span>
            )}
            {hasCompareDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
          {hasMemberDiscount && (
            <p className="text-[11px] font-medium text-primary">ราคาสมาชิก</p>
          )}
          {product.stock > 0 && (
            <p className="text-[11px] text-muted-foreground">
              ขายแล้ว {Math.floor(product.stock * 0.3)}+
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
