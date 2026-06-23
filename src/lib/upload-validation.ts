export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

export const UPLOAD_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export type UploadValidationError = {
  status: 413 | 415;
  message: string;
};

export function validateUploadFile(file: File): UploadValidationError | null {
  if (file.size > UPLOAD_MAX_BYTES) {
    return {
      status: 413,
      message: "File exceeds 5MB limit",
    };
  }

  if (
    !UPLOAD_ALLOWED_MIME_TYPES.includes(
      file.type as (typeof UPLOAD_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return {
      status: 415,
      message: "Unsupported file type",
    };
  }

  return null;
}

export function logUploadFailure(scope: string, err: unknown): void {
  console.error(`[${scope}] upload failed`, err);
}
