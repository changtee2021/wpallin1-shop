import { Loader2, Search } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useT } from "@/i18n";
import {
  openPdfDocument,
  type PdfDocumentHandle,
  type PdfSearchHit,
} from "@/lib/pdf-to-pages";

type Props = {
  pdfUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPage: (page: number) => void;
};

export function CatalogSearchSheet({
  pdfUrl,
  open,
  onOpenChange,
  onSelectPage,
}: Props) {
  const { t } = useT();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<PdfSearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [progress, setProgress] = useState<{ page: number; total: number } | null>(
    null,
  );
  const [docRef, setDocRef] = useState<PdfDocumentHandle | null>(null);

  const ensureDoc = useCallback(async () => {
    if (docRef) return docRef;
    const doc = await openPdfDocument(pdfUrl);
    setDocRef(doc);
    return doc;
  }, [docRef, pdfUrl]);

  async function runSearch() {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setHits([]);
    setProgress(null);
    try {
      const doc = await ensureDoc();
      const results = await doc.searchText(q, (page, total) => {
        setProgress({ page, total });
      });
      setHits(results);
    } finally {
      setSearching(false);
      setProgress(null);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("catalogs.viewer.searchTitle")}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("catalogs.viewer.searchPlaceholder")}
            onKeyDown={(e) => {
              if (e.key === "Enter") void runSearch();
            }}
          />
          <Button type="button" onClick={() => void runSearch()} disabled={searching}>
            {searching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
          </Button>
        </div>
        {progress ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {t("catalogs.viewer.searchProgress")
              .replace("{page}", String(progress.page))
              .replace("{total}", String(progress.total))}
          </p>
        ) : null}
        <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
          {!searching && hits.length === 0 && query.trim() ? (
            <p className="text-sm text-muted-foreground">
              {t("catalogs.viewer.searchEmpty")}
            </p>
          ) : null}
          {hits.map((hit) => (
            <button
              key={hit.pageNumber}
              type="button"
              className="w-full rounded-lg border bg-background p-3 text-left transition-colors hover:bg-muted/50"
              onClick={() => {
                onSelectPage(hit.pageNumber);
                onOpenChange(false);
              }}
            >
              <p className="text-xs font-medium text-primary">
                {t("catalogs.viewer.pageOf")
                  .replace("{current}", String(hit.pageNumber))
                  .replace("{total}", "—")}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {hit.snippet}
              </p>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
