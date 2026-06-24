import { Link } from "@tanstack/react-router";
import { BookOpen, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MarketingCatalogDto } from "@/types/api/marketing-catalogs";

type Props = {
  catalogs: MarketingCatalogDto[];
};

export function ProductMarketingCatalogs({ catalogs }: Props) {
  if (!catalogs.length) return null;

  return (
    <Card className="mt-4 border-primary/20 bg-primary/5 shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <BookOpen className="size-4" />
          แคตตาล็อกที่เกี่ยวข้อง
        </div>
        <div className="space-y-2">
          {catalogs.map((catalog) => (
            <div
              key={catalog.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-background px-3 py-2"
            >
              <div className="min-w-0">
                <p className="font-medium">{catalog.title}</p>
                {catalog.brand ? (
                  <p className="text-xs text-muted-foreground">
                    {catalog.brand}
                  </p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-accent hover:bg-accent/90"
                  asChild
                >
                  <Link to="/catalogs/$id" params={{ id: catalog.id }}>
                    <FileText className="size-4" />
                    ดูแคตตาล็อก
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
              </div>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/catalogs">ดูแคตตาล็อกทั้งหมด</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
