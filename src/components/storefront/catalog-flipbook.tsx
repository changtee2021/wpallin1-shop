import HTMLFlipBook from "react-pageflip";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  Share2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CatalogPage } from "@/components/storefront/catalog-page";
import { Button } from "@/components/ui/button";
import { useCatalogViewport } from "@/hooks/use-catalog-viewport";
import { useT } from "@/i18n";
import {
  openPdfDocument,
  type PdfDocumentHandle,
  type PdfRenderOptions,
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
  allowDownload?: boolean;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  onShare?: () => void;
  className?: string;
};

function ViewerToolbar({
  loading,
  currentPage,
  numPages,
  compact,
  iconOnly,
  allowDownload,
  pdfUrl,
  fullscreen,
  onPrev,
  onNext,
  onShare,
  onFullscreen,
  className,
}: {
  loading: boolean;
  currentPage: number;
  numPages: number;
  compact: boolean;
  iconOnly: boolean;
  allowDownload: boolean;
  pdfUrl: string;
  fullscreen: boolean;
  onPrev: () => void;
  onNext: () => void;
  onShare?: () => void;
  onFullscreen: () => void;
  className?: string;
}) {
  const { t } = useT();
  const btnSize = iconOnly ? "icon" : compact ? "sm" : "sm";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 sm:gap-2",
        compact ? "justify-center" : "justify-end",
        className,
      )}
    >
      <Button
        type="button"
        size={btnSize}
        variant="outline"
        onClick={onPrev}
        disabled={loading || currentPage <= 1}
        aria-label={t("catalogs.viewer.prev")}
      >
        <ChevronLeft className="size-4" />
        {!iconOnly && t("catalogs.viewer.prev")}
      </Button>
      <Button
        type="button"
        size={btnSize}
        variant="outline"
        onClick={onNext}
        disabled={loading || currentPage >= numPages}
        aria-label={t("catalogs.viewer.next")}
      >
        {!iconOnly && t("catalogs.viewer.next")}
        <ChevronRight className="size-4" />
      </Button>
      {onShare ? (
        <Button
          type="button"
          size={btnSize}
          variant="outline"
          onClick={onShare}
          aria-label={t("catalogs.viewer.share")}
        >
          <Share2 className="size-4" />
          {!iconOnly && t("catalogs.viewer.share")}
        </Button>
      ) : null}
      <Button
        type="button"
        size={btnSize}
        variant="outline"
        onClick={onFullscreen}
        aria-label={
          fullscreen
            ? t("catalogs.viewer.exitFullscreen")
            : t("catalogs.viewer.fullscreen")
        }
      >
        {fullscreen ? (
          <Minimize2 className="size-4" />
        ) : (
          <Maximize2 className="size-4" />
        )}
        {!iconOnly &&
          (fullscreen
            ? t("catalogs.viewer.exitFullscreen")
            : t("catalogs.viewer.fullscreen"))}
      </Button>
      {allowDownload ? (
        <Button type="button" size={btnSize} variant="outline" asChild>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("catalogs.viewer.download")}
          >
            <Download className="size-4" />
            {!iconOnly && t("catalogs.viewer.download")}
          </a>
        </Button>
      ) : null}
    </div>
  );
}

