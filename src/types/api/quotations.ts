export type QuotationStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired"
  | "converted";

export type QuotationItemDto = {
  id: string;
  productId: string | null;
  productName: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type QuotationDto = {
  id: string;
  quotationNumber: string;
  userId: string;
  status: QuotationStatus;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  validUntil: string | null;
  subtotal: number;
  discount: number;
  grandTotal: number;
  note: string | null;
  createdAt: string;
  items?: QuotationItemDto[];
};
