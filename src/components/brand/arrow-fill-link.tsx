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
function ArrowFillContent({ children }: { children: string }) {
  return (
    <>
      <span className="arrow-fill-btn__label">{children}</span>
      <span aria-hidden className="arrow-fill-btn__circle" />
      <span aria-hidden className="arrow-fill-btn__mask">
        <span className="arrow-fill-btn__label">{children}</span>
      </span>
      <span aria-hidden className="arrow-fill-btn__icon">
        <ArrowRightIcon className="arrow-fill-btn__svg arrow-fill-btn__svg--enter" />
        <ArrowRightIcon className="arrow-fill-btn__svg arrow-fill-btn__svg--exit" />
      </span>
    </>
  );
}

export function ArrowFillLink({
  children,
  className,
  ...props
}: ArrowFillLinkProps) {
  return (
    <Link {...props} className={cn("arrow-fill-btn", className)}>
      <ArrowFillContent>{children}</ArrowFillContent>
    </Link>
  );
}

type ArrowFillAnchorProps = Omit<ComponentProps<"a">, "children"> & {
  children: string;
};

/** Same pill for links that leave the app (e.g. the shop subdomain). */
export function ArrowFillAnchor({
  children,
  className,
  ...props
}: ArrowFillAnchorProps) {
  return (
    <a {...props} className={cn("arrow-fill-btn", className)}>
      <ArrowFillContent>{children}</ArrowFillContent>
    </a>
  );
}

type ArrowFillButtonProps = Omit<ComponentProps<"button">, "children"> & {
  children: string;
  /** On white backgrounds the white fill would vanish, so fill with ink instead. */
  onLight?: boolean;
};

export function ArrowFillButton({
  children,
  className,
  onLight = false,
  type = "button",
  ...props
}: ArrowFillButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={cn(
        "arrow-fill-btn disabled:pointer-events-none disabled:opacity-60",
        onLight &&
          "[--afb-fill:var(--color-foreground)] [--afb-fill-text:#fff] focus-visible:outline-foreground",
        className,
      )}
    >
      <ArrowFillContent>{children}</ArrowFillContent>
    </button>
  );
}
