import { useEffect, useRef } from "react";

type InfiniteScrollSentinelProps = {
  onLoadMore: () => void;
  disabled?: boolean;
  rootMargin?: string;
};

export function InfiniteScrollSentinel({
  onLoadMore,
  disabled = false,
  rootMargin = "240px",
}: InfiniteScrollSentinelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [disabled, rootMargin]);

  return <div ref={ref} className="h-px w-full" aria-hidden />;
}
