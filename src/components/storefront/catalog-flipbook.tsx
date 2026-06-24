import HTMLFlipBook from "react-pageflip";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CatalogFlipbookPage } from "@/components/storefront/catalog-flipbook-page";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";
import {
  openPdfDocument,
  preloadPdfPages,
  type PdfDocumentHandle,
} from "@/lib/pdf-to-pages";
import { cn } from "@/lib/utils";

type FlipBookRef = {
  pageFlip: () => {
    flip: (page: number) => void;
    flipNext: () => void;
    flipPrev: () => void;
    getCurrentPageIndex: () => number;
    getPageCount: () => number;
  };
};

type Props = {
  pdfUrl: string;
  title: string;
  className?: string;
};

export function CatalogFlipbook({ pdfUrl, title, className }: Props) {
  const { t } = useT();
  const bookRef = useRef<FlipBookRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<PdfDocumentHandle | null>(null);
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let active = true;
    let handle: PdfDocumentHandle | null = null;

    async function load() {
      setLoading(true);
      setError(null);
      setPageImages({});
      setCurrentPage(1);
      try {
        handle = await openPdfDocument(pdfUrl);
        if (!active) return;
        setDoc(handle);
        setNumPages(handle.numPages);
        const first = await handle.renderPage(1);
        if (!active) return;
        setPageImages({ 1: first });
        await preloadPdfPages(handle, 1, 2);
        if (!active) return;
        const initial: Record<number, string> = { 1: first };
        for (let page = 2; page <= Math.min(handle.numPages, 3); page += 1) {
          initial[page] = await handle.renderPage(page);
        }
        if (!active) return;
        setPageImages((prev) => ({ ...prev, ...initial }));
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load PDF");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      handle?.destroy();
    };
  }, [pdfUrl]);

  const ensurePageLoaded = useCallback(
    async (pageNumber: number) => {
      if (!doc || pageImages[pageNumber]) return;
      const src = await doc.renderPage(pageNumber);
      setPageImages((prev) => ({ ...prev, [pageNumber]: src }));
      await preloadPdfPages(doc, pageNumber, 2);
      const start = Math.max(1, pageNumber - 2);
      const end = Math.min(doc.numPages, pageNumber + 2);
      const batch: Record<number, string> = {};
      for (let page = start; page <= end; page += 1) {
        if (!pageImages[page]) {
          batch[page] = await doc.renderPage(page);
        }
      }
      if (Object.keys(batch).length) {
        setPageImages((prev) => ({ ...prev, ...batch }));
      }
    },
    [doc, pageImages],
  );

  const onFlip = useCallback(
    (e: { data: number }) => {
      const index = e.data;
      const page = index + 1;
      setCurrentPage(page);
      void ensurePageLoaded(page);
      if (doc && page < doc.numPages) void ensurePageLoaded(page + 1);
    },
    [doc, ensurePageLoaded],
  );

  const goPrev = () => bookRef.current?.pageFlip().flipPrev();
  const goNext = () => bookRef.current?.pageFlip().flipNext();

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

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const bookSize = useMemo(() => {
    if (typeof window === "undefined") return { width: 420, height: 594 };
    const maxWidth = Math.min(window.innerWidth - 32, 900);
    const width = isMobile ? Math.min(maxWidth, 360) : Math.floor(maxWidth / 2);
    const height = Math.floor(width * 1.414);
    return { width, height };
  }, [isMobile]);

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <p className="text-sm text-destructive">{error}</p>
        <div className="overflow-hidden rounded-xl border bg-muted/20 shadow-sm">
          <iframe
            title={title}
            src={pdfUrl}
            className="h-[75vh] w-full bg-white"
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {loading
            ? t("catalogs.viewer.loading")
            : t("catalogs.viewer.pageOf")
                .replace("{current}", String(currentPage))
                .replace("{total}", String(numPages || "—"))}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={goPrev}
            disabled={loading || currentPage <= 1}
          >
            <ChevronLeft className="size-4" />
            {t("catalogs.viewer.prev")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={goNext}
            disabled={loading || currentPage >= numPages}
          >
            {t("catalogs.viewer.next")}
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void toggleFullscreen()}
          >
            {fullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
            {fullscreen
              ? t("catalogs.viewer.exitFullscreen")
              : t("catalogs.viewer.fullscreen")}
          </Button>
          <Button type="button" size="sm" variant="outline" asChild>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <Download className="size-4" />
              {t("catalogs.viewer.download")}
            </a>
          </Button>
        </div>
      </div>

      <div className="flex justify-center overflow-hidden rounded-xl border bg-muted/30 p-3 shadow-sm sm:p-6">
        {loading || !numPages ? (
          <div
            className="flex items-center justify-center rounded-lg bg-white text-sm text-muted-foreground"
            style={{ width: bookSize.width, height: bookSize.height }}
          >
            {t("catalogs.viewer.loading")}
          </div>
        ) : (
          <HTMLFlipBook
            ref={bookRef}
            width={bookSize.width}
            height={bookSize.height}
            size="fixed"
            minWidth={280}
            maxWidth={900}
            minHeight={396}
            maxHeight={1200}
            showCover
            mobileScrollSupport
            onFlip={onFlip}
            className="catalog-flipbook"
            usePortrait={isMobile}
            drawShadow
            maxShadowOpacity={0.35}
            flippingTime={700}
          >
            {Array.from({ length: numPages }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <CatalogFlipbookPage
                  key={pageNumber}
                  pageNumber={pageNumber}
                  src={pageImages[pageNumber]}
                />
              );
            })}
          </HTMLFlipBook>
        )}
      </div>
    </div>
  );
}
