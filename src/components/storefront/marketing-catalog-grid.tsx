import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Sparkles,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import type { MarketingCatalogDto } from "@/types/api/marketing-catalogs";

type Props = {
  catalogs: MarketingCatalogDto[];
  compact?: boolean;
};

function isNewCatalog(updatedAt: string): boolean {
  const updated = new Date(updatedAt).getTime();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - updated < thirtyDays;
}

function formatUpdatedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function MarketingCatalogGrid({ catalogs, compact = false }: Props) {
  const { t } = useT();

  if (!catalogs.length) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        {t("catalogs.empty")}
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "grid gap-3 sm:grid-cols-2"
          : "grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3"
      }
    >
      {catalogs.map((catalog) => (
        <Card
          key={catalog.id}
          className={cn(
            "group overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg",
            !compact && "rounded-2xl",
          )}
        >
          <div className="relative aspect-[3/4] bg-gradient-to-br from-muted/80 to-muted">
            {catalog.coverImageUrl ? (
              <img
                src={catalog.coverImageUrl}
                alt={catalog.title}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <BookOpen className="size-12" />
              </div>
            )}
            <div className="absolute left-3 top-3 flex flex-wrap gap-1">
              {catalog.isFeatured ? (
                <Badge className="bg-accent text-accent-foreground shadow-sm">
                  <Sparkles className="mr-1 size-3" />
                  {t("catalogs.badge.featured")}
                </Badge>
              ) : null}
              {isNewCatalog(catalog.updatedAt) ? (
                <Badge variant="secondary" className="shadow-sm">
                  {t("catalogs.badge.new")}
                </Badge>
              ) : null}
              {catalog.visibility === "dealer" ? (
                <Badge
                  variant="outline"
                  className="border-amber-300 bg-amber-50 text-amber-900 shadow-sm"
                >
                  {t("catalogs.badge.dealerOnly")}
                </Badge>
              ) : null}
              {catalog.version ? (
                <Badge variant="secondary" className="shadow-sm">
                  {catalog.version}
                </Badge>
              ) : null}
            </div>
          </div>
          <CardContent className="space-y-3 p-4">
            <div>
              <h3 className="font-semibold leading-snug">{catalog.title}</h3>
              {catalog.categoryName ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {catalog.categoryName}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {catalog.pageCount ? (
                <span>
                  {catalog.pageCount} {t("catalogs.card.pages")}
                </span>
              ) : null}
              <span>
                {t("catalogs.card.updated")}{" "}
                {formatUpdatedDate(catalog.updatedAt)}
              </span>
            </div>
            {catalog.description && !compact ? (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {catalog.description}
              </p>
            ) : null}
            {catalog.tags.length > 0 && !compact ? (
              <div className="flex flex-wrap gap-1">
                {catalog.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                className="bg-accent hover:bg-accent/90"
                asChild
              >
                <Link to="/catalogs/$id" params={{ id: catalog.slug }}>
                  <FileText className="size-4" />
                  {t("catalogs.card.open")}
                </Link>
              </Button>
              {catalog.allowDownload && catalog.pdfUrl ? (
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={catalog.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Download className="size-4" />
                    PDF
                  </a>
                </Button>
              ) : null}
              {catalog.externalLink ? (
                <Button size="sm" variant="ghost" asChild>
                  <a
                    href={catalog.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
