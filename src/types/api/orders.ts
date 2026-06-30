export type OrderStatus =
  | "pending_payment"
  | "awaiting_payment_verification"
  | "paid"
  | "confirmed"
  | "shipped"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "unpaid"
  | "awaiting_verification"
  | "paid"
  | "failed";

export type OrderSummaryDto = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  grandTotal: number;
  createdAt: string;
};

export type OrderItemDto = {
  id: string;
  productId: string | null;
  productName: string;
  sku: string | null;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type BankAccountDto = {
  bank: string;
  account_no: string;
  account_name: string;
};

export type OrderStatusHistoryDto = {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
};

export type ProductionStepDto = {
  id: string;
  stepName: string;
  status: string;
  sortOrder: number;
};

export type OrderDetailDto = OrderSummaryDto & {
  subtotal: number;
  shippingFee: number;
  discount: number;
  customerName: string | null;
  customerPhone: string | null;
  shippingAddress: Record<string, unknown> | null;
  items: OrderItemDto[];
  bankAccounts: BankAccountDto[];
  paymentId: string | null;
  statusHistory: OrderStatusHistoryDto[];
  productionSteps: ProductionStepDto[];
};

export type AdminOrderSummaryDto = OrderSummaryDto & {
  customerName: string | null;
};

export type AdminOrderDetailDto = Omit<
  OrderDetailDto,
  "bankAccounts" | "paymentId" | "productionSteps"
> & {
  userId: string;
  customerEmail: string | null;
  payment: {
    id: string;
    method: string;
    status: string;
    amount: number;
  } | null;
  slips: Array<{
    id: string;
    uploadedAt: string;
    verified: boolean;
    signedUrl: string | null;
  }>;
  statusHistory: OrderStatusHistoryDto[];
  metadata: Record<string, unknown> | null;
  placedByUserId: string | null;
  placedByName: string | null;
};

export type CheckoutInput = {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  note?: string;
  paymentMethod?: "bank_transfer" | "wallet" | "credit";
  affiliateCode?: string;
  itemIds?: string[];
};

export type CheckoutResult = {
  orderId: string;
  orderNumber: string;
  grandTotal: number;
  paymentId: string;
  bankAccounts: Array<{
    bank: string;
    account_no: string;
    account_name: string;
  }>;
};
