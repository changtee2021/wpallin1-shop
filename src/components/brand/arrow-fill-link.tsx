import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function ArrowRightIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

type ArrowFillLinkProps = Omit<ComponentProps<typeof Link>, "children"> & {
  children: string;
};

/**
 * Pill CTA: on hover the arrow circle grows to fill the whole pill, the label
 * flips colour and the arrow swaps. Port of the Framer "ArrowFillButton".
 * Styles live in styles.css (.arrow-fill-btn).
 */
export function ArrowFillLink({
  children,
  className,
  ...props
}: ArrowFillLinkProps) {
  return (
    <Link {...props} className={cn("arrow-fill-btn", className)}>
      <span className="arrow-fill-btn__label">{children}</span>
      <span aria-hidden className="arrow-fill-btn__circle" />
      <span aria-hidden className="arrow-fill-btn__mask">
        <span className="arrow-fill-btn__label">{children}</span>
      </span>
      <span aria-hidden className="arrow-fill-btn__icon">
        <ArrowRightIcon className="arrow-fill-btn__svg arrow-fill-btn__svg--enter" />
        <ArrowRightIcon className="arrow-fill-btn__svg arrow-fill-btn__svg--exit" />
      </span>
    </Link>
  );
}
