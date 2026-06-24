import { Link } from "@tanstack/react-router";
import {
  Blinds,
  Grid3X3,
  Layers,
  Package,
  PanelTop,
  Sparkles,
  Sun,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { CategoryDto } from "@/types/api/categories";

const iconMap: Record<string, LucideIcon> = {
  curtains: Layers,
  "roller-blinds": Blinds,
  "zebra-blinds": Sun,
  "curtain-rails": PanelTop,
  accessories: Package,
  "ready-made": Sparkles,
};

type CategoryRailProps = {
  categories: CategoryDto[];
  activeSlug?: string;
  showAll?: boolean;
};

function CategoryItem({
  to,
  search,
  active,
  label,
  Icon,
}: {
  to: string;
  search?: Record<string, string | undefined>;
  active: boolean;
  label: string;
  Icon: LucideIcon;
}) {
  return (
    <Link
      to={to}
      search={search}
      className="group flex flex-col items-center gap-2 text-center"
    >
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-full transition-colors sm:size-14",
          active
            ? "bg-primary text-white"
            : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white",
        )}
      >
        <Icon className="size-5 sm:size-6" />
      </span>
      <span
        className={cn(
          "line-clamp-2 text-[11px] leading-tight sm:text-xs",
          active ? "font-semibold text-primary" : "text-foreground",
        )}
      >
        {label}
      </span>
    </Link>
  );
}

export function CategoryRail({
  categories,
  activeSlug,
  showAll = false,
}: CategoryRailProps) {
  const items = (
    <>
      {showAll ? (
        <CategoryItem
          to="/shop"
          active={!activeSlug}
          label="ทั้งหมด"
          Icon={Grid3X3}
        />
      ) : null}
      {categories.map((cat) => {
        const Icon = iconMap[cat.slug] ?? Layers;
        return (
          <CategoryItem
            key={cat.id}
            to="/shop"
            search={{ category: cat.slug }}
            active={activeSlug === cat.slug}
            label={cat.name}
            Icon={Icon}
          />
        );
      })}
    </>
  );

  if (showAll) {
    return (
      <div className="grid grid-cols-4 gap-x-3 gap-y-4 py-1 sm:gap-x-4 lg:grid-cols-4">
        {items}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-4 px-1 py-2">
        {categories.map((cat) => {
          const Icon = iconMap[cat.slug] ?? Layers;
          return (
            <div key={cat.id} className="w-16 shrink-0 sm:w-20">
              <CategoryItem
                to="/shop"
                search={{ category: cat.slug }}
                active={activeSlug === cat.slug}
                label={cat.name}
                Icon={Icon}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
