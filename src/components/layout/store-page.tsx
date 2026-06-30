import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const WIDTH = {
  narrow: "max-w-3xl",
  medium: "max-w-5xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
} as const;

export type StorePageWidth = keyof typeof WIDTH;

/** Shared horizontal rhythm for storefront pages — roomy on mobile, balanced on desktop. */
export function storePageClasses(
  width: StorePageWidth = "wide",
  className?: string,
) {
  return cn(
    "mx-auto w-full",
    "px-4 py-6 sm:px-6 sm:py-8",
    "lg:px-8 lg:py-10",
    WIDTH[width],
    className,
  );
}

export function StorePage({
  width = "wide",
  className,
  children,
}: {
  width?: StorePageWidth;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={storePageClasses(width, className)}>{children}</div>
  );
}

/** Grid shell for account / dealer / admin sidebars */
export function storeSectionClasses(className?: string) {
  return cn(
    "mx-auto w-full",
    "px-4 py-6 sm:px-6 sm:py-8",
    "lg:px-8 lg:py-10",
    "max-w-6xl",
    className,
  );
}
