import { ProductCard } from "@/components/storefront/product-card";
import type { ProductPublicDto } from "@/types/api/products";

type ProductFeedProps = {
  title?: string;
  products: ProductPublicDto[];
  emptyMessage?: string;
  memberPrices?: Record<string, number>;
};

export function ProductFeed({
  title = "สินค้าแนะนำ",
  products,
  emptyMessage = "ยังไม่มีสินค้า",
  memberPrices,
}: ProductFeedProps) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-lg font-bold text-primary">{title}</h2>
        <div className="h-px flex-1 bg-border" />
      </div>
      {products.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
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
