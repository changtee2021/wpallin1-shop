import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type RevealOnScrollProps = {
  children: ReactNode;
  className?: string;
  /** Extra delay before the transition starts, for staggering a group of items. */
  delayMs?: number;
  /** Direction the content travels in from. Defaults to a gentle rise from below. */
  direction?: "up" | "left" | "right" | "none";
};

const HIDDEN_TRANSFORM: Record<
  RevealOnScrollProps["direction"] & string,
  string
> = {
  up: "translate-y-6",
  left: "-translate-x-6",
  right: "translate-x-6",
  none: "",
};

/** Fades + slides content into place the first time it scrolls into view. No-ops for prefers-reduced-motion. */
export function RevealOnScroll({
  children,
  className,
  delayMs = 0,
  direction = "up",
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        visible
          ? "translate-x-0 translate-y-0 opacity-100"
          : cn("opacity-0", HIDDEN_TRANSFORM[direction]),
        className,
      )}
      style={
        delayMs
          ? { transitionDelay: visible ? `${delayMs}ms` : "0ms" }
          : undefined
      }
    >
      {children}
    </div>
  );
}
