import { BookOpen, ExternalLink, FileText } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MarketingCatalogDto } from "@/types/api/marketing-catalogs";

type Props = {
  catalogs: MarketingCatalogDto[];
  compact?: boolean;
};

export function MarketingCatalogGrid({ catalogs, compact = false }: Props) {
  if (!catalogs.length) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        ยังไม่มีแคตตาล็อก
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "grid gap-3 sm:grid-cols-2"
          : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {catalogs.map((catalog) => (
        <Card key={catalog.id} className="overflow-hidden shadow-sm">
          <div className="aspect-[4/3] bg-muted">
            {catalog.coverImageUrl ? (
              <img
                src={catalog.coverImageUrl}
                alt={catalog.title}
                className="size-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <BookOpen className="size-10" />
              </div>
            )}
          </div>
          <CardContent className="space-y-3 p-4">
            <div>
              <h3 className="font-semibold">{catalog.title}</h3>
              {catalog.brand ? (
                <p className="text-sm text-muted-foreground">{catalog.brand}</p>
              ) : null}
            </div>
            {catalog.description ? (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {catalog.description}
              </p>
            ) : null}
            {catalog.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {catalog.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="bg-accent hover:bg-accent/90"
                asChild
              >
                <Link to="/catalogs/$id" params={{ id: catalog.id }}>
                  <FileText className="size-4" />
                  ดูออนไลน์
                </Link>
              </Button>
              {catalog.pdfUrl ? (
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={catalog.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
