import { Link } from "@tanstack/react-router";
import { TicketPercent } from "lucide-react";

import { ProductImage } from "@/components/storefront/product-image";
import { ProductShareButton } from "@/components/storefront/product-share-button";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useCompare } from "@/hooks/use-compare";
import { formatPrice } from "@/lib/format";
import type { ProductPublicDto } from "@/types/api/products";

type ProductCardProps = {
  product: ProductPublicDto;
  memberPrice?: number;
  showCompare?: boolean;
};

function saleDiscountPercent(
  compareAtPrice: number,
  salePrice: number,
): number {
  if (compareAtPrice <= salePrice) return 0;
  return Math.round(((compareAtPrice - salePrice) / compareAtPrice) * 100);
}

export function ProductCard({
  product,
  memberPrice,
  showCompare = true,
}: ProductCardProps) {
  const { isSelected, toggle, isFull } = useCompare();
  const displayPrice = memberPrice ?? product.retailPrice;
  const hasMemberDiscount =
    memberPrice != null && memberPrice < product.retailPrice;
  const hasCompareDiscount =
    !hasMemberDiscount &&
    product.compareAtPrice != null &&
    product.compareAtPrice > product.retailPrice;
  const saleDiscountPct =
    hasCompareDiscount && product.compareAtPrice
      ? saleDiscountPercent(product.compareAtPrice, product.retailPrice)
      : 0;
  const selected = isSelected(product.id);

  return (
    <Card className="group overflow-hidden border-border/60 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="block size-full"
        >
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            imgClassName="transition-transform group-hover:scale-105"
          />
        </Link>

        {product.isFeatured && !product.isMock && (
          <Badge className="absolute top-2 left-2 bg-accent text-white hover:bg-accent">
            แนะนำ
          </Badge>
        )}

        {product.isMock && (
          <Badge
            variant="outline"
            className="absolute top-2 left-2 border-amber-500/60 bg-amber-50 text-amber-900 hover:bg-amber-50"
          >
            ทดสอบระบบ
          </Badge>
        )}

        {saleDiscountPct > 0 && (
          <div className="pointer-events-none absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-[11px] font-semibold text-accent backdrop-blur-sm">
            <TicketPercent className="size-3.5 shrink-0" aria-hidden />
            <span>ลด {saleDiscountPct}%</span>
          </div>
        )}

        {showCompare && (
          <div
            className="absolute top-2 right-2 z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Label
              htmlFor={`compare-${product.id}`}
              className="flex cursor-pointer items-center"
            >
              <Checkbox
                id={`compare-${product.id}`}
                checked={selected}
                disabled={!selected && isFull}
                onCheckedChange={() => toggle(product)}
                aria-label="เปรียบเทียบ"
              />
            </Label>
          </div>
        )}
      </div>

      <div className="space-y-1 p-3">
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="block"
        >
          <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-snug group-hover:text-primary">
            {product.name}
          </p>
        </Link>

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

        <div className="flex items-center justify-end gap-2 pt-0.5">
          <div className="ml-auto flex shrink-0 items-center">
            <WishlistButton productId={product.id} variant="ghost" />
            <ProductShareButton slug={product.slug} name={product.name} />
          </div>
        </div>
      </div>
    </Card>
  );
}
