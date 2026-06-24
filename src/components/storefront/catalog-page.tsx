import { forwardRef } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  pageNumber: number;
  className?: string;
  zoom?: number;
};

export const CatalogPage = forwardRef<HTMLDivElement, Props>(
  function CatalogPage({ src, pageNumber, className, zoom = 1 }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full items-center justify-center bg-white",
          className,
        )}
        data-page={pageNumber}
      >
        {src ? (
          <img
            src={src}
            alt={`หน้า ${pageNumber}`}
            className="max-w-full object-contain transition-transform duration-200"
            style={{ transform: zoom !== 1 ? `scale(${zoom})` : undefined }}
            draggable={false}
            loading="lazy"
          />
        ) : (
          <div className="flex aspect-[3/4] w-full max-w-lg flex-col items-center justify-center gap-3 p-6">
            <Skeleton className="h-full w-full rounded-lg" />
            <span className="text-xs text-muted-foreground">
              กำลังโหลดหน้า {pageNumber}…
            </span>
          </div>
        )}
      </div>
    );
  },
);

/** @deprecated use CatalogPage */
export const CatalogFlipbookPage = CatalogPage;
