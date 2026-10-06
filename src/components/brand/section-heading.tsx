import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  index?: string;
  kicker: string;
  /** Drop the "01 — KICKER" line and show only the title. */
  hideKicker?: boolean;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "light" | "dark";
  className?: string;
  as?: "h1" | "h2";
};

/**
 * Numbered editorial heading used across brand pages: "01 — KICKER" over a large title.
 * As an `h1` it becomes the page masthead: kicker, a very large title on the left,
 * and the description (plus any action) aligned right at the title's baseline.
 */
export function SectionHeading({
  index,
  kicker,
  hideKicker = false,
  title,
  description,
  action,
  tone = "light",
  className,
  as: Heading = "h2",
}: SectionHeadingProps) {
  const dark = tone === "dark";
  const masthead = Heading === "h1";

  const kickerEl = (
    <p
      className={cn(
        "brand-kicker flex items-center gap-3",
        dark ? "text-accent" : "text-primary",
      )}
    >
      {index ? (
        <>
          <span
            className={cn(
              "brand-index",
              dark ? "text-white/50" : "text-muted-foreground",
            )}
          >
            {index}
          </span>
          <span
            aria-hidden
            className={cn("h-px w-8", dark ? "bg-white/30" : "bg-border")}
          />
        </>
      ) : null}
      {kicker}
    </p>
  );

  const titleEl = (
    <Heading
      className={cn(
        masthead
          ? "text-[clamp(2.75rem,8.5vw,6.5rem)] leading-[1.12] font-medium tracking-tight text-balance"
          : "brand-heading",
        hideKicker ? "mt-0" : "mt-4",
        dark ? "text-white" : "text-foreground",
      )}
    >
      {title}
    </Heading>
  );

  if (masthead) {
    return (
      <div
        className={cn(
          "scroll-rise flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16",
          className,
        )}
      >
        <div className="min-w-0 max-w-5xl">
          {hideKicker ? null : kickerEl}
          {titleEl}
        </div>
        {description || action ? (
          <div className="flex max-w-sm shrink-0 flex-col gap-4 lg:items-end lg:pb-3 lg:text-right">
            {description ? (
              <p
                className={cn(
                  "text-base leading-7 text-pretty",
                  dark ? "text-white/70" : "text-muted-foreground",
                )}
              >
                {description}
              </p>
            ) : null}
            {action}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "scroll-rise flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl">
        {hideKicker ? null : kickerEl}
        {titleEl}
        {description ? (
          <p
            className={cn(
              "mt-4 max-w-2xl text-base leading-7 text-pretty",
              dark ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
