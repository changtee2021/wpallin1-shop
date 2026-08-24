import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type LazyMapsEmbedProps = {
  src: string;
  title: string;
  loadLabel: string;
  hintLabel: string;
  className?: string;
};

/** Load Google Maps iframe only when the block is near the viewport (or on tap). */
export function LazyMapsEmbed({
  src,
  title,
  loadLabel,
  hintLabel,
  className,
}: LazyMapsEmbedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || active) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [active]);

  return (
    <div ref={ref} className={cn("min-h-48", className)}>
      {active ? (
        <iframe
          title={title}
          src={src}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="flex h-full min-h-48 w-full flex-col items-center justify-center gap-1 bg-muted px-4 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <span>{loadLabel}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {hintLabel}
          </span>
        </button>
      )}
    </div>
  );
}
