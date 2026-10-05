import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBi } from "@/lib/bi";

/** Loading placeholder matching the 4:5 product / project tiles. */
export function BrandGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          <Skeleton className="aspect-[4/5] w-full rounded-sm" />
          <Skeleton className="mt-4 h-3 w-24" />
          <Skeleton className="mt-2 h-5 w-2/3" />
          <Skeleton className="mt-2 h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

/** Route-level error state for brand pages: plain message, retry, and a way out. */
export function BrandPageError({ onRetry }: { onRetry?: () => void }) {
  const pick = useBi();

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <AlertTriangle className="size-8 text-accent" aria-hidden />
      <h1 className="mt-4 text-2xl font-semibold">
        {pick({ th: "โหลดหน้านี้ไม่สำเร็จ", en: "This page couldn't load" })}
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {pick({
          th: "ลองใหม่อีกครั้ง หรือติดต่อทีมงานทาง LINE ได้เลย",
          en: "Please try again, or reach our team on LINE.",
        })}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onRetry ? (
          <Button className="h-11 rounded-full" onClick={onRetry}>
            {pick({ th: "ลองอีกครั้ง", en: "Try again" })}
          </Button>
        ) : null}
        <Button variant="outline" className="h-11 rounded-full" asChild>
          <Link to="/">{pick({ th: "กลับหน้าแรก", en: "Back to home" })}</Link>
        </Button>
      </div>
    </div>
  );
}
