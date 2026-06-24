import { useCallback, useEffect, useRef, useState } from "react";

import { CatalogPage } from "@/components/storefront/catalog-page";
import { CatalogSearchSheet } from "@/components/storefront/catalog-search-sheet";
import { CatalogViewerToolbar } from "@/components/storefront/catalog-viewer-toolbar";
import { useCatalogPdf } from "@/hooks/use-catalog-pdf";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

type Props = {
  pdfUrl: string;
  allowDownload: boolean;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  onShare: () => void;
  className?: string;
};

export function CatalogProViewer({
  pdfUrl,
  allowDownload,
  initialPage = 1,
  onPageChange,
  onShare,
  className,
}: Props) {
  const { t } = useT();
  const { pageImages, numPages, loading, error, ensurePageLoaded } =
    useCatalogPdf(pdfUrl);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [twoPage, setTwoPage] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [thumbImages, setThumbImages] = useState<Record<number, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPage >= 1 && initialPage <= numPages) {
      setCurrentPage(initialPage);
      void ensurePageLoaded(initialPage);
    }
  }, [initialPage, numPages, ensurePageLoaded]);

  useEffect(() => {
    void ensurePageLoaded(currentPage);
    if (twoPage && currentPage < numPages) {
      void ensurePageLoaded(currentPage + 1);
    }
    onPageChange?.(currentPage);
  }, [currentPage, twoPage, numPages, ensurePageLoaded, onPageChange]);

  useEffect(() => {
    if (!numPages || loading) return;
    async function loadThumbs() {
      const batch: Record<number, string> = {};
      for (let p = 1; p <= Math.min(numPages, 8); p += 1) {
        if (!thumbImages[p]) {
          await ensurePageLoaded(p, 0.25);
        }
      }
      setThumbImages((prev) => ({ ...prev, ...batch, ...pageImages }));
    }
    void loadThumbs();
  }, [numPages, loading, ensurePageLoaded, pageImages, thumbImages]);

  const goToPage = useCallback(
    (page: number) => {
      const next = Math.min(Math.max(1, page), numPages);
      setCurrentPage(next);
    },
    [numPages],
  );

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setFullscreen(true);
    } else {
      await document.exitFullscreen();
      setFullscreen(false);
    }
  };

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <p className="text-sm text-destructive">{error}</p>
        <iframe
          title="PDF"
          src={pdfUrl}
          className="h-[75vh] w-full rounded-xl border bg-white"
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("space-y-4", className)}>
      <CatalogViewerToolbar
        currentPage={currentPage}
        numPages={numPages}
        zoom={zoom}
        fullscreen={fullscreen}
        allowDownload={allowDownload}
        pdfUrl={pdfUrl}
        onPrev={() => goToPage(currentPage - 1)}
        onNext={() => goToPage(currentPage + 1)}
        onZoomIn={() => setZoom((z) => Math.min(2.5, z + 0.25))}
        onZoomOut={() => setZoom((z) => Math.max(0.75, z - 0.25))}
        onFullscreen={() => void toggleFullscreen()}
        onGoToPage={goToPage}
        onShare={onShare}
        onSearch={() => setSearchOpen(true)}
      />

      <CatalogSearchSheet
        pdfUrl={pdfUrl}
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelectPage={goToPage}
      />

      <div className="flex gap-4 overflow-hidden rounded-xl border bg-muted/20 p-4">
        <aside className="hidden w-28 shrink-0 overflow-y-auto lg:block xl:w-32">
          <div className="space-y-2">
            {Array.from({ length: numPages }, (_, i) => {
              const pageNumber = i + 1;
              const active = pageNumber === currentPage;
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => goToPage(pageNumber)}
                  className={cn(
                    "block w-full overflow-hidden rounded border bg-white transition-shadow",
                    active && "ring-2 ring-primary",
                  )}
                >
                  <CatalogPage
                    pageNumber={pageNumber}
                    src={pageImages[pageNumber] ?? thumbImages[pageNumber]}
                    className="pointer-events-none min-h-0"
                  />
                  <span className="block py-1 text-center text-[10px] text-muted-foreground">
                    {pageNumber}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {loading && !numPages ? (
            <div className="flex min-h-[70vh] items-center justify-center text-sm text-muted-foreground">
              {t("catalogs.viewer.loading")}
            </div>
          ) : (
            <div
              className={cn(
                "flex min-h-[70vh] items-start justify-center gap-3",
                twoPage && "flex-row",
              )}
            >
              <CatalogPage
                pageNumber={currentPage}
                src={pageImages[currentPage]}
                zoom={zoom}
                className="max-h-[80vh] shadow-md"
              />
              {twoPage && currentPage < numPages ? (
                <CatalogPage
                  pageNumber={currentPage + 1}
                  src={pageImages[currentPage + 1]}
                  zoom={zoom}
                  className="max-h-[80vh] shadow-md"
                />
              ) : null}
            </div>
          )}
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              className="text-xs text-primary underline-offset-2 hover:underline"
              onClick={() => setTwoPage((v) => !v)}
            >
              {twoPage
                ? t("catalogs.viewer.singlePage")
                : t("catalogs.viewer.twoPage")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
