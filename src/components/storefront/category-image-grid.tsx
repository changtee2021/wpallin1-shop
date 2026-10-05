import { Link } from "@tanstack/react-router";
import {
  Blinds,
  Columns2,
  DoorOpen,
  Flag,
  Image as ImageIcon,
  Layers,
  Package,
  Palette,
  PanelTop,
  RectangleHorizontal,
  Sparkles,
  Sun,
  SunDim,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { HOME_CATEGORY_TILES, resolveCategoryImageUrl } from "@/lib/category-images";
import { cn } from "@/lib/utils";
import type { CategoryDto } from "@/types/api/categories";

const iconMap: Record<string, LucideIcon> = {
  curtains: Layers,
  accessories: Package,
  "roller-blinds": Blinds,
  "vertical-blinds": Columns2,
  "wood-blinds": Blinds,
  "aluminum-blinds": Blinds,
  "outdoor-curtains": Sun,
  "zip-blinds": RectangleHorizontal,
  "skylight-fss": SunDim,
  "pvc-folding-doors": DoorOpen,
  "pvc-strip-curtains": Columns2,
  wallpaper: ImageIcon,
  "window-tinting": Sun,
  "fabric-print": Palette,
  "printed-roller-blinds": Palette,
  noren: Flag,
  "zebra-blinds": Sun,
  "roman-blinds": Layers,
  "curtain-rails": PanelTop,
  "ready-made": Sparkles,
  "motorized-curtains": Zap,
};

type CategoryImageGridProps = {
  categories: CategoryDto[];
  activeSlug?: string;
  className?: string;
};

export function CategoryImageGrid({
  categories,
  activeSlug,
  className,
}: CategoryImageGridProps) {
  const bySlug = new Map(categories.map((cat) => [cat.slug, cat]));
  const tiles = HOME_CATEGORY_TILES.map((tile) => {
    const cat = bySlug.get(tile.slug);
    const imageUrl = resolveCategoryImageUrl(
      cat ?? {
        id: tile.slug,
        slug: tile.slug,
        name: tile.nameTh,
        description: null,
        imageUrl: null,
        sortOrder: 0,
      },
    );
    return imageUrl ? { ...tile, id: cat?.id ?? tile.slug, imageUrl } : null;
  }).filter((tile) => tile != null);

  if (!tiles.length) return null;

  return (
    <div className={cn("category-pop-grid grid grid-cols-2 gap-3 overflow-visible py-4 sm:gap-4 md:grid-cols-4 md:gap-5 md:py-6 lg:gap-6", className)}>
      {tiles.map((tile) => {
        const active = activeSlug === tile.slug;
        const Icon = iconMap[tile.slug] ?? Layers;
        const imageUrl = tile.imageUrl;

        return (
          <Link
            key={tile.id}
            to="/shop"
            search={{ category: tile.slug }}
            aria-label={`${tile.nameTh}, ${tile.nameEn}`}
            className={cn(
              "category-pop-card group relative z-0 block min-h-11 overflow-hidden rounded-2xl bg-neutral-200 shadow-sm ring-1 ring-black/5",
              active && "ring-2 ring-primary/40",
            )}
          >
            <img
              src={imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="aspect-[16/10] w-full object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end gap-2 p-2.5 sm:p-3">
              <span className="mb-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-white/15 text-white backdrop-blur-sm">
                <Icon className="size-3.5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold leading-tight text-white">
                  {tile.nameTh}
                </span>
                <span className="mt-0.5 block truncate text-[11px] leading-tight text-white/80">
                  {tile.nameEn}
                </span>
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
