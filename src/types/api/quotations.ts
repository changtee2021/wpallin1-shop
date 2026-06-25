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
  optionSummary?: string | null;
};

export type QuotationAddress = {
  line1: string;
  district?: string | null;
  province?: string | null;
  postalCode?: string | null;
};

export type QuotationMetadata = {
  source?: string;
  publicToken?: string;
  customerType?: "individual" | "juristic";
  taxId?: string | null;
  companyName?: string | null;
  companyBranch?: string | null;
  address?: QuotationAddress;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  customerNote?: string | null;
};

export type QuotationBuyerInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerType: "individual" | "juristic";
  taxId?: string;
  companyName?: string;
  companyBranch?: string;
  line1: string;
  district?: string;
  province?: string;
  postalCode?: string;
  note?: string;
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
  taxAmount?: number;
  grandTotal: number;
  note: string | null;
  createdAt: string;
  metadata?: QuotationMetadata;
  items?: QuotationItemDto[];
};
