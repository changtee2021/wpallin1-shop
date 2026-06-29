import {
  ADMIN_IMAGE_ACCEPT,
  ADMIN_IMAGE_MAX_MB,
  uploadAdminImage,
  validateAdminImageFile,
} from "@/lib/admin-image-upload";

const INSPIRATION_IMAGE_ENDPOINT = "/api/v1/inspiration-image";

export function uploadInspirationImage(
  file: File,
  accessToken: string,
  onProgress?: (percent: number) => void,
): Promise<{ fileUrl: string }> {
  return uploadAdminImage(
    file,
    INSPIRATION_IMAGE_ENDPOINT,
    accessToken,
    onProgress,
  );
}

export const INSPIRATION_IMAGE_ACCEPT = ADMIN_IMAGE_ACCEPT;
export const INSPIRATION_IMAGE_MAX_MB = ADMIN_IMAGE_MAX_MB;

export function validateInspirationImageFile(file: File): string | null {
  return validateAdminImageFile(file);
}
