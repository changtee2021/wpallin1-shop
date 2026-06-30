const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_MB = 5;

export function validateRoomAdvisorPhoto(file: File): string | null {
  if (!file.type.startsWith("image/")) return "รับเฉพาะไฟล์รูปภาพ";
  if (file.size > MAX_MB * 1024 * 1024) return `ไฟล์ต้องไม่เกิน ${MAX_MB}MB`;
  return null;
}

export async function uploadRoomAdvisorPhoto(
  file: File,
  guestSessionId: string,
  accessToken?: string | null,
): Promise<{ publicUrl: string; storagePath: string }> {
  const err = validateRoomAdvisorPhoto(file);
  if (err) throw new Error(err);

  const form = new FormData();
  form.append("file", file);
  form.append("guestSessionId", guestSessionId);

  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch("/api/v1/room-advisor-photo", {
    method: "POST",
    headers,
    body: form,
  });

  const json = (await res.json()) as {
    ok?: boolean;
    publicUrl?: string;
    storagePath?: string;
    error?: string;
  };

  if (!res.ok || !json.publicUrl || !json.storagePath) {
    throw new Error(json.error ?? "อัปโหลดรูปไม่สำเร็จ");
  }

  return { publicUrl: json.publicUrl, storagePath: json.storagePath };
}

export const ROOM_ADVISOR_PHOTO_ACCEPT = ACCEPT;
export const ROOM_ADVISOR_PHOTO_MAX_MB = MAX_MB;
