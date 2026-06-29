import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import type { InspirationMaterialDto } from "@/types/api/inspiration";

type Props = {
  material: InspirationMaterialDto;
  className?: string;
};

export function InspirationMaterialCard({ material, className }: Props) {
  const { t } = useT();

  return (
    <article
      className={cn(
        "group mb-3 break-inside-avoid overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md lg:mb-4",
        className,
      )}
    >
      <Link
        to="/inspiration/materials/$slug"
        params={{ slug: material.slug }}
        className="block"
      >
        <div className="relative">
          <img
            src={material.imageUrl}
            alt={material.label}
            className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
        <div className="space-y-1 px-3 py-3">
          <Badge variant="secondary" className="text-[10px]">
            {t(`inspiration.materials.type.${material.materialType}`)}
          </Badge>
          <p className="line-clamp-2 text-sm font-medium leading-snug">
            {material.label}
          </p>
          {material.caption ? (
            <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
              {material.caption}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
