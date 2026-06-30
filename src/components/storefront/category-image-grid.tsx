import { Link } from "@tanstack/react-router";

import { resolveCategoryImageUrl } from "@/lib/category-images";
import { cn } from "@/lib/utils";
import type { CategoryDto } from "@/types/api/categories";

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
  const visible = categories.filter((cat) => resolveCategoryImageUrl(cat));
  if (!visible.length) return null;

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-5 lg:gap-6",
        className,
      )}
    >
      {visible.map((cat) => {
        const imageUrl = resolveCategoryImageUrl(cat)!;
        const active = activeSlug === cat.slug;

        return (
          <Link
            key={cat.id}
            to="/shop"
            search={{ category: cat.slug }}
            aria-label={cat.name}
            className={cn(
              "group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-md",
              active && "ring-2 ring-primary/40",
            )}
          >
            <img
              src={imageUrl}
              alt={cat.name}
              loading="lazy"
              decoding="async"
              className="aspect-[2.35/1] w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </Link>
        );
      })}
    </div>
  );
}
