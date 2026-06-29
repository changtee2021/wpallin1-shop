import type { QuotationStatus } from "@/types/api/quotations";
import type { ProductType } from "@/types/api/products";

export type ChatMessageKind =
  | "text"
  | "image"
  | "file"
  | "product"
  | "quotation"
  | "greeting"
  | "system";

export type ChatAttachment = {
  url: string;
  thumbUrl?: string | null;
  mime: string;
  fileName: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
};

export type ChatProductCardPayload = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number;
  compareAtPrice?: number | null;
  productType?: ProductType;
};

export type ChatQuotationPayload = {
  quotationId: string;
  quotationNumber: string;
  grandTotal: number;
  validUntil: string | null;
  status: QuotationStatus;
  publicToken?: string | null;
};

export type ChatMessageMetadata = {
  kind?: ChatMessageKind;
  attachments?: ChatAttachment[];
  productCards?: ChatProductCardPayload[];
  quotation?: ChatQuotationPayload;
  mode?: string;
  referenceId?: string;
  linkedTicketId?: string;
  [key: string]: unknown;
};

export const CHAT_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const CHAT_FILE_ACCEPT =
  "image/jpeg,image/png,image/webp,application/pdf";
export const CHAT_IMAGE_MAX_BYTES = 1.2 * 1024 * 1024;
export const CHAT_FILE_MAX_BYTES = 5 * 1024 * 1024;
