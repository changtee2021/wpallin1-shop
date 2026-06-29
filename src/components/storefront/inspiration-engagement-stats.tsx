import { Eye, Heart } from "lucide-react";

import { formatEngagementCount } from "@/lib/format-engagement";
import { cn } from "@/lib/utils";

export function InspirationEngagementStats({
  viewCount,
  likeCount,
  className,
}: {
  viewCount: number;
  likeCount: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-[11px] text-muted-foreground",
        className,
      )}
    >
      <span className="inline-flex items-center gap-0.5">
        <Eye className="size-3.5" aria-hidden />
        {formatEngagementCount(viewCount)}
      </span>
      <span className="inline-flex items-center gap-0.5">
        <Heart className="size-3.5" aria-hidden />
        {formatEngagementCount(likeCount)}
      </span>
    </div>
  );
}
