import type { ReactNode } from "react";
import { FileImage, FileText, Loader2, Upload, Wand2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { openPdfDocument } from "@/lib/pdf-to-pages";
import {
  formatFileSize,
  pdfSizeHint,
  renderPdfCoverBlob,
  uploadCatalogAsset,
} from "@/lib/marketing-catalog-upload";
import { prepareFileForUpload } from "@/lib/media-compress";
import { cn } from "@/lib/utils";

type PdfMeta = {
  fileUrl: string;
  fileSize: number;
  storagePath?: string;
  pageCount?: number;
};

type Props = {
  accessToken: string | undefined;
  catalogId?: string;
  coverImageUrl: string;
  pdfUrl: string;
  onCoverChange: (url: string) => void;
  onPdfChange: (url: string, meta?: PdfMeta) => void;
};

export function CatalogAssetUpload({
  accessToken,
  catalogId,
  coverImageUrl,
  pdfUrl,
  onCoverChange,
  onPdfChange,
}: Props) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfHint, setPdfHint] = useState<string | null>(null);
  const [pendingPdfFile, setPendingPdfFile] = useState<File | null>(null);

  async function countPdfPages(fileUrl: string): Promise<number | undefined> {
    try {
      const doc = await openPdfDocument(fileUrl);
      const count = doc.numPages;
      doc.destroy();
      return count;
    } catch {
      return undefined;
    }
  }

  async function uploadCover(file: File) {
    if (!accessToken) {
      toast.error("กรุณาเข้าสู่ระบบ");
      return;
    }
    setUploadingCover(true);
    setCoverProgress(0);
    try {
      const prepared = await prepareFileForUpload(file);
      if (prepared.size < file.size) {
        toast.message(
          `บีบอัดรูปปกแล้ว ${formatFileSize(file.size)} → ${formatFileSize(prepared.size)}`,
        );
      }
      const { fileUrl } = await uploadCatalogAsset(
        prepared,
        "cover",
        accessToken,
        setCoverProgress,
      );
      onCoverChange(fileUrl);
      toast.success("อัปโหลดรูปปกแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploadingCover(false);
      setCoverProgress(0);
    }
  }

  async function uploadPdf(file: File) {
    if (!accessToken) {
      toast.error("กรุณาเข้าสู่ระบบ");
      return;
    }

    const hint = pdfSizeHint(file.size);
    setPdfHint(hint.message);
    if (hint.level === "error") {
      toast.error(hint.message);
      setPendingPdfFile(file);
      return;
    }

    setPendingPdfFile(file);
    setUploadingPdf(true);
    setPdfProgress(0);
    try {
      const { fileUrl, fileSize, storagePath } = await uploadCatalogAsset(
        file,
        "pdf",
        accessToken,
        setPdfProgress,
        catalogId,
      );
      const pageCount = await countPdfPages(fileUrl);
      onPdfChange(fileUrl, { fileUrl, fileSize, storagePath, pageCount });
      toast.success(
        pageCount ? `อัปโหลด PDF แล้ว (${pageCount} หน้า)` : "อัปโหลด PDF แล้ว",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploadingPdf(false);
      setPdfProgress(0);
    }
  }

  async function generateCoverFromPdf() {
    if (!pendingPdfFile) {
      toast.error("เลือกไฟล์ PDF ก่อน หรืออัปโหลด PDF แล้ว");
      return;
    }
    if (!accessToken) {
      toast.error("กรุณาเข้าสู่ระบบ");
      return;
    }

    setGeneratingCover(true);
    try {
      const blob = await renderPdfCoverBlob(pendingPdfFile);
      const coverFile = new File([blob], "catalog-cover.jpg", {
        type: "image/jpeg",
      });
      await uploadCover(coverFile);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "สร้างปกไม่สำเร็จ");
    } finally {
      setGeneratingCover(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
      <div>
        <h3 className="font-medium">ไฟล์แคตตาล็อก</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF แนะนำไม่เกิน 25MB (สูงสุด 50MB) —
          {catalogId
            ? " แทนที่ PDF จะใช้ URL เดิม (pdf/{id}.pdf)"
            : " บันทึกแคตตาล็อกครั้งแรกก่อน แล้วอัปโหลด PDF เพื่อ URL คงที่"}{" "}
          CLI:{" "}
          <code className="rounded bg-muted px-1">npm run media:compress</code>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AssetDropzone
          label="ไฟล์ PDF"
          icon={FileText}
          url={pdfUrl}
          previewAlt="PDF preview"
          uploading={uploadingPdf}
          progress={pdfProgress}
          hint={pdfHint}
          onPick={() => pdfInputRef.current?.click()}
        >
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadPdf(file);
              e.target.value = "";
            }}
          />
        </AssetDropzone>

        <AssetDropzone
          label="รูปปก"
          icon={FileImage}
          url={coverImageUrl}
          previewAlt="Cover"
          uploading={uploadingCover}
          progress={coverProgress}
          onPick={() => coverInputRef.current?.click()}
        >
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadCover(file);
              e.target.value = "";
            }}
          />
        </AssetDropzone>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>URL PDF</Label>
          <Input
            value={pdfUrl}
            onChange={(e) => onPdfChange(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label>URL รูปปก</Label>
          <Input
            value={coverImageUrl}
            onChange={(e) => onCoverChange(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!pendingPdfFile || generatingCover || uploadingCover}
          onClick={() => void generateCoverFromPdf()}
        >
          {generatingCover ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Wand2 className="size-4" />
          )}
          สร้างปกจากหน้า 1 ของ PDF
        </Button>
        {pendingPdfFile ? (
          <span className="self-center text-xs text-muted-foreground">
            ไฟล์ที่เลือก: {pendingPdfFile.name} (
            {formatFileSize(pendingPdfFile.size)})
          </span>
        ) : null}
      </div>
    </div>
  );
}

function AssetDropzone({
  label,
  icon: Icon,
  url,
  previewAlt,
  uploading,
  progress,
  hint,
  onPick,
  children,
}: {
  label: string;
  icon: typeof FileText;
  url: string;
  previewAlt: string;
  uploading: boolean;
  progress: number;
  hint?: string | null;
  onPick: () => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <button
        type="button"
        onClick={onPick}
        disabled={uploading}
        className={cn(
          "flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-white p-4 text-center transition-colors hover:border-primary/40 hover:bg-primary/5",
          uploading && "pointer-events-none opacity-70",
        )}
      >
        {url && label === "รูปปก" ? (
          <img
            src={url}
            alt={previewAlt}
            className="mb-2 max-h-24 rounded-md object-contain"
          />
        ) : (
          <Icon className="size-8 text-muted-foreground" />
        )}
        <span className="text-sm font-medium">
          {uploading ? "กำลังอัปโหลด…" : `คลิกเพื่ออัปโหลด${label}`}
        </span>
        {!uploading ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Upload className="size-3.5" />
            ลากวางหรือเลือกไฟล์
          </span>
        ) : null}
      </button>
      {uploading ? <Progress value={progress} className="h-2" /> : null}
      {hint ? (
        <p
          className={cn(
            "text-xs",
            hint.includes("ใหญ่เกิน")
              ? "text-destructive"
              : "text-muted-foreground",
          )}
        >
          {hint}
        </p>
      ) : null}
      {children}
    </div>
  );
}
