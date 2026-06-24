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

export function CatalogScrollViewer({
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
  const [searchOpen, setSearchOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!numPages || loading) return;
    const target = Math.min(Math.max(1, initialPage), numPages);
    const el = pageRefs.current.get(target);
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
    }
    setCurrentPage(target);
  }, [initialPage, numPages, loading]);

  useEffect(() => {
    if (!numPages) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const page = Number(entry.target.getAttribute("data-page"));
            if (page) {
              setCurrentPage(page);
              onPageChange?.(page);
              void ensurePageLoaded(page);
            }
          }
        }
      },
      { root: null, rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    for (const el of pageRefs.current.values()) {
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, [numPages, ensurePageLoaded, onPageChange, pageImages]);

  const scrollToPage = useCallback(
    (page: number) => {
      const el = pageRefs.current.get(page);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      setCurrentPage(page);
      onPageChange?.(page);
    },
    [onPageChange],
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
    <div ref={containerRef} className={cn("space-y-3 pb-24", className)}>
      <CatalogViewerToolbar
        compact
        currentPage={currentPage}
        numPages={numPages}
        zoom={zoom}
        fullscreen={fullscreen}
        allowDownload={allowDownload}
        pdfUrl={pdfUrl}
        onPrev={() => scrollToPage(Math.max(1, currentPage - 1))}
        onNext={() => scrollToPage(Math.min(numPages, currentPage + 1))}
        onZoomIn={() => setZoom((z) => Math.min(2.5, z + 0.25))}
        onZoomOut={() => setZoom((z) => Math.max(0.75, z - 0.25))}
        onFullscreen={() => void toggleFullscreen()}
        onGoToPage={scrollToPage}
        onShare={onShare}
        onSearch={() => setSearchOpen(true)}
      />

      <CatalogSearchSheet
        pdfUrl={pdfUrl}
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelectPage={scrollToPage}
      />

      <div className="space-y-2 rounded-xl border bg-muted/20 p-2">
        {loading && !numPages ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
            {t("catalogs.viewer.loading")}
          </div>
        ) : (
          Array.from({ length: numPages }, (_, i) => {
            const pageNumber = i + 1;
            return (
              <div
                key={pageNumber}
                ref={(el) => {
                  if (el) pageRefs.current.set(pageNumber, el);
                  else pageRefs.current.delete(pageNumber);
                }}
                className="overflow-hidden rounded-lg shadow-sm"
              >
                <CatalogPage
                  pageNumber={pageNumber}
                  src={pageImages[pageNumber]}
                  zoom={zoom}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
