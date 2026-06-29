import { Link } from "@tanstack/react-router";

import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import type { InspirationDetailImageDto } from "@/types/api/inspiration";

type Props = {
  images: InspirationDetailImageDto[];
  activeHotspotId?: string | null;
  onSelectHotspot?: (hotspotId: string) => void;
  materialSlugByHotspotId?: Record<string, string>;
};

export function InspirationMaterialGallery({
  images,
  activeHotspotId,
  onSelectHotspot,
  materialSlugByHotspotId,
}: Props) {
  const { t } = useT();

  if (!images.length) return null;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          {t("inspiration.viewer.materials")}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t("inspiration.viewer.materialsHint")}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {images.map((image) => {
          const isActive =
            image.hotspotId != null && image.hotspotId === activeHotspotId;
          const materialSlug =
            image.hotspotId != null
              ? materialSlugByHotspotId?.[image.hotspotId]
              : undefined;

          const cardClassName = cn(
            "group overflow-hidden rounded-xl bg-white text-left ring-1 ring-black/5 transition hover:ring-primary/30",
            (image.hotspotId || materialSlug) && "cursor-pointer",
            isActive && "ring-2 ring-primary/50",
          );

          const cardContent = (
            <>
              <img
                src={image.imageUrl}
                alt={image.label}
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="space-y-0.5 p-2">
                <p className="line-clamp-1 text-xs font-medium text-foreground">
                  {image.label}
                </p>
                {image.caption ? (
                  <p className="line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                    {image.caption}
                  </p>
                ) : null}
              </div>
            </>
          );

          if (materialSlug) {
            return (
              <Link
                key={image.id}
                to="/inspiration/materials/$slug"
                params={{ slug: materialSlug }}
                className={cardClassName}
              >
                {cardContent}
              </Link>
            );
          }

          return (
            <button
              key={image.id}
              type="button"
              onClick={() =>
                image.hotspotId && onSelectHotspot?.(image.hotspotId)
              }
              className={cardClassName}
            >
              {cardContent}
            </button>
          );
        })}
      </div>
    </div>
  );
}
