import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  Search,
  Share2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

type Props = {
  currentPage: number;
  numPages: number;
  zoom: number;
  fullscreen: boolean;
  allowDownload: boolean;
  pdfUrl: string;
  showFlipToggle?: boolean;
  flipMode?: boolean;
  onFlipToggle?: () => void;
  onPrev: () => void;
  onNext: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFullscreen: () => void;
  onGoToPage: (page: number) => void;
  onShare: () => void;
  onSearch?: () => void;
  className?: string;
  compact?: boolean;
};

export function CatalogViewerToolbar({
  currentPage,
  numPages,
  zoom,
  fullscreen,
  allowDownload,
  pdfUrl,
  showFlipToggle,
  flipMode,
  onFlipToggle,
  onPrev,
  onNext,
  onZoomIn,
  onZoomOut,
  onFullscreen,
  onGoToPage,
  onShare,
  onSearch,
  className,
  compact = false,
}: Props) {
  const { t } = useT();

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        {t("catalogs.viewer.pageOf")
          .replace("{current}", String(currentPage))
          .replace("{total}", String(numPages || "—"))}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {!compact ? (
          <Input
            type="number"
            min={1}
            max={numPages || 1}
            value={currentPage}
            onChange={(e) => {
              const page = Number(e.target.value);
              if (page >= 1 && page <= numPages) onGoToPage(page);
            }}
            className="h-8 w-16 text-center"
            aria-label={t("catalogs.viewer.goToPage")}
          />
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onPrev}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="size-4" />
          {!compact ? t("catalogs.viewer.prev") : null}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onNext}
          disabled={currentPage >= numPages}
        >
          {!compact ? t("catalogs.viewer.next") : null}
          <ChevronRight className="size-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onZoomOut}
          disabled={zoom <= 0.75}
        >
          <ZoomOut className="size-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onZoomIn}
          disabled={zoom >= 2.5}
        >
          <ZoomIn className="size-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void onFullscreen()}
        >
          {fullscreen ? (
            <Minimize2 className="size-4" />
          ) : (
            <Maximize2 className="size-4" />
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void onShare()}
        >
          <Share2 className="size-4" />
          {!compact ? t("catalogs.viewer.share") : null}
        </Button>
        {onSearch ? (
          <Button type="button" size="sm" variant="outline" onClick={onSearch}>
            <Search className="size-4" />
            {!compact ? t("catalogs.viewer.search") : null}
          </Button>
        ) : null}
        {allowDownload ? (
          <Button type="button" size="sm" variant="outline" asChild>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download>
              <Download className="size-4" />
              {!compact ? t("catalogs.viewer.download") : null}
            </a>
          </Button>
        ) : null}
        {showFlipToggle && onFlipToggle ? (
          <Button
            type="button"
            size="sm"
            variant={flipMode ? "default" : "outline"}
            onClick={onFlipToggle}
          >
            {t("catalogs.viewer.flipMode")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
