import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { CatalogFlipbook } from "@/components/storefront/catalog-flipbook";
import { CatalogProViewer } from "@/components/storefront/catalog-pro-viewer";
import { CatalogScrollViewer } from "@/components/storefront/catalog-scroll-viewer";
import {
  detectCatalogDevice,
  getCatalogPageUrl,
  readFlipbookPref,
  writeFlipbookPref,
} from "@/lib/catalog-config";
import { recordCatalogView } from "@/lib/api.functions";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

type Props = {
  pdfUrl: string;
  title: string;
  slug: string;
  catalogId: string;
  allowDownload: boolean;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
};

export function CatalogViewer({
  pdfUrl,
  title,
  slug,
  catalogId,
  allowDownload,
  initialPage = 1,
  onPageChange,
  className,
}: Props) {
  const { t } = useT();
  const [isMobile, setIsMobile] = useState(false);
  const [flipMode, setFlipMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    if (!isMobile) {
      setFlipMode(readFlipbookPref());
    }
  }, [isMobile]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    void recordCatalogView({
      data: {
        catalogId,
        device: detectCatalogDevice(),
        pageNumber: initialPage > 1 ? initialPage : undefined,
      },
    }).catch(() => undefined);
  }, [catalogId, initialPage]);

  const handleShare = useCallback(async () => {
    const url = getCatalogPageUrl(
      slug,
      currentPage > 1 ? currentPage : undefined,
    );
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success(t("catalogs.viewer.linkCopied"));
    } catch {
      toast.error(t("catalogs.viewer.shareFailed"));
    }
  }, [slug, title, currentPage, t]);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      onPageChange?.(page);
      void recordCatalogView({
        data: {
          catalogId,
          device: detectCatalogDevice(),
          pageNumber: page,
        },
      }).catch(() => undefined);
    },
    [catalogId, onPageChange],
  );

  const toggleFlipMode = (enabled: boolean) => {
    setFlipMode(enabled);
    writeFlipbookPref(enabled);
  };

  if (isMobile) {
    return (
      <CatalogScrollViewer
        pdfUrl={pdfUrl}
        allowDownload={allowDownload}
        initialPage={initialPage}
        onPageChange={handlePageChange}
        onShare={() => void handleShare()}
        className={className}
      />
    );
  }

  if (flipMode) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-primary underline-offset-2 hover:underline"
            onClick={() => toggleFlipMode(false)}
          >
            {t("catalogs.viewer.exitFlipMode")}
          </button>
        </div>
        <CatalogFlipbook pdfUrl={pdfUrl} title={title} />
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
          onClick={() => toggleFlipMode(true)}
        >
          {t("catalogs.viewer.enterFlipMode")}
        </button>
      </div>
      <CatalogProViewer
        pdfUrl={pdfUrl}
        allowDownload={allowDownload}
        initialPage={initialPage}
        onPageChange={handlePageChange}
        onShare={() => void handleShare()}
      />
    </div>
  );
}
