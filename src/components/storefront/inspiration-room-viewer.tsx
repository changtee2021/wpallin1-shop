import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { InspirationEngagementStats } from "@/components/storefront/inspiration-engagement-stats";
import { InspirationHotspotProductRow } from "@/components/storefront/inspiration-hotspot-product-row";
import { InspirationLikeButton } from "@/components/storefront/inspiration-like-button";
import { InspirationMaterialGallery } from "@/components/storefront/inspiration-material-gallery";
import { InspirationShareButton } from "@/components/storefront/inspiration-share-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInspirationEngagement } from "@/hooks/use-inspiration-engagement";
import { InspirationSimilarRooms } from "@/components/storefront/inspiration-similar-rooms";
import { buildConfiguratorSearchFromHotspot } from "@/lib/configurator-share";
import { resolveRoomDetailImages } from "@/lib/inspiration-detail-images";
import { buildMaterialSlugByHotspotId } from "@/lib/inspiration-materials";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import type {
  InspirationHotspotDto,
  InspirationRoomDto,
} from "@/types/api/inspiration";

type Props = {
  room: InspirationRoomDto;
  similarRooms?: InspirationRoomDto[];
};

export function InspirationRoomViewer({ room, similarRooms = [] }: Props) {
  const { t } = useT();
  const [activeId, setActiveId] = useState<string | null>(
    room.hotspots[0]?.id ?? null,
  );
  const { counts, liked, recordView, toggleLike } = useInspirationEngagement(
    room.id,
    { viewCount: room.viewCount, likeCount: room.likeCount },
  );
  const detailImages = resolveRoomDetailImages(room);
  const materialSlugByHotspotId = buildMaterialSlugByHotspotId(room);

  useEffect(() => {
    void recordView();
  }, [recordView]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
          <Link to="/inspiration">
            <ArrowLeft className="size-4" />
            {t("inspiration.viewer.back")}
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <InspirationEngagementStats
            viewCount={counts.viewCount}
            likeCount={counts.likeCount}
          />
          <InspirationLikeButton
            liked={liked}
            likeCount={counts.likeCount}
            onToggle={toggleLike}
            variant="outline"
          />
          <InspirationShareButton
            slug={room.slug}
            title={room.title}
            variant="outline"
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-black/5">
            <img
              src={room.imageUrl}
              alt={room.title}
              className="block max-h-[70vh] w-full object-cover"
            />
            {room.hotspots.map((hotspot) => (
              <HotspotDot
                key={hotspot.id}
                hotspot={hotspot}
                active={activeId === hotspot.id}
                onSelect={() => setActiveId(hotspot.id)}
              />
            ))}
          </div>

          <InspirationMaterialGallery
            images={detailImages}
            activeHotspotId={activeId}
            onSelectHotspot={setActiveId}
            materialSlugByHotspotId={materialSlugByHotspotId}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div>
            {room.roomType ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {room.roomType}
              </p>
            ) : null}
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              {room.title}
            </h1>
            {room.description ? (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {room.description}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {room.moodTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {room.styleTags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              {t("inspiration.viewer.products")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("inspiration.viewer.hint")}
            </p>
          </div>

          {room.hotspots.length > 0 ? (
            <ul className="space-y-3">
              {room.hotspots.map((hotspot) => (
                <InspirationHotspotProductRow
                  key={hotspot.id}
                  hotspot={hotspot}
                  active={activeId === hotspot.id}
                  onSelect={() => setActiveId(hotspot.id)}
                />
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
              {t("inspiration.viewer.noProducts")}
            </div>
          )}

          <Button className="w-full bg-accent hover:bg-accent/90" asChild>
            <Link
              to="/configurator"
              search={buildConfiguratorSearchFromHotspot(
                room.hotspots.find((h) => h.id === activeId) ??
                  room.hotspots[0] ??
                  {},
              )}
            >
              {t("inspiration.viewer.useStyle")}
            </Link>
          </Button>
        </aside>
      </div>

      <InspirationSimilarRooms rooms={similarRooms} />
    </div>
  );
}

function HotspotDot({
  hotspot,
  active,
  onSelect,
}: {
  hotspot: InspirationHotspotDto;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={hotspot.label ?? "Product tag"}
      onClick={onSelect}
      className={cn(
        "absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white/25 shadow-sm backdrop-blur-[1px] transition hover:bg-accent/35 hover:scale-110",
        active &&
          "size-[1.125rem] border-white/90 bg-accent/55 ring-2 ring-white/50 ring-offset-1 ring-offset-transparent",
      )}
      style={{ left: `${hotspot.posX}%`, top: `${hotspot.posY}%` }}
    />
  );
}
