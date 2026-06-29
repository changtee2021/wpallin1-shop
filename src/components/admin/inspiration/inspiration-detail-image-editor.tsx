import { Plus, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { prepareFileForUpload } from "@/lib/media-compress";
import {
  INSPIRATION_IMAGE_ACCEPT,
  uploadInspirationImage,
  validateInspirationImageFile,
} from "@/lib/inspiration-upload";
import type { InspirationDetailImageDto } from "@/types/api/inspiration";

type Props = {
  accessToken: string | undefined;
  detailImages: InspirationDetailImageDto[];
  hotspots: Array<{ id?: string; clientId: string; label: string }>;
  onChange: (images: InspirationDetailImageDto[]) => void;
};

export function InspirationDetailImageEditor({
  accessToken,
  detailImages,
  hotspots,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  function updateImage(id: string, patch: Partial<InspirationDetailImageDto>) {
    onChange(
      detailImages.map((image) =>
        image.id === id ? { ...image, ...patch } : image,
      ),
    );
  }

  function removeImage(id: string) {
    onChange(detailImages.filter((image) => image.id !== id));
  }

  function addEmpty() {
    onChange([
      ...detailImages,
      {
        id: crypto.randomUUID(),
        imageUrl: "",
        label: "",
        caption: null,
        hotspotId: null,
      },
    ]);
  }

  async function handleUpload(file: File, targetId?: string) {
    if (!accessToken) {
      toast.error("กรุณาเข้าสู่ระบบ");
      return;
    }

    const validationError = validateInspirationImageFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const prepared = await prepareFileForUpload(file);
      const { fileUrl } = await uploadInspirationImage(
        prepared,
        accessToken,
        setProgress,
      );
      const id = targetId ?? crypto.randomUUID();
      const label = file.name.replace(/\.[^.]+$/, "");
      if (targetId) {
        updateImage(targetId, { imageUrl: fileUrl, label });
      } else {
        onChange([
          ...detailImages,
          { id, imageUrl: fileUrl, label, caption: null, hotspotId: null },
        ]);
      }
      toast.success("อัปโหลด swatch แล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <Label>รูปรายละเอียด (swatch)</Label>
          <p className="text-xs text-muted-foreground">
            แสดงใต้ภาพหลักบนหน้าร้าน — ว่างไว้จะสร้างอัตโนมัติจาก hotspot
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={addEmpty}>
            <Plus className="size-4" />
            เพิ่ม
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-4" />
            อัปโหลด
          </Button>
        </div>
      </div>

      {uploading ? <Progress value={progress} className="h-2" /> : null}

      <input
        ref={inputRef}
        type="file"
        accept={INSPIRATION_IMAGE_ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleUpload(file);
          event.target.value = "";
        }}
      />

      {!detailImages.length ? (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          ยังไม่มีรูป swatch
        </p>
      ) : (
        <div className="space-y-3">
          {detailImages.map((image) => (
            <div
              key={image.id}
              className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[96px_1fr]"
            >
              {image.imageUrl ? (
                <img
                  src={image.imageUrl}
                  alt=""
                  className="size-24 rounded-md border object-cover"
                />
              ) : (
                <button
                  type="button"
                  className="flex size-24 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = INSPIRATION_IMAGE_ACCEPT;
                    input.onchange = () => {
                      const file = input.files?.[0];
                      if (file) void handleUpload(file, image.id);
                    };
                    input.click();
                  }}
                >
                  อัปโหลด
                </button>
              )}
              <div className="space-y-2">
                <Input
                  placeholder="ชื่อ swatch"
                  value={image.label}
                  onChange={(event) =>
                    updateImage(image.id, { label: event.target.value })
                  }
                />
                <Input
                  placeholder="คำบรรยาย (ไม่บังคับ)"
                  value={image.caption ?? ""}
                  onChange={(event) =>
                    updateImage(image.id, {
                      caption: event.target.value || null,
                    })
                  }
                />
                <Input
                  placeholder="URL รูป"
                  value={image.imageUrl}
                  onChange={(event) =>
                    updateImage(image.id, { imageUrl: event.target.value })
                  }
                />
                {hotspots.length ? (
                  <select
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={image.hotspotId ?? ""}
                    onChange={(event) =>
                      updateImage(image.id, {
                        hotspotId: event.target.value || null,
                      })
                    }
                  >
                    <option value="">ไม่ผูก hotspot</option>
                    {hotspots.map((hotspot) => {
                      const hotspotKey = hotspot.id ?? hotspot.clientId;
                      return (
                        <option key={hotspotKey} value={hotspotKey}>
                          {hotspot.label || hotspotKey.slice(0, 8)}
                        </option>
                      );
                    })}
                  </select>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => removeImage(image.id)}
                >
                  <Trash2 className="size-4" />
                  ลบ swatch
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
