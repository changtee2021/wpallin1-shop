import { Link } from "@tanstack/react-router";
import { Eye, Package, Sparkles } from "lucide-react";

import { InspirationLikeButton } from "@/components/storefront/inspiration-like-button";
import { InspirationShareButton } from "@/components/storefront/inspiration-share-button";
import { Badge } from "@/components/ui/badge";
import { useInspirationCardEngagement } from "@/hooks/use-inspiration-engagement";
import { useT } from "@/i18n";
import { formatEngagementCount } from "@/lib/format-engagement";
import { cn } from "@/lib/utils";
import type { InspirationRoomDto } from "@/types/api/inspiration";

type Props = {
  room: InspirationRoomDto;
  imageAspect?: "tall" | "default";
  className?: string;
};

export function InspirationRoomCard({
  room,
  imageAspect = "default",
  className,
}: Props) {
  const { t } = useT();
  const { counts, liked, toggleLike } = useInspirationCardEngagement(room.id, {
    viewCount: room.viewCount,
    likeCount: room.likeCount,
  });

  return (
    <article
      className={cn(
        "group mb-3 break-inside-avoid overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md lg:mb-4",
        className,
      )}
    >
      <Link
        to="/inspiration/$slug"
        params={{ slug: room.slug }}
        className="block"
      >
        <div className="relative">
          <img
            src={room.imageUrl}
            alt={room.title}
            className={cn(
              "w-full object-cover transition duration-300 group-hover:scale-[1.02]",
              imageAspect === "tall" ? "aspect-[3/4]" : "aspect-[4/5]",
            )}
            loading="lazy"
          />
          {room.isFeatured ? (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-white shadow">
              <Sparkles className="size-3" />
              {t("inspiration.badge.featured")}
            </span>
          ) : null}
          {room.hotspots.length > 0 ? (
            <span
              className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] text-white"
              aria-label={`${room.hotspots.length} ${t("inspiration.badge.products")}`}
            >
              {room.hotspots.length}
              <Package className="size-3" aria-hidden />
            </span>
          ) : null}
        </div>
        <div className="px-3 pt-3">
          {room.roomType ? (
            <p className="text-[10px] font-medium uppercase tracking-wide text-primary">
              {room.roomType}
            </p>
          ) : null}
          <p className="line-clamp-2 text-sm font-medium leading-snug">
            {room.title}
          </p>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-2">
        <div className="flex min-w-0 flex-1 flex-wrap gap-1">
          {room.moodTags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
            <Eye className="size-3.5" aria-hidden />
            {formatEngagementCount(counts.viewCount)}
          </span>
          <InspirationLikeButton
            liked={liked}
            likeCount={counts.likeCount}
            onToggle={toggleLike}
            compact
            showCount
          />
          <InspirationShareButton slug={room.slug} title={room.title} compact />
        </div>
      </div>
    </article>
  );
}
