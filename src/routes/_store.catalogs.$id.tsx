import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchPublicMarketingCatalog } from "@/lib/api.functions";

export const Route = createFileRoute("/_store/catalogs/$id")({
  loader: async ({ params }) => {
    const catalog = await fetchPublicMarketingCatalog({
      data: { id: params.id },
    });
    if (!catalog) throw new Error("Catalog not found");
    return { catalog };
  },
  component: CatalogViewerPage,
});

function CatalogViewerPage() {
  const { catalog } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" asChild>
          <Link to="/catalogs">
            <ArrowLeft className="size-4" />
            กลับหน้าแคตตาล็อก
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          {catalog.pdfUrl ? (
            <Button variant="outline" asChild>
              <a
                href={catalog.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="size-4" />
                ดาวน์โหลด PDF
              </a>
            </Button>
          ) : null}
          {catalog.externalLink ? (
            <Button variant="outline" asChild>
              <a
                href={catalog.externalLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" />
                เปิดลิงก์ภายนอก
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="mb-6 shadow-sm">
        <CardContent className="space-y-2 p-4 sm:p-6">
          <h1 className="text-2xl font-bold">{catalog.title}</h1>
          {catalog.brand ? (
            <p className="text-muted-foreground">{catalog.brand}</p>
          ) : null}
          {catalog.description ? (
            <p className="text-sm text-muted-foreground">
              {catalog.description}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {catalog.pdfUrl ? (
        <div className="overflow-hidden rounded-xl border bg-muted/20 shadow-sm">
          <iframe
            title={catalog.title}
            src={catalog.pdfUrl}
            className="h-[75vh] w-full bg-white"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          ยังไม่มีไฟล์ PDF สำหรับแคตตาล็อกนี้
        </div>
      )}
    </div>
  );
}
