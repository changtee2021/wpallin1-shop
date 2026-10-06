import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { type CatalogProduct } from "@/data/products-catalog";
import { useBi } from "@/lib/bi";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: CatalogProduct;
  index?: number;
  className?: string;
  /** Above-the-fold cards load eagerly. */
  eager?: boolean;
};

/** Price-free product tile: photo, subcategory, name and tagline. */
export function ProductCard({
  product,
  index,
  className,
  eager = false,
}: ProductCardProps) {
  const pick = useBi();
  const hoverImage = product.gallery?.[0];
  const badges = [
    product.videos?.length ? { th: "วิดีโอ", en: "Video" } : null,
    product.catalogSlug || product.documents?.length
      ? { th: "แคตตาล็อก", en: "Catalogue" }
      : null,
  ].filter((badge) => badge !== null);

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className={cn(
        "group flex flex-col rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4",
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-surface">
        <div className="scroll-zoom relative size-full">
          <img
            src={product.image}
            alt={pick(product.name)}
            width={709}
            height={909}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {hoverImage ? (
            <img
              src={hoverImage}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          ) : null}
        </div>
        {badges.length ? (
          <div className="absolute top-3 left-3 flex gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge.en}
                className="rounded-full bg-white/90 px-2.5 py-1 text-[0.6875rem] font-medium tracking-wide text-foreground backdrop-blur"
              >
                {pick(badge)}
              </span>
            ))}
          </div>
        ) : null}
        <span className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full bg-white/90 text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-3">
        {index !== undefined ? (
          <span className="brand-index text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}
        <div className="min-w-0">
          <h3 className="text-xl leading-snug font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {product.name.en}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {product.name.th}
          </p>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {pick(product.tagline)}
          </p>
        </div>
      </div>
    </Link>
  );
}
