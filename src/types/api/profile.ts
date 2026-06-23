export type HealthDto = {
  ok: boolean;
  service: string;
  schema: string;
  timestamp: string;
};

export type SessionProfileDto = {
  userId: string;
  email: string | null;
  fullName: string | null;
  roles: string[];
  memberTier: string | null;
  accountStatus: string | null;
};

export type AccountProfileDto = {
  userId: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  locale: string;
  memberTier: string | null;
  accountStatus: string | null;
  orderCount: number;
  totalSpent: number;
  roles: string[];
};

export type AddressDto = {
  id: string;
  label: string | null;
  recipientName: string | null;
  phone: string | null;
  line1: string;
  line2: string | null;
  district: string | null;
  province: string | null;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
};

export type TaxInvoiceProfileDto = {
  id: string;
  companyName: string;
  taxId: string;
  branchCode: string | null;
  address: string;
  email: string | null;
  phone: string | null;
  isDefault: boolean;
};

export type UpdateAccountProfileInput = {
  fullName: string;
  phone?: string;
  locale?: "th" | "en";
};

export type AppRole =
  | "retail_customer"
  | "dealer"
  | "affiliate"
  | "sales_staff"
  | "admin"
  | "super_admin";

export const ADMIN_ROLES: AppRole[] = ["admin", "super_admin"];
export const DEALER_ROLES: AppRole[] = ["dealer", "admin", "super_admin"];

export function hasAnyRole(userRoles: string[], allowed: AppRole[]): boolean {
  return allowed.some((role) => userRoles.includes(role));
}
