import { Link } from "@tanstack/react-router";

import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import type { CategoryDto } from "@/types/api/categories";

type Props = {
  categories: CategoryDto[];
};

export function InspirationMaterialCategoryNav({ categories }: Props) {
  const { t } = useT();

  if (!categories.length) return null;

  return (
    <nav
      aria-label={t("inspiration.materials.categories.label")}
      className="flex flex-wrap items-center justify-center gap-2"
    >
      {categories.map((category) => (
        <Link
          key={category.id}
          to="/shop"
          search={{ category: category.slug }}
          className={cn(
            "rounded-full border border-border bg-white px-4 py-1.5 text-xs font-medium text-foreground shadow-sm transition",
            "hover:border-primary/40 hover:bg-primary/5",
          )}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
