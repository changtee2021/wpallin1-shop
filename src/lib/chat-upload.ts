import type { ChatAttachment } from "@/lib/chat.types";
import {
  compressChatImage,
  validateChatPdfFile,
  validateChatImageFile,
} from "@/lib/chat-image-compress";

const ENDPOINT = "/api/v1/chat-attachment";

export type ChatUploadInput = {
  file: File;
  conversationId: string;
  guestSessionId?: string;
  accessToken?: string | null;
  onProgress?: (percent: number) => void;
};

export async function uploadChatAttachment(
  input: ChatUploadInput,
): Promise<ChatAttachment> {
  const isPdf = input.file.type === "application/pdf";
  let file = input.file;
  let width: number | undefined;
  let height: number | undefined;

  if (isPdf) {
    const err = validateChatPdfFile(file);
    if (err) throw new Error(err);
  } else {
    const err = validateChatImageFile(file);
    if (err) throw new Error(err);
    const compressed = await compressChatImage(file);
    file = compressed.file;
    width = compressed.width;
    height = compressed.height;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("conversationId", input.conversationId);
  if (input.guestSessionId) {
    formData.append("guestSessionId", input.guestSessionId);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", ENDPOINT);
    if (input.accessToken) {
      xhr.setRequestHeader("Authorization", `Bearer ${input.accessToken}`);
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !input.onProgress) return;
      input.onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      let json: {
        attachment?: ChatAttachment;
        error?: string;
      } = {};
      try {
        json = JSON.parse(xhr.responseText) as typeof json;
      } catch {
        reject(new Error("อัปโหลดไม่สำเร็จ"));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300 && json.attachment) {
        resolve({
          ...json.attachment,
          width: json.attachment.width ?? width ?? null,
          height: json.attachment.height ?? height ?? null,
        });
        return;
      }
      reject(new Error(json.error ?? "อัปโหลดไม่สำเร็จ"));
    };

    xhr.onerror = () => reject(new Error("อัปโหลดไม่สำเร็จ"));
    xhr.send(formData);
  });
}
