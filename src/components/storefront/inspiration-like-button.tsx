import { Heart } from "lucide-react";
import type { MouseEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatEngagementCount } from "@/lib/format-engagement";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

type Props = {
  liked: boolean;
  likeCount: number;
  onToggle: () => Promise<boolean>;
  className?: string;
  variant?: "outline" | "ghost";
  compact?: boolean;
  showCount?: boolean;
};

export function InspirationLikeButton({
  liked,
  likeCount,
  onToggle,
  className,
  variant = "ghost",
  compact = false,
  showCount = false,
}: Props) {
  const { t } = useT();

  async function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    const nowLiked = await onToggle();
    toast.success(
      nowLiked ? t("inspiration.like.added") : t("inspiration.like.removed"),
    );
  }

  if (compact && showCount) {
    return (
      <button
        type="button"
        onClick={(e) => void handleClick(e)}
        className={cn(
          "inline-flex items-center gap-0.5 text-[11px] text-muted-foreground transition hover:text-foreground",
          liked && "text-red-500",
          className,
        )}
        aria-label={t("inspiration.like.aria")}
      >
        <Heart
          className={cn("size-3.5", liked && "fill-red-500 text-red-500")}
        />
        {formatEngagementCount(likeCount)}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="icon"
      className={cn(
        compact ? "size-7" : "size-8",
        "shrink-0",
        !compact && "bg-white/90 shadow-sm backdrop-blur-sm",
        className,
      )}
      onClick={(e) => void handleClick(e)}
      aria-label={t("inspiration.like.aria")}
    >
      <Heart className={cn("size-4", liked && "fill-red-500 text-red-500")} />
      {showCount ? (
        <span className="sr-only">{formatEngagementCount(likeCount)}</span>
      ) : null}
    </Button>
  );
}
