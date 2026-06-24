import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { prepareFileForUpload } from "@/lib/media-compress";
import {
  HERO_BANNER_ACCEPT,
  uploadHeroBanner,
  validateHeroBannerFile,
} from "@/lib/hero-banner-upload";
import type { HeroBannerDto } from "@/types/api/hero-banners";

type Props = {
  accessToken: string | undefined;
  banners: HeroBannerDto[];
  onChange: (banners: HeroBannerDto[]) => void;
};

export function HeroBannerManager({ accessToken, banners, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  function updateBanner(id: string, patch: Partial<HeroBannerDto>) {
    onChange(banners.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function moveBanner(id: string, direction: -1 | 1) {
    const index = banners.findIndex((b) => b.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= banners.length) return;
    const next = [...banners];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((item, sortOrder) => ({ ...item, sortOrder })));
  }

  function removeBanner(id: string) {
    onChange(banners.filter((b) => b.id !== id));
  }

  async function handleUpload(file: File) {
    if (!accessToken) {
      toast.error("กรุณาเข้าสู่ระบบ");
      return;
    }

    const validationError = validateHeroBannerFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const prepared = await prepareFileForUpload(file);
      const { fileUrl } = await uploadHeroBanner(
        prepared,
        accessToken,
        setProgress,
      );
      onChange([
        ...banners,
        {
          id: crypto.randomUUID(),
          imageUrl: fileUrl,
          linkUrl: null,
          alt: file.name.replace(/\.[^.]+$/, ""),
          sortOrder: banners.length,
          isActive: true,
        },
      ]);
      toast.success("อัปโหลดแบนเนอร์แล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <h2 className="font-semibold">อัปโหลดแบนเนอร์ใหม่</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              แนะนำภาพแนวนอน (เช่น 1920×640 หรือ 1600×540) — JPG/PNG/WebP ไม่เกิน
              8MB ระบบบีบอัดรูปอัตโนมัติ
            </p>
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/20 p-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="size-8 animate-spin text-primary" />
            ) : (
              <ImageIcon className="size-8 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              {uploading ? "กำลังอัปโหลด…" : "คลิกเพื่ออัปโหลดแบนเนอร์แนวนอน"}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Upload className="size-3.5" />
              ลากวางหรือเลือกไฟล์
            </span>
          </button>
          {uploading ? <Progress value={progress} className="h-2" /> : null}
          <input
            ref={inputRef}
            type="file"
            accept={HERO_BANNER_ACCEPT}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
              e.target.value = "";
            }}
          />
        </CardContent>
      </Card>

      {banners.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          ยังไม่มีแบนเนอร์ — อัปโหลดภาพแรกเพื่อแสดงสไลด์บนหน้าแรก
        </p>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, index) => (
            <Card key={banner.id}>
              <CardContent className="space-y-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <img
                      src={banner.imageUrl}
                      alt={banner.alt ?? `แบนเนอร์ ${index + 1}`}
                      className="max-h-36 w-full rounded-lg object-cover sm:max-h-44"
                    />
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      disabled={index === 0}
                      onClick={() => moveBanner(banner.id, -1)}
                      aria-label="เลื่อนขึ้น"
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      disabled={index === banners.length - 1}
                      onClick={() => moveBanner(banner.id, 1)}
                      aria-label="เลื่อนลง"
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => removeBanner(banner.id)}
                      aria-label="ลบ"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>ลิงก์เมื่อคลิก (ไม่บังคับ)</Label>
                    <Input
                      value={banner.linkUrl ?? ""}
                      placeholder="/shop หรือ https://..."
                      onChange={(e) =>
                        updateBanner(banner.id, {
                          linkUrl: e.target.value.trim() || null,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>คำอธิบายภาพ (alt)</Label>
                    <Input
                      value={banner.alt ?? ""}
                      onChange={(e) =>
                        updateBanner(banner.id, {
                          alt: e.target.value.trim() || null,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id={`active-${banner.id}`}
                    checked={banner.isActive}
                    onCheckedChange={(checked) =>
                      updateBanner(banner.id, { isActive: checked })
                    }
                  />
                  <Label htmlFor={`active-${banner.id}`}>แสดงบนหน้าแรก</Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
