import { Link } from "@tanstack/react-router";
import { Blinds, Layers, Package, PanelTop, Sparkles, Sun } from "lucide-react";

import type { CategoryDto } from "@/types/api/categories";

const iconMap: Record<string, typeof Layers> = {
  curtains: Layers,
  "roller-blinds": Blinds,
  "zebra-blinds": Sun,
  "curtain-rails": PanelTop,
  accessories: Package,
  "ready-made": Sparkles,
};

type CategoryRailProps = {
  categories: CategoryDto[];
};

export function CategoryRail({ categories }: CategoryRailProps) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-4 px-1 py-2">
        {categories.map((cat) => {
          const Icon = iconMap[cat.slug] ?? Layers;
          return (
            <Link
              key={cat.id}
              to="/shop"
              search={{ category: cat.slug }}
              className="group flex w-16 flex-col items-center gap-2 text-center sm:w-20"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white sm:size-14">
                <Icon className="size-5 sm:size-6" />
              </span>
              <span className="line-clamp-2 text-[11px] leading-tight text-foreground sm:text-xs">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
