import { ArrowRight } from "lucide-react";

import { ProductImage } from "@/components/storefront/product-image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ConfiguratorCatalog } from "@/domain/configurator";
import { formatPrice } from "@/lib/format";

type ConfiguratorProductType = ConfiguratorCatalog["productTypes"][number];

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1513694203232-719a28002207?w=1400&h=560&fit=crop";

function formatStartingPrice(opt: ConfiguratorProductType): string {
  if (opt.startingPrice != null && opt.startingPrice > 0) {
    return `ตั้งแต่ ${formatPrice(opt.startingPrice)}`;
  }
  if (opt.priceDelta > 0) {
    return `เริ่มต้น +${formatPrice(opt.priceDelta)}`;
  }
  return "ตั้งแต่ 1,500";
}

function pickHeroImage(productTypes: ConfiguratorProductType[]): string {
  return productTypes.find((p) => p.imageUrl)?.imageUrl ?? DEFAULT_HERO_IMAGE;
}

export function ConfiguratorProductGrid({
  productTypes,
  onSelect,
}: {
  productTypes: ConfiguratorProductType[];
  onSelect: (key: string) => void;
}) {
  const heroImage = pickHeroImage(productTypes);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border bg-muted/20 shadow-sm">
        <div className="relative aspect-[21/9] max-h-72 w-full overflow-hidden sm:aspect-[2.4/1]">
          <ProductImage src={heroImage} alt="Custom curtains preview" fill />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4 sm:p-6">
            <Badge className="mb-2 bg-accent text-white hover:bg-accent">
              Custom
            </Badge>
            <p className="max-w-lg text-sm font-medium text-white sm:text-base">
              สั่งทำผ้าม่านตามขนาด — เลือกแบบ ผ้า ราง และบริการติดตั้ง
            </p>
            <p className="mt-1 text-xs text-white/80 sm:text-sm">
              Made-to-order curtains — pick a style below to customize
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">เลือกสินค้าที่ต้องการสั่งทำ</h2>
        <p className="text-sm text-muted-foreground">
          Select a product to customize | เลือกสินค้าก่อนเริ่มออกแบบ
        </p>
      </div>

      {productTypes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          ยังไม่มีสินค้าสั่งทำให้เลือกในขณะนี้
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {productTypes.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSelect(opt.key)}
              className="group text-left"
            >
              <Card className="h-full overflow-hidden border-border/60 bg-white p-4 shadow-sm transition-shadow hover:border-primary/40 hover:shadow-md">
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">
                      {opt.label}
                    </p>
                    <Badge
                      variant="outline"
                      className="shrink-0 border-accent/30 text-[10px] text-accent"
                    >
                      Custom
                    </Badge>
                  </div>
                  {opt.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {opt.description}
                    </p>
                  )}
                  <p className="text-base font-semibold text-accent">
                    {formatStartingPrice(opt)}
                  </p>
                  <span className="inline-flex items-center gap-1 pt-1 text-sm font-medium text-primary">
                    Customize
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
