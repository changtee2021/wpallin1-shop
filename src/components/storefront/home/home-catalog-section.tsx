import { FileText } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { RevealOnScroll } from "@/components/storefront/reveal-on-scroll";
import { useT } from "@/i18n";
import type { MarketingCatalogDto } from "@/types/api/marketing-catalogs";

type Props = {
  catalogs: MarketingCatalogDto[];
};

export function HomeCatalogSection({ catalogs }: Props) {
  const { t } = useT();

  if (catalogs.length === 0) return null;

  const ordered = catalogs
    .filter((catalog) => catalog.visibility === "public")
    .sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return a.sortOrder - b.sortOrder;
    });

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-lg font-bold text-primary sm:text-xl">
          {t("home.catalogs.title")}
        </h2>
        <div className="h-px flex-1 bg-border" />
        <Button variant="outline" size="sm" className="shrink-0" asChild>
          <Link to="/catalogs">{t("home.catalogs.cta")}</Link>
        </Button>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-1">
        {ordered.map((catalog, i) => (
          <RevealOnScroll
            key={catalog.id}
            delayMs={i * 60}
            className="w-[78vw] shrink-0 sm:w-[300px]"
          >
            <CatalogCard catalog={catalog} />
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}

function CatalogCard({ catalog }: { catalog: MarketingCatalogDto }) {
  const { t } = useT();
  const subtitle = catalog.brand || catalog.categoryName || "PDF";

  return (
    <Link
      to="/catalogs/$id"
      params={{ id: catalog.slug }}
      className="group block w-full rounded-[1.25rem] bg-white p-3 text-left shadow-sm ring-1 ring-border transition hover:ring-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem] bg-muted">
        {catalog.coverImageUrl ? (
          <img
            src={catalog.coverImageUrl}
            alt={catalog.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-primary text-primary-foreground">
            <FileText className="size-8" />
          </div>
        )}
      </div>

      <div className="px-1 pb-1 pt-4">
        <h3 className="text-base font-semibold text-foreground">
          {catalog.title}
        </h3>
        {catalog.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {catalog.description}
          </p>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
          <span className="inline-flex min-h-9 shrink-0 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition group-hover:bg-accent group-hover:text-accent-foreground">
            {t("home.catalogs.open")}
          </span>
        </div>
      </div>
    </Link>
  );
}
