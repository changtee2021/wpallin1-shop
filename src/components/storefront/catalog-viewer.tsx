import { useCallback, useEffect, useState } from "react";

import { CatalogFlipbook } from "@/components/storefront/catalog-flipbook";
import { ShareSheet } from "@/components/storefront/share-sheet";
import { detectCatalogDevice, getCatalogPageUrl } from "@/lib/catalog-config";
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
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    void recordCatalogView({
      data: {
        catalogId,
        device: detectCatalogDevice(),
        pageNumber: initialPage > 1 ? initialPage : undefined,
      },
    }).catch(() => undefined);
  }, [catalogId, initialPage]);

  const shareUrl = getCatalogPageUrl(
    slug,
    currentPage > 1 ? currentPage : undefined,
  );

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

  return (
    <>
      <CatalogFlipbook
        pdfUrl={pdfUrl}
        title={title}
        allowDownload={allowDownload}
        initialPage={initialPage}
        onPageChange={handlePageChange}
        onShare={() => setShareOpen(true)}
        className={cn(className)}
      />
      <ShareSheet
        open={shareOpen}
        onOpenChange={setShareOpen}
        title={title}
        url={shareUrl}
        sheetTitle={t("share.titleCatalog")}
      />
    </>
  );
}
