import { forwardRef } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  pageNumber: number;
  className?: string;
};

export const CatalogFlipbookPage = forwardRef<HTMLDivElement, Props>(
  function CatalogFlipbookPage({ src, pageNumber, className }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "flex size-full items-center justify-center bg-white",
          className,
        )}
        data-page={pageNumber}
      >
        {src ? (
          <img
            src={src}
            alt={`หน้า ${pageNumber}`}
            className="size-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-3 p-6">
            <Skeleton className="h-full w-full" />
            <span className="text-xs text-muted-foreground">
              กำลังโหลดหน้า {pageNumber}…
            </span>
          </div>
        )}
      </div>
    );
  },
);
