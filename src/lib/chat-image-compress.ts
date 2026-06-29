import { CHAT_IMAGE_MAX_BYTES, CHAT_IMAGE_ACCEPT } from "@/lib/chat.types";

const MAX_DIMENSION = 1600;
const ALLOWED = new Set(CHAT_IMAGE_ACCEPT.split(","));

export function validateChatImageFile(file: File): string | null {
  if (!ALLOWED.has(file.type)) {
    return "รองรับเฉพาะ JPG, PNG, WebP";
  }
  if (file.size > 12 * 1024 * 1024) {
    return "ไฟล์ใหญ่เกิน 12MB";
  }
  return null;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("โหลดรูปไม่สำเร็จ"));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("บีบอัดรูปไม่สำเร็จ"));
      },
      "image/webp",
      quality,
    );
  });
}

export async function compressChatImage(file: File): Promise<{
  file: File;
  width: number;
  height: number;
}> {
  const validation = validateChatImageFile(file);
  if (validation) throw new Error(validation);

  if (file.type === "image/webp" && file.size <= CHAT_IMAGE_MAX_BYTES) {
    const dims = await readImageDimensions(file);
    return { file, ...dims };
  }

  const img = await loadImage(file);
  let { width, height } = img;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("บีบอัดรูปไม่สำเร็จ");
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.82;
  let blob = await canvasToBlob(canvas, quality);
  while (blob.size > CHAT_IMAGE_MAX_BYTES && quality > 0.45) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, quality);
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "chat-image";
  const compressed = new File([blob], `${baseName}.webp`, {
    type: "image/webp",
  });

  return { file: compressed, width, height };
}

async function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  const img = await loadImage(file);
  return { width: img.naturalWidth, height: img.naturalHeight };
}

export function validateChatPdfFile(file: File): string | null {
  if (file.type !== "application/pdf") {
    return "รองรับเฉพาะไฟล์ PDF";
  }
  if (file.size > 5 * 1024 * 1024) {
    return "ไฟล์ PDF ใหญ่เกิน 5MB";
  }
  return null;
}
