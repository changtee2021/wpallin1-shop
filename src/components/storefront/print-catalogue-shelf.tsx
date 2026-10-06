import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { PRODUCT_CATEGORIES } from "@/data/products-catalog";
import { useBi } from "@/lib/bi";

/** Edition printed on every cover — change once when a new print run arrives. */
const PRINT_EDITION = "2026";

/**
 * Printed catalogue books, one per product category.
 * Covers reuse each category photo until scans of the real covers arrive;
 * swap `cover` here (or point it at /public/catalogues/*.webp) and nothing else changes.
 */
const PRINT_CATALOGUES = PRODUCT_CATEGORIES.map((category) => ({
  id: category.id,
  index: category.index,
  title: category.name,
  cover: category.image,
}));

export function PrintCatalogueShelf() {
  const pick = useBi();

  return (
    <ul className="grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 lg:grid-cols-4">
      {PRINT_CATALOGUES.map((book, index) => (
        <li
          key={book.id}
          className="scroll-rise flex flex-col"
          style={{ ["--i" as string]: index % 4 }}
        >
          <div className="group relative mx-auto w-full max-w-[16rem] pb-1.5 pr-1.5">
            {/* Page block peeking out behind the cover. */}
            <span
              aria-hidden
              className="absolute inset-y-1 right-0 left-2 -z-10 rounded-r-md bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.08)]"
            />
            <div className="relative aspect-[3/4] overflow-hidden rounded-l-[3px] rounded-r-md bg-surface shadow-[0_22px_32px_-14px_rgb(0_0_0/0.5)] transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:-rotate-1">
              <img
                src={book.cover}
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.78),rgb(0_0_0/0.05)_65%)]" />
              {/* Spine crease. */}
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-4 bg-[linear-gradient(to_right,rgb(0_0_0/0.45),rgb(255_255_255/0.2)_60%,transparent)]"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 pl-6 text-white">
                <p className="brand-kicker flex items-center gap-2 text-[0.6875rem] text-white/75">
                  <span aria-hidden className="h-px w-5 bg-accent" />
                  WP ALL · {PRINT_EDITION}
                </p>
                <p className="mt-2 text-lg leading-snug font-medium text-balance">
                  {pick(book.title)}
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-6 flex w-full max-w-[16rem] items-center justify-between gap-3">
            <span className="brand-index text-muted-foreground">
              {book.index}
            </span>
            <Link
              to="/contact"
              search={{ topic: "dealer" }}
              className="group/cta inline-flex min-h-11 items-center gap-2 rounded-full border border-foreground/25 px-4 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {pick({ th: "ขอตัวอย่าง", en: "Request a copy" })}
              <ArrowUpRight
                className="size-4 transition-transform group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
