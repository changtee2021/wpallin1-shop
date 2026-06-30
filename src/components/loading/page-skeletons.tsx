import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function PageShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("animate-in fade-in-0 duration-300", className)}
      aria-busy="true"
      aria-label="Loading page"
    >
      {children}
    </div>
  );
}

export function PageHeaderSkeleton({ actions = false }: { actions?: boolean }) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48 max-w-full" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {actions ? <Skeleton className="h-10 w-28 shrink-0" /> : null}
    </div>
  );
}

export function DefaultPageSkeleton({ className }: { className?: string }) {
  return (
    <PageShell className={cn("space-y-6", className)}>
      <PageHeaderSkeleton />
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </PageShell>
  );
}

export function ListPageSkeleton({
  className,
  rows = 5,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <PageShell className={cn("space-y-4", className)}>
      <PageHeaderSkeleton actions />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </PageShell>
  );
}

export function GridPageSkeleton({
  className,
  count = 8,
}: {
  className?: string;
  count?: number;
}) {
  return (
    <PageShell className={cn("space-y-6", className)}>
      <PageHeaderSkeleton />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export function TablePageSkeleton({
  className,
  rows = 6,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <PageShell className={cn("space-y-4", className)}>
      <PageHeaderSkeleton actions />
      <Skeleton className="h-10 w-full rounded-lg" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </PageShell>
  );
}

export function DetailPageSkeleton({ className }: { className?: string }) {
  return (
    <PageShell className={cn("space-y-6", className)}>
      <PageHeaderSkeleton actions />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </PageShell>
  );
}

export function FormPageSkeleton({ className }: { className?: string }) {
  return (
    <PageShell className={cn("space-y-6", className)}>
      <PageHeaderSkeleton />
      <div className="space-y-4 rounded-xl border p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-32" />
      </div>
    </PageShell>
  );
}

export function DashboardPageSkeleton({ className }: { className?: string }) {
  return (
    <PageShell className={cn("space-y-6", className)}>
      <PageHeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-56 w-full rounded-xl" />
    </PageShell>
  );
}

export function CartPageSkeleton({ className }: { className?: string }) {
  return (
    <PageShell
      className={cn("mx-auto max-w-3xl space-y-4 px-4 py-8", className)}
    >
      <Skeleton className="h-8 w-40" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
      <Skeleton className="h-44 w-full rounded-xl" />
    </PageShell>
  );
}

export function AuthPageSkeleton({ className }: { className?: string }) {
  return (
    <PageShell
      className={cn(
        "mx-auto flex min-h-[50vh] max-w-md flex-col justify-center space-y-6 px-4 py-12",
        className,
      )}
    >
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-10 w-48" />
        <Skeleton className="mx-auto h-4 w-64" />
      </div>
      <div className="space-y-4 rounded-xl border p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </PageShell>
  );
}

export function InlineRowsSkeleton({
  rows = 3,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)} aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export type PageSkeletonVariant =
  | "default"
  | "list"
  | "grid"
  | "table"
  | "detail"
  | "form"
  | "dashboard"
  | "cart"
  | "auth";

const VARIANTS: Record<
  PageSkeletonVariant,
  ComponentType<{ className?: string }>
> = {
  default: DefaultPageSkeleton,
  list: ListPageSkeleton,
  grid: GridPageSkeleton,
  table: TablePageSkeleton,
  detail: DetailPageSkeleton,
  form: FormPageSkeleton,
  dashboard: DashboardPageSkeleton,
  cart: CartPageSkeleton,
  auth: AuthPageSkeleton,
};

export function PageLoading({
  variant = "default",
  className,
}: {
  variant?: PageSkeletonVariant;
  className?: string;
}) {
  const Component = VARIANTS[variant];
  return <Component className={className} />;
}

/** TanStack Router `pendingComponent` — inline skeleton only (layout stays mounted). */
export function RoutePendingFallback() {
  return (
    <div className="py-6">
      <PageLoading variant="default" />
    </div>
  );
}
