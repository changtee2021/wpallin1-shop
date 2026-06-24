const MAX_PDF_MB = 50;
const WARN_PDF_MB = 25;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function pdfSizeHint(bytes: number): {
  level: "ok" | "warn" | "error";
  message: string;
} {
  const mb = bytes / 1024 / 1024;
  if (mb > MAX_PDF_MB) {
    return {
      level: "error",
      message: `ไฟล์ ${formatFileSize(bytes)} ใหญ่เกิน ${MAX_PDF_MB}MB — บีบอัดก่อนอัปโหลด: npm run media:compress -- "<path-to-pdf>" (ดู docs/MEDIA-COMPRESS.md)`,
    };
  }
  if (mb > WARN_PDF_MB) {
    return {
      level: "warn",
      message: `ไฟล์ ${formatFileSize(bytes)} ค่อนข้างใหญ่ แนะนำบีบอัดก่อน (เป้าหมาย < ${WARN_PDF_MB}MB)`,
    };
  }
  return {
    level: "ok",
    message: `ขนาด ${formatFileSize(bytes)} — พร้อมอัปโหลด`,
  };
}

export function uploadCatalogAsset(
  file: File,
  kind: "cover" | "pdf",
  accessToken: string,
  onProgress?: (percent: number) => void,
  catalogId?: string,
): Promise<{ fileUrl: string; fileSize: number; storagePath?: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);
    if (kind === "pdf" && catalogId) {
      formData.append("catalogId", catalogId);
    }

    xhr.open("POST", "/api/v1/catalog-asset");
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      let json: {
        fileUrl?: string;
        fileSize?: number;
        storagePath?: string;
        error?: string;
      } = {};
      try {
        json = JSON.parse(xhr.responseText) as typeof json;
      } catch {
        reject(new Error("อัปโหลดไม่สำเร็จ"));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300 && json.fileUrl) {
        resolve({
          fileUrl: json.fileUrl,
          fileSize: json.fileSize ?? file.size,
          storagePath: json.storagePath,
        });
        return;
      }
      reject(new Error(json.error ?? "อัปโหลดไม่สำเร็จ"));
    };

    xhr.onerror = () => reject(new Error("อัปโหลดไม่สำเร็จ"));
    xhr.send(formData);
  });
}

export async function renderPdfCoverBlob(
  file: File,
  scale = 1.2,
): Promise<Blob> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data, isEvalSupported: false });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas not supported");

  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: context, viewport, canvas }).promise;
  page.cleanup();
  await loadingTask.destroy().catch(() => undefined);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("สร้างปกไม่สำเร็จ"))),
      "image/jpeg",
      0.88,
    );
  });
}
