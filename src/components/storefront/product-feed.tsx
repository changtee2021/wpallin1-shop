import { Link } from "@tanstack/react-router";

import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import type { ProductPublicDto } from "@/types/api/products";

type ProductFeedProps = {
  title?: string;
  products: ProductPublicDto[];
  emptyMessage?: string;
  memberPrices?: Record<string, number>;
  seeAllHref?: string;
  seeAllLabel?: string;
};

export function ProductFeed({
  title = "สินค้าแนะนำ",
  products,
  emptyMessage = "ยังไม่มีสินค้า",
  memberPrices,
  seeAllHref,
  seeAllLabel = "ดูสินค้าทั้งหมด",
}: ProductFeedProps) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-lg font-bold text-primary sm:text-xl">{title}</h2>
        <div className="h-px flex-1 bg-border" />
        {seeAllHref ? (
          <Button variant="outline" size="sm" className="shrink-0" asChild>
            <Link to={seeAllHref}>{seeAllLabel}</Link>
          </Button>
        ) : null}
      </div>
      {products.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              memberPrice={memberPrices?.[product.id]}
            />
          ))}
        </div>
      )}
    </section>
  );
}
