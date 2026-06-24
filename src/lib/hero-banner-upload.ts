const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function uploadHeroBanner(
  file: File,
  accessToken: string,
  onProgress?: (percent: number) => void,
): Promise<{ fileUrl: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.open("POST", "/api/v1/hero-banner");
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      let json: { fileUrl?: string; error?: string } = {};
      try {
        json = JSON.parse(xhr.responseText) as typeof json;
      } catch {
        reject(new Error("อัปโหลดไม่สำเร็จ"));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300 && json.fileUrl) {
        resolve({ fileUrl: json.fileUrl });
        return;
      }
      reject(new Error(json.error ?? "อัปโหลดไม่สำเร็จ"));
    };

    xhr.onerror = () => reject(new Error("อัปโหลดไม่สำเร็จ"));
    xhr.send(formData);
  });
}

export const HERO_BANNER_ACCEPT = "image/jpeg,image/png,image/webp";
export const HERO_BANNER_MAX_MB = MAX_BYTES / 1024 / 1024;

export function validateHeroBannerFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "รองรับเฉพาะ JPG, PNG, WebP";
  }
  if (file.size > MAX_BYTES) {
    return `ไฟล์ใหญ่เกิน ${HERO_BANNER_MAX_MB}MB`;
  }
  return null;
}
