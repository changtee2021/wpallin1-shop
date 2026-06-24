import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

type ProfileAvatarPickerProps = {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  onUploaded: (avatarUrl: string) => void;
};

export function ProfileAvatarPicker({
  displayName,
  email,
  avatarUrl,
  onUploaded,
}: ProfileAvatarPickerProps) {
  const { session } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const initials = (displayName[0] ?? email[0] ?? "U").toUpperCase();

  async function handleFile(file: File) {
    if (!session?.access_token) {
      toast.error("กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/v1/profile-avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: form,
      });
      const json = (await res.json()) as {
        ok?: boolean;
        avatarUrl?: string;
        error?: string;
      };
      if (!res.ok || !json.avatarUrl) {
        throw new Error(json.error ?? "อัปโหลดไม่สำเร็จ");
      }
      onUploaded(json.avatarUrl);
      toast.success("เปลี่ยนรูปโปรไฟล์แล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative">
        <Avatar className="size-20 rounded-2xl">
          {avatarUrl ? (
            <AvatarImage
              src={avatarUrl}
              alt={displayName}
              className="rounded-2xl"
            />
          ) : null}
          <AvatarFallback className="rounded-2xl text-xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute -bottom-1 -right-1 size-8 rounded-full shadow"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Camera className="size-4" />
          )}
        </Button>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">รูปโปรไฟล์</p>
        <p className="text-xs text-muted-foreground">
          JPG, PNG หรือ WebP ไม่เกิน 5 MB
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? "กำลังอัปโหลด..." : "เปลี่ยนรูปโปรไฟล์"}
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
