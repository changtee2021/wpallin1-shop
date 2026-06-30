import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { RoomAdvisorHero } from "@/components/room-advisor/room-advisor-hero";
import {
  RoomPhotoUploader,
  type UploadedPhoto,
} from "@/components/room-advisor/room-photo-uploader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  analyzeRoomAdvisorSessionFn,
  createRoomAdvisorSessionFn,
} from "@/lib/server-fns/room-advisor";
import { getRoomAdvisorGuestSessionId } from "@/lib/room-advisor-session";
import { useAuthServerFnOptions } from "@/lib/server-fn-auth";

export const Route = createFileRoute("/_store/room-advisor/")({
  component: RoomAdvisorIndexPage,
});

function RoomAdvisorIndexPage() {
  const navigate = useNavigate();
  const { session, isAdmin } = useAuth();
  const authOpts = useAuthServerFnOptions(session);
  const guestSessionId = getRoomAdvisorGuestSessionId();

  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [roomTypeHint, setRoomTypeHint] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const readyPhotos = photos.filter((p) => !p.uploading && p.publicUrl);

  const handleAnalyze = async () => {
    if (readyPhotos.length === 0) {
      toast.error("กรุณาอัปโหลดรูปอย่างน้อย 1 รูป");
      return;
    }

    setBusy(true);
    try {
      const created = await createRoomAdvisorSessionFn({
        ...authOpts,
        data: {
          guestSessionId,
          clientName: clientName || null,
          clientPhone: clientPhone || null,
          roomTypeHint: roomTypeHint || null,
          customerNotes: customerNotes || null,
          photos: readyPhotos.map((p, index) => ({
            storagePath: p.storagePath,
            publicUrl: p.publicUrl,
            roomLabel: p.roomLabel || null,
            sortOrder: index,
            isHero: index === 0,
          })),
        },
      });

      await analyzeRoomAdvisorSessionFn({
        ...authOpts,
        data: { sessionId: created.id, guestSessionId },
      });

      await navigate({
        to: "/room-advisor/result/$id",
        params: { id: created.id },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "วิเคราะห์ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
      <PageHeader
        title="AI ที่ปรึกษาห้อง"
        description="อัปโหลดรูปหน้างาน — AI แนะนำสไตล์และม่านที่เหมาะ"
      />
      <RoomAdvisorHero />
      <RoomPhotoUploader
        photos={photos}
        onPhotosChange={setPhotos}
        roomTypeHint={roomTypeHint}
        onRoomTypeHintChange={setRoomTypeHint}
        customerNotes={customerNotes}
        onCustomerNotesChange={setCustomerNotes}
        clientName={clientName}
        onClientNameChange={setClientName}
        clientPhone={clientPhone}
        onClientPhoneChange={setClientPhone}
        guestSessionId={guestSessionId}
        accessToken={session?.access_token}
        showClientFields={isAdmin}
      />

      <div className="sticky bottom-20 z-20 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur md:bottom-0">
        <Button
          className="w-full gap-2 bg-accent hover:bg-accent/90"
          size="lg"
          disabled={busy || readyPhotos.length === 0}
          onClick={() => void handleAnalyze()}
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Sparkles className="size-5" />
          )}
          วิเคราะห์ด้วย AI
        </Button>
      </div>
    </div>
  );
}
