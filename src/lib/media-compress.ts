/**
 * Browser-side image compression before admin upload (catalog cover, product photos).
 * Video/audio/PDF: use CLI — npm run media:compress (see docs/MEDIA-COMPRESS.md).
 */

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;
const COMPRESSIBLE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("โหลดรูปภาพไม่สำเร็จ"));
      img.src = url;
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

export async function compressImageForUpload(file: File): Promise<File> {
  if (!COMPRESSIBLE_IMAGE_TYPES.has(file.type)) return file;
  if (typeof document === "undefined") return file;

  try {
    const img = await loadImage(file);
    const { width: w, height: h } = img;
    const scale = Math.min(1, MAX_DIMENSION / Math.max(w, h));
    const targetW = Math.round(w * scale);
    const targetH = Math.round(h * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export type UploadMediaKind = "image" | "video" | "audio" | "pdf" | "other";

export function detectUploadMediaKind(file: File): UploadMediaKind {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type === "application/pdf") return "pdf";
  return "other";
}

/** Compress when possible; otherwise return original file. */
export async function prepareFileForUpload(file: File): Promise<File> {
  const kind = detectUploadMediaKind(file);
  if (kind === "image") return compressImageForUpload(file);
  return file;
}

export const MEDIA_CLI_HINT =
  'บีบอัดไฟล์ก่อนอัปโหลด: npm run media:compress -- "<path>" (ดู docs/MEDIA-COMPRESS.md)';
