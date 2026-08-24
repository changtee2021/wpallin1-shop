import { useEffect, useMemo, useRef, useState } from "react";

type CountUpNumberProps = {
  value: string;
  className?: string;
  durationMs?: number;
};

type ParsedCountUpValue = {
  prefix: string;
  suffix: string;
  target: number;
  useThousandsSeparator: boolean;
};

function parseCountUpValue(value: string): ParsedCountUpValue | null {
  const match = value.match(/^(\D*)(\d[\d,]*)(.*)$/);
  if (!match) return null;

  const [, prefix, digits, suffix] = match;
  const target = Number(digits.replace(/,/g, ""));
  if (!Number.isFinite(target)) return null;

  return { prefix, suffix, target, useThousandsSeparator: digits.includes(",") };
}

function formatCountUpValue(parsed: ParsedCountUpValue, current: number) {
  const formatted = parsed.useThousandsSeparator
    ? current.toLocaleString("en-US")
    : String(current);
  return `${parsed.prefix}${formatted}${parsed.suffix}`;
}

function easeOutQuint(t: number) {
  return 1 - (1 - t) ** 5;
}

/** Animates a stat like "1,000+" or "24/7" from 0 up to its target the first time it scrolls into view. */
export function CountUpNumber({
  value,
  className,
  durationMs = 1400,
}: CountUpNumberProps) {
  const parsed = useMemo(() => parseCountUpValue(value), [value]);
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() =>
    parsed ? formatCountUpValue(parsed, 0) : value,
  );

  useEffect(() => {
    if (!parsed) return;
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    let cancelled = false;
    let rafId: number | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          if (cancelled) return;
          const progress = Math.min(Math.max((now - start) / durationMs, 0), 1);
          const current = Math.round(parsed.target * easeOutQuint(progress));
          setDisplay(formatCountUpValue(parsed, current));
          if (progress < 1) {
            rafId = requestAnimationFrame(tick);
          }
        };
        rafId = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [parsed, value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
