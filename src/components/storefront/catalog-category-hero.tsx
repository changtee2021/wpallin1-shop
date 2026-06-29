import { Link } from "@tanstack/react-router";
import { ArrowRight, Blinds, BookOpen, Layers, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const categoryIcons: Record<string, LucideIcon> = {
  ม่านม้วน: Sun,
  ม่านจีบ: Layers,
  มู่ลี่: Blinds,
};

type Category = {
  id: string;
  name: string;
};

type Props = {
  categories: Category[];
  counts: Record<string, number>;
  activeCategory: string | "all";
  onSelect: (categoryId: string) => void;
  title: string;
};

export function CatalogCategoryHero({
  categories,
  counts,
  activeCategory,
  onSelect,
  title,
}: Props) {
  if (!categories.length) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-primary sm:text-xl">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {categories.map((category) => {
          const Icon = categoryIcons[category.name] ?? BookOpen;
          const count = counts[category.id] ?? 0;
          const active = activeCategory === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className={cn(
                "group flex items-start gap-4 rounded-xl border bg-white p-5 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md",
                active && "border-primary/40 ring-2 ring-primary/20",
              )}
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <Icon className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">
                    {category.name}
                  </h3>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {count} แคตตาล็อก
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function HomeCatalogCta({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
            <BookOpen className="size-6" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-primary sm:text-xl">
              {title}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              {body}
            </p>
          </div>
        </div>
        <Link
          to="/catalogs"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          {cta}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
