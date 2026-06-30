import { Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { InspirationSimilarRooms } from "@/components/storefront/inspiration-similar-rooms";
import { ShareSheet } from "@/components/storefront/share-sheet";
import { ContactSalesButton } from "@/components/storefront/contact-sales-button";
import { RecommendedStyleCard } from "@/components/room-advisor/recommended-style-card";
import { RoomAdvisorAnalysisSummary } from "@/components/room-advisor/room-advisor-analysis-summary";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { enableRoomAdvisorShareFn } from "@/lib/server-fns/room-advisor";
import { buildRoomAdvisorShareUrl } from "@/lib/room-advisor-session";
import type { InspirationRoomDto } from "@/types/api/inspiration";
import type { RoomAdvisorSessionDto } from "@/types/api/room-advisor";

type Props = {
  session: RoomAdvisorSessionDto;
  similarRooms: InspirationRoomDto[];
};

export function RoomAdvisorResultView({
  session,
  similarRooms,
}: Props) {
  const [shareOpen, setShareOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const heroPhotos =
    session.photos.length > 0
      ? session.photos
      : [];

  const handleShare = async () => {
    setSharing(true);
    try {
      const updated = await enableRoomAdvisorShareFn({
        data: { sessionId: session.id, expiresInDays: 7 },
      });
      const url = buildRoomAdvisorShareUrl(updated.shareToken);
      setShareUrl(url);
      setShareOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "สร้างลิงก์ไม่สำเร็จ");
    } finally {
      setSharing(false);
    }
  };

  const activeShareUrl =
    shareUrl ?? buildRoomAdvisorShareUrl(session.shareToken);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
          <Link to="/room-advisor">
            <ArrowLeft className="size-4" />
            กลับ
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={sharing}
            onClick={() => void handleShare()}
          >
            {sharing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Share2 className="size-4" />
            )}
            แชร์ลิงก์
          </Button>
          <ContactSalesButton />
          <Button size="sm" className="bg-accent hover:bg-accent/90" asChild>
            <Link to="/configurator">ไป Custom</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
        <div className="space-y-4">
          {heroPhotos.length > 1 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {heroPhotos.map((photo) => (
                  <CarouselItem key={photo.id}>
                    <div className="overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-black/5">
                      <img
                        src={photo.publicUrl}
                        alt={photo.roomLabel ?? "รูปห้อง"}
                        className="max-h-[70vh] w-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          ) : heroPhotos[0] ? (
            <div className="overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-black/5">
              <img
                src={heroPhotos[0].publicUrl}
                alt={heroPhotos[0].roomLabel ?? "รูปห้อง"}
                className="max-h-[70vh] w-full object-cover"
              />
            </div>
          ) : null}

          {similarRooms.length > 0 ? (
            <div>
              <h2 className="mb-4 text-lg font-semibold">
                ห้องในแกลเลอรีที่ใกล้เคียง
              </h2>
              <InspirationSimilarRooms rooms={similarRooms} />
            </div>
          ) : null}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          {session.analysis ? (
            <RoomAdvisorAnalysisSummary analysis={session.analysis} />
          ) : (
            <p className="text-sm text-muted-foreground">ยังไม่มีผลวิเคราะห์</p>
          )}

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">แบบที่ AI แนะนำ</h2>
            {session.recommendations.map((rec) => (
              <RecommendedStyleCard key={rec.rank} recommendation={rec} />
            ))}
          </div>

          {session.clientName ? (
            <p className="text-xs text-muted-foreground">
              ลูกค้า: {session.clientName}
              {session.clientPhone ? ` · ${session.clientPhone}` : ""}
            </p>
          ) : null}
        </aside>
      </div>

      <ShareSheet
        open={shareOpen}
        onOpenChange={setShareOpen}
        title="แบบม่านสำหรับคุณ — WP ALL"
        url={activeShareUrl}
        sheetTitle="แชร์ผลวิเคราะห์"
      />
    </div>
  );
}
