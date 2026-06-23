export type CartItemDto = {
  id: string;
  productId: string | null;
  productName: string;
  sku: string | null;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl: string | null;
  slug: string | null;
};

export type CartDto = {
  id: string;
  items: CartItemDto[];
  subtotal: number;
  discount: number;
  itemCount: number;
};
