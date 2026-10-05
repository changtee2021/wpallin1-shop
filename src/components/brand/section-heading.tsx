import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  index?: string;
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "light" | "dark";
  className?: string;
  as?: "h1" | "h2";
};

/** Numbered editorial heading used across brand pages: "01 — KICKER" over a large title. */
export function SectionHeading({
  index,
  kicker,
  title,
  description,
  action,
  tone = "light",
  className,
  as: Heading = "h2",
}: SectionHeadingProps) {
  const dark = tone === "dark";

  return (
    <div
      className={cn(
        "scroll-rise flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl">
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
        <Heading
          className={cn(
            Heading === "h1" ? "brand-display" : "brand-heading",
            "mt-4",
            dark ? "text-white" : "text-foreground",
          )}
        >
          {title}
        </Heading>
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
