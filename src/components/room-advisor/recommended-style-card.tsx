import { Link } from "@tanstack/react-router";
import { ChevronRight, Star } from "lucide-react";

import { ProductImage } from "@/components/storefront/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildConfiguratorSearchFromHotspot } from "@/lib/configurator-share";
import type { ConfiguratorProductType } from "@/domain/configurator";
import type { StyleRecommendationDto } from "@/types/api/room-advisor";
import { cn } from "@/lib/utils";

type Props = {
  recommendation: StyleRecommendationDto;
  selected?: boolean;
  onToggleSelect?: () => void;
  selectable?: boolean;
};

function productTypeLabel(type: ConfiguratorProductType | null): string {
  if (type === "pleated") return "ม่านจีบ";
  if (type === "eyelet") return "ม่านตาไก่";
  if (type === "wave") return "ม่าน Wave";
  return "Custom";
}

export function RecommendedStyleCard({
  recommendation,
  selected,
  onToggleSelect,
  selectable = false,
}: Props) {
  const configSearch = buildConfiguratorSearchFromHotspot({
    fabricId: recommendation.fabricId,
    configuratorProductType: recommendation.productType,
  });

  return (
    <article
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm transition",
        selected ? "border-primary/50 ring-1 ring-primary/20" : "border-border",
      )}
    >
      <div className="flex gap-3">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted/30 ring-1 ring-border/60 sm:size-24">
          <ProductImage
            src={recommendation.fabricSwatchUrl}
            alt={recommendation.title}
            fill
            showLabel={false}
          />
          {recommendation.rank === 1 ? (
            <span className="absolute left-1 top-1 inline-flex items-center gap-0.5 rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
              <Star className="size-3" />
              แนะนำ
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <h3 className="font-semibold leading-snug">{recommendation.title}</h3>
            <p className="text-xs text-muted-foreground">
              {productTypeLabel(recommendation.productType)}
              {recommendation.fabricName
                ? ` · ${recommendation.fabricName}`
                : ""}
              {recommendation.colorHint
                ? ` · ${recommendation.colorHint}`
                : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-1">
            {recommendation.benefits.slice(0, 3).map((b) => (
              <Badge key={b} variant="secondary" className="text-[10px]">
                {b}
              </Badge>
            ))}
          </div>

          <p className="line-clamp-2 text-xs text-muted-foreground">
            {recommendation.description}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {selectable ? (
          <Button
            type="button"
            size="sm"
            variant={selected ? "default" : "outline"}
            onClick={onToggleSelect}
          >
            {selected ? "เลือกแล้ว" : "เลือกแบบนี้"}
          </Button>
        ) : null}
        <Button size="sm" variant="outline" asChild>
          <Link to="/configurator" search={configSearch}>
            ปรับใน Custom
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
