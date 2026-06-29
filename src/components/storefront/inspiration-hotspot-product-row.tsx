import { Link } from "@tanstack/react-router";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ProductImage } from "@/components/storefront/product-image";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useT } from "@/i18n";
import { buildConfiguratorSearchFromHotspot } from "@/lib/configurator-share";
import {
  getInspirationHotspotKind,
  getHotspotProductImageUrl,
} from "@/lib/inspiration-hotspot";
import { cn } from "@/lib/utils";
import type { InspirationHotspotDto } from "@/types/api/inspiration";

type Props = {
  hotspot: InspirationHotspotDto;
  active: boolean;
  onSelect: () => void;
};

export function InspirationHotspotProductRow({
  hotspot,
  active,
  onSelect,
}: Props) {
  const { t } = useT();
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const isReady = getInspirationHotspotKind(hotspot) === "ready";

  const title =
    hotspot.label ||
    hotspot.productName ||
    hotspot.fabricName ||
    t("inspiration.viewer.untagged");
  const subtitle = [hotspot.fabricName, hotspot.configuratorProductType]
    .filter(Boolean)
    .join(" · ");
  const imageUrl = getHotspotProductImageUrl(hotspot);

  async function handleAddToCart() {
    if (!hotspot.productId) return;
    setAdding(true);
    try {
      await addItem(hotspot.productId, 1);
      toast.success(t("inspiration.hotspot.addedToCart"));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("inspiration.hotspot.addFailed"),
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <li
      className={cn(
        "rounded-xl border bg-card p-3 shadow-sm transition sm:p-4",
        active ? "border-primary/50 ring-1 ring-primary/20" : "border-border",
      )}
    >
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSelect}
          className="shrink-0 overflow-hidden rounded-lg bg-muted/30 ring-1 ring-border/60"
        >
          <div className="relative aspect-square size-20 sm:size-24">
            <ProductImage src={imageUrl} alt={title} fill showLabel={false} />
          </div>
        </button>

        <div className="min-w-0 flex-1">
          <button type="button" onClick={onSelect} className="w-full text-left">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground">{title}</p>
              <Badge
                variant={isReady ? "secondary" : "outline"}
                className={cn(
                  "text-[10px]",
                  isReady
                    ? "bg-primary/10 text-primary"
                    : "border-accent/40 text-accent",
                )}
              >
                {isReady
                  ? t("inspiration.hotspot.readyBadge")
                  : t("inspiration.hotspot.customBadge")}
              </Badge>
            </div>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {isReady
                ? t("inspiration.hotspot.readyHint")
                : t("inspiration.hotspot.customHint")}
            </p>
          </button>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {isReady ? (
              <>
                {hotspot.productSlug ? (
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <Link
                      to="/products/$slug"
                      params={{ slug: hotspot.productSlug }}
                    >
                      {t("inspiration.viewer.viewProduct")}
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </Button>
                ) : null}
                {hotspot.productId ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      className="gap-1 bg-accent hover:bg-accent/90"
                      disabled={adding}
                      onClick={() => void handleAddToCart()}
                    >
                      <ShoppingCart className="size-3.5" />
                      {t("inspiration.hotspot.addToCart")}
                    </Button>
                    <WishlistButton
                      productId={hotspot.productId}
                      variant="outline"
                      className="ml-auto"
                    />
                  </>
                ) : null}
              </>
            ) : (
              <Button
                size="sm"
                className="w-full bg-accent hover:bg-accent/90 sm:w-auto"
                asChild
              >
                <Link
                  to="/configurator"
                  search={buildConfiguratorSearchFromHotspot(hotspot)}
                >
                  {t("inspiration.hotspot.customCta")}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
