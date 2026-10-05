import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

import {
  getFactorySpecsByCategory,
  matchFactoryCollection,
  type FactoryCategorySpecs,
  type FactoryCollection,
} from "@/data/factory-specs";

type Props = {
  categorySlug?: string | null;
  product?: { name: string; sku?: string | null; slug?: string };
  compact?: boolean;
};

function SpecTable({ collection }: { collection: FactoryCollection }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b bg-muted/40 px-3 py-2">
        <h3 className="text-sm font-semibold">{collection.name}</h3>
        {collection.sku ? (
          <span className="text-xs text-muted-foreground">{collection.sku}</span>
        ) : null}
      </div>
      <dl className="divide-y text-sm">
        {collection.rows.map((row) => (
          <div
            key={row.label}
            className="flex justify-between gap-4 px-3 py-2"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-right font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SpecNotes({ specs }: { specs: FactoryCategorySpecs }) {
  if (!specs.notes.length) return null;
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
      {specs.notes.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
  );
}

export function CategorySpecPanel({
  categorySlug,
  product,
  compact = false,
}: Props) {
  const specs = getFactorySpecsByCategory(categorySlug);
  if (!specs) return null;

  const matched = product ? matchFactoryCollection(specs, product) : null;
  const collections = compact && matched ? [matched] : specs.collections;

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-3">
        <h2 className="text-base font-semibold sm:text-lg">{specs.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{specs.intro}</p>
      </div>

      <SpecNotes specs={specs} />

      {compact ? (
        <div className="mt-4 space-y-3">
          {collections.map((collection) => (
            <SpecTable key={collection.id} collection={collection} />
          ))}
          {matched ? (
            <p className="text-xs text-muted-foreground">
              ดูสเปคทั้งหมวดได้ที่หน้า{" "}
              <Link
                to="/shop"
                search={{ category: specs.categorySlug }}
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                {specs.title}
              </Link>
            </p>
          ) : null}
        </div>
      ) : (
        <details className="group mt-4" open>
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm font-medium">
            ตารางสเปค {specs.collections.length} รุ่น
            <ChevronDown className="size-4 transition group-open:rotate-180" />
          </summary>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {collections.map((collection) => (
              <SpecTable key={collection.id} collection={collection} />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
