import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  showLabel?: boolean;
  /** Parent must be `relative` with defined size (e.g. aspect-ratio box). */
  fill?: boolean;
};

const PLACEHOLDER_GRADIENTS = [
  "from-rose-100 to-amber-100",
  "from-sky-100 to-indigo-100",
  "from-emerald-100 to-teal-100",
  "from-violet-100 to-fuchsia-100",
  "from-orange-100 to-yellow-100",
  "from-cyan-100 to-blue-100",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Renders the product image, falling back to a deterministic gradient
 * placeholder while real images are still being uploaded.
 */
export function ProductImage({
  src,
  alt,
  className,
  imgClassName,
  showLabel = true,
  fill = false,
}: ProductImageProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          fill
            ? "absolute inset-0 h-full w-full object-cover"
            : "block h-full w-full max-h-full max-w-full object-cover",
          imgClassName,
          className,
        )}
        loading="lazy"
      />
    );
  }

  const gradient =
    PLACEHOLDER_GRADIENTS[hashString(alt) % PLACEHOLDER_GRADIENTS.length];

  return (
    <div
      className={cn(
        "flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br p-4 text-center text-muted-foreground",
        gradient,
        className,
      )}
      role="img"
      aria-label={alt}
    >
      <ImageOff className="size-8 opacity-50" aria-hidden />
      {showLabel && (
        <span className="line-clamp-2 text-xs font-medium text-foreground/60">
          {alt}
        </span>
      )}
    </div>
  );
}
