import { Images, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AdminMediaLibraryDialog } from "@/components/admin/shared/admin-media-library-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  ADMIN_IMAGE_ACCEPT,
  uploadAdminImage,
  validateAdminImageFile,
} from "@/lib/admin-image-upload";
import type { authServerFnOptions } from "@/lib/server-fn-auth";
import { prepareFileForUpload } from "@/lib/media-compress";

type AuthOpts = ReturnType<typeof authServerFnOptions>;

type Props = {
  accessToken: string | undefined;
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  uploadEndpoint: string;
  label?: string;
  accept?: string;
  validate?: (file: File) => string | null;
  showUrlInput?: boolean;
  previewClassName?: string;
  authOpts?: AuthOpts;
  mediaFolder?: string;
  showLibraryPicker?: boolean;
};

export function AdminImageUploader({
  accessToken,
  imageUrl,
  onImageUrlChange,
  uploadEndpoint,
  label = "รูปภาพ",
  accept = ADMIN_IMAGE_ACCEPT,
  validate = validateAdminImageFile,
  showUrlInput = true,
  previewClassName = "aspect-[4/3] w-full rounded-lg border object-cover",
  authOpts,
  mediaFolder = "general",
  showLibraryPicker = true,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [libraryOpen, setLibraryOpen] = useState(false);

  async function handleUpload(file: File) {
    if (!accessToken) {
      toast.error("กรุณาเข้าสู่ระบบ");
      return;
    }

    const validationError = validate(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const prepared = await prepareFileForUpload(file);
      const { fileUrl } = await uploadAdminImage(
        prepared,
        uploadEndpoint,
        accessToken,
        setProgress,
      );
      onImageUrlChange(fileUrl);
      toast.success("อัปโหลดรูปแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {imageUrl ? (
        <img src={imageUrl} alt="" className={previewClassName} />
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          อัปโหลดรูป
        </Button>
        {showLibraryPicker && authOpts ? (
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => setLibraryOpen(true)}
          >
            <Images className="size-4" />
            เลือกจากคลัง
          </Button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleUpload(file);
            event.target.value = "";
          }}
        />
      </div>
      {uploading ? <Progress value={progress} className="h-2" /> : null}
      {showUrlInput ? (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">หรือวาง URL</Label>
          <Input
            value={imageUrl}
            placeholder="https://…"
            onChange={(event) => onImageUrlChange(event.target.value)}
          />
        </div>
      ) : null}
      {showLibraryPicker && authOpts ? (
        <AdminMediaLibraryDialog
          open={libraryOpen}
          onOpenChange={setLibraryOpen}
          authOpts={authOpts}
          folder={mediaFolder}
          onSelect={onImageUrlChange}
        />
      ) : null}
    </div>
  );
}
