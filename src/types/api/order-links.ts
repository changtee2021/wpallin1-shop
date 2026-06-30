export type OrderLinkStatus =
  | "pending"
  | "opened"
  | "ordered"
  | "expired"
  | "cancelled";

export type OrderLinkItemDto = {
  id: string;
  productId: string | null;
  sku: string;
  productName: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderLinkDto = {
  id: string;
  token: string;
  status: OrderLinkStatus;
  customerNote: string | null;
  expiresAt: string;
  subtotal: number;
  itemCount: number;
  items: OrderLinkItemDto[];
  createdAt: string;
};

export type CreateOrderLinkInput = {
  items: Array<{
    productId: string;
    sku: string;
    productName: string;
    qty: number;
    unitPrice: number;
  }>;
  customerNote?: string;
  expiresInDays?: number;
};