export function CatalogFlipbook({
  pdfUrl,
  allowDownload = true,
  initialPage = 1,
  onPageChange,
  onShare,
  className,
}: Props) {
  const { t } = useT();
  const layout = useCatalogViewport();
  const bookRef = useRef<FlipBookRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageImagesRef = useRef<Record<number, string>>({});
  const [doc, setDoc] = useState<PdfDocumentHandle | null>(null);
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  pageImagesRef.current = pageImages;

  const renderOptions = useMemo<PdfRenderOptions>(
    () => ({
      maxWidth: layout.maxWidth,
      quality: layout.quality,
    }),
    [layout.maxWidth, layout.quality],
  );

  const bookSize = useMemo(
    () => ({ width: layout.width, height: layout.height }),
    [layout.width, layout.height],
  );

  const iconOnly = layout.device === "mobile";

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

        const startPage = Math.min(Math.max(1, initialPage), handle.numPages);
        const first = await handle.renderPage(startPage, renderOptions);
        if (!active) return;
        setPageImages({ [startPage]: first });
        setCurrentPage(startPage);
        setLoading(false);

        const preloadPages = [startPage - 1, startPage + 1, startPage + 2]
          .filter((page) => page >= 1 && page <= handle!.numPages)
          .filter((page) => page !== startPage);

        await Promise.all(
          preloadPages.map(async (page) => {
            const src = await handle!.renderPage(page, renderOptions);
            if (!active) return;
            setPageImages((prev) => ({ ...prev, [page]: src }));
          }),
        );
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load PDF");
        setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      handle?.destroy();
    };
  }, [pdfUrl, reloadKey, initialPage, renderOptions]);

  const ensurePageLoaded = useCallback(
    async (pageNumber: number) => {
      if (!doc || pageImagesRef.current[pageNumber]) return;
      const src = await doc.renderPage(pageNumber, renderOptions);
      setPageImages((prev) => ({ ...prev, [pageNumber]: src }));

      const neighbors = [pageNumber - 1, pageNumber + 1, pageNumber + 2].filter(
        (page) =>
          page >= 1 && page <= doc.numPages && !pageImagesRef.current[page],
      );
      for (const page of neighbors) {
        void doc.renderPage(page, renderOptions).then((neighborSrc) => {
          setPageImages((prev) =>
            prev[page] ? prev : { ...prev, [page]: neighborSrc },
          );
        });
      }
    },
    [doc, renderOptions],
  );

  const onFlip = useCallback(
    (e: { data: number }) => {
      const page = e.data + 1;
      setCurrentPage(page);
      onPageChange?.(page);
      void ensurePageLoaded(page);
    },
    [ensurePageLoaded, onPageChange],
  );

  useEffect(() => {
    if (loading || !numPages || initialPage <= 1) return;
    const target = Math.min(Math.max(1, initialPage), numPages);
    const timer = window.setTimeout(() => {
      bookRef.current?.pageFlip().flip(target - 1);
      setCurrentPage(target);
    }, 100);
    return () => window.clearTimeout(timer);
  }, [loading, numPages, initialPage]);

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

  const pageLabel = loading
    ? t("catalogs.viewer.loading")
    : t("catalogs.viewer.pageOf")
        .replace("{current}", String(currentPage))
        .replace("{total}", String(numPages || "—"));

  const toolbarProps = {
    loading,
    currentPage,
    numPages,
    compact: layout.compactToolbar,
    iconOnly,
    allowDownload,
    pdfUrl,
    fullscreen,
    onPrev: goPrev,
    onNext: goNext,
    onShare,
    onFullscreen: () => void toggleFullscreen(),
  };

  if (error) {
    return (
      <div
        className={cn("space-y-4 rounded-xl border bg-muted/20 p-4", className)}
      >
        <p className="text-sm text-destructive">{error}</p>
        <p className="text-sm text-muted-foreground">
          {t("catalogs.viewer.flipLoadFailed")}
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setReloadKey((key) => key + 1)}
        >
          {t("catalogs.viewer.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("space-y-3 sm:space-y-4", className)}>
      {layout.compactToolbar ? (
        <p className="text-center text-xs text-muted-foreground sm:text-sm">
          {pageLabel}
        </p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <p className="text-sm text-muted-foreground">{pageLabel}</p>
          <ViewerToolbar {...toolbarProps} />
        </div>
      )}

      <div
        className={cn(
          "mx-auto flex w-full max-w-full justify-center overflow-hidden rounded-xl border bg-muted/30 shadow-sm",
          layout.device === "mobile" ? "p-1" : "p-2 sm:p-4 md:p-6",
        )}
      >
        {loading || !numPages ? (
          <div
            className="flex items-center justify-center rounded-lg bg-white text-sm text-muted-foreground"
            style={{ width: bookSize.width, height: bookSize.height }}
          >
            {t("catalogs.viewer.loading")}
          </div>
        ) : (
          <HTMLFlipBook
            key={`${bookSize.width}x${bookSize.height}-${layout.usePortrait}`}
            ref={bookRef}
            width={bookSize.width}
            height={bookSize.height}
            size="fixed"
            minWidth={240}
            maxWidth={layout.device === "desktop" ? 900 : bookSize.width}
            minHeight={340}
            maxHeight={bookSize.height}
            showCover
            mobileScrollSupport
            onFlip={onFlip}
            className="catalog-flipbook max-w-full touch-pan-y"
            usePortrait={layout.usePortrait}
            drawShadow={layout.device !== "mobile"}
            maxShadowOpacity={layout.device === "mobile" ? 0.2 : 0.35}
            flippingTime={
              layout.device === "mobile"
                ? 450
                : layout.device === "tablet"
                  ? 550
                  : 700
            }
          >
            {Array.from({ length: numPages }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <CatalogPage
                  key={pageNumber}
                  pageNumber={pageNumber}
                  src={pageImages[pageNumber]}
                  className="h-full min-h-0"
                />
              );
            })}
          </HTMLFlipBook>
        )}
      </div>

      {layout.compactToolbar ? (
        <div
          className={cn(
            "sticky z-30 -mx-1 rounded-xl border bg-background/95 px-2 py-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/85",
            "bottom-2 sm:bottom-4",
          )}
        >
          <ViewerToolbar {...toolbarProps} className="w-full" />
        </div>
      ) : null}
    </div>
  );
}
