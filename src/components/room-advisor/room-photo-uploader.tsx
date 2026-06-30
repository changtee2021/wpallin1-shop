import { Camera, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ROOM_ADVISOR_PHOTO_ACCEPT,
  ROOM_ADVISOR_PHOTO_MAX_MB,
  uploadRoomAdvisorPhoto,
} from "@/lib/room-advisor-upload";
import { cn } from "@/lib/utils";

export type UploadedPhoto = {
  id: string;
  previewUrl: string;
  publicUrl: string;
  storagePath: string;
  roomLabel: string;
  uploading: boolean;
};

const ROOM_TYPES = ["ห้องนอน", "ห้องนั่งเล่น", "ออฟฟิศ", "ห้องครัว", "อื่นๆ"];

type Props = {
  photos: UploadedPhoto[];
  onPhotosChange: (photos: UploadedPhoto[]) => void;
  roomTypeHint: string;
  onRoomTypeHintChange: (v: string) => void;
  customerNotes: string;
  onCustomerNotesChange: (v: string) => void;
  clientName: string;
  onClientNameChange: (v: string) => void;
  clientPhone: string;
  onClientPhoneChange: (v: string) => void;
  guestSessionId: string;
  accessToken?: string | null;
  showClientFields?: boolean;
};

export function RoomPhotoUploader({
  photos,
  onPhotosChange,
  roomTypeHint,
  onRoomTypeHintChange,
  customerNotes,
  onCustomerNotesChange,
  clientName,
  onClientNameChange,
  clientPhone,
  onClientPhoneChange,
  guestSessionId,
  accessToken,
  showClientFields = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const slots = Math.max(0, 5 - photos.length);
    const batch = Array.from(files).slice(0, slots);

    for (const file of batch) {
      const id = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);
      const placeholder: UploadedPhoto = {
        id,
        previewUrl,
        publicUrl: "",
        storagePath: "",
        roomLabel: "",
        uploading: true,
      };
      const nextAfterAdd = [...photos, placeholder];
      onPhotosChange(nextAfterAdd);

      try {
        const uploaded = await uploadRoomAdvisorPhoto(
          file,
          guestSessionId,
          accessToken,
        );
        onPhotosChange(
          nextAfterAdd.map((p) =>
            p.id === id
              ? {
                  ...p,
                  publicUrl: uploaded.publicUrl,
                  storagePath: uploaded.storagePath,
                  uploading: false,
                }
              : p,
          ),
        );
      } catch (err) {
        URL.revokeObjectURL(previewUrl);
        onPhotosChange(nextAfterAdd.filter((p) => p.id !== id));
        setError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
      }
    }
  };

  const removePhoto = (id: string) => {
    const target = photos.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onPhotosChange(photos.filter((p) => p.id !== id));
  };

  const updatePhoto = (id: string, patch: Partial<UploadedPhoto>) => {
    onPhotosChange(photos.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const readyCount = photos.filter((p) => !p.uploading && p.publicUrl).length;
  const isUploading = photos.some((p) => p.uploading);

  return (
    <div className="space-y-6">
      {showClientFields ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="client-name">ชื่อลูกค้า</Label>
            <Input
              id="client-name"
              value={clientName}
              onChange={(e) => onClientNameChange(e.target.value)}
              placeholder="ชื่อลูกค้า"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-phone">เบอร์โทร</Label>
            <Input
              id="client-phone"
              value={clientPhone}
              onChange={(e) => onClientPhoneChange(e.target.value)}
              placeholder="08x-xxx-xxxx"
            />
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <Label>รูปห้อง (1–5 รูป)</Label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={photos.length >= 5 || isUploading}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-muted/30 px-6 py-8 text-center transition hover:bg-muted/50",
            (photos.length >= 5 || isUploading) && "pointer-events-none opacity-60",
          )}
        >
          <Camera className="size-8 text-primary" />
          <span className="font-semibold text-foreground">ถ่ายรูป / เลือกจากอัลบั้ม</span>
          <span className="text-xs text-muted-foreground">
            JPG, PNG, WebP ≤ {ROOM_ADVISOR_PHOTO_MAX_MB}MB
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ROOM_ADVISOR_PHOTO_ACCEPT}
          capture="environment"
          multiple
          className="hidden"
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
      </div>

      {photos.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative w-28 shrink-0 space-y-1.5 sm:w-32"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-black/5">
                <img
                  src={photo.previewUrl}
                  alt=""
                  className="size-full object-cover"
                />
                {photo.uploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                    <Loader2 className="size-5 animate-spin text-primary" />
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute right-1 top-1 rounded-full bg-black/55 p-0.5 text-white"
                  aria-label="ลบรูป"
                >
                  <X className="size-3.5" />
                </button>
                {index === 0 ? (
                  <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    หลัก
                  </span>
                ) : null}
              </div>
              <Input
                value={photo.roomLabel}
                onChange={(e) =>
                  updatePhoto(photo.id, { roomLabel: e.target.value })
                }
                placeholder="ชื่อห้อง"
                className="h-8 text-xs"
                disabled={photo.uploading}
              />
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label>ประเภทห้อง</Label>
        <div className="flex flex-wrap gap-2">
          {ROOM_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onRoomTypeHintChange(type)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                roomTypeHint === type
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer-notes">ความต้องการเพิ่มเติม</Label>
        <Textarea
          id="customer-notes"
          value={customerNotes}
          onChange={(e) => onCustomerNotesChange(e.target.value)}
          placeholder="เช่น กันแสงเต็มที่, โทนขาว, งบประมาณกลางๆ…"
          rows={3}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        พร้อมวิเคราะห์ {readyCount} รูป
        {isUploading ? " · กำลังอัปโหลด…" : ""}
      </p>
    </div>
  );
}
