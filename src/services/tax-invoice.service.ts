import type { SupabaseClient } from "@supabase/supabase-js";

export const TAX_INVOICE_BUCKET = "wpall-retail-tax-invoices";

export type OrderTaxInvoiceStatus = "pending" | "issued" | "void";

export type OrderTaxInvoiceDto = {
  id: string;
  orderId: string;
  orderNumber: string;
  invoiceNumber: string;
  invoiceDate: string;
  grandTotal: number;
  status: OrderTaxInvoiceStatus;
  fileName: string | null;
  issuedAt: string;
  hasFile: boolean;
};

export type OrderTaxInvoiceOverviewDto = {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  orderTotal: number;
  invoice: OrderTaxInvoiceDto | null;
};

const PAID_PAYMENT_STATUSES = new Set(["paid", "partially_paid"]);
const PAID_ORDER_STATUSES = new Set([
  "paid",
  "confirmed",
  "shipped",
  "completed",
]);

export function isOrderEligibleForTaxInvoice(
  paymentStatus: string,
  status: string,
): boolean {
  return (
    PAID_PAYMENT_STATUSES.has(paymentStatus) || PAID_ORDER_STATUSES.has(status)
  );
}

function mapInvoice(
  row: {
    id: string;
    order_id: string;
    invoice_number: string;
    invoice_date: string;
    grand_total: number;
    status: string;
    file_name: string | null;
    file_path: string;
    issued_at: string;
  },
  orderNumber: string,
): OrderTaxInvoiceDto {
  return {
    id: row.id,
    orderId: row.order_id,
    orderNumber,
    invoiceNumber: row.invoice_number,
    invoiceDate: row.invoice_date,
    grandTotal: Number(row.grand_total),
    status: row.status as OrderTaxInvoiceStatus,
    fileName: row.file_name,
    issuedAt: row.issued_at,
    hasFile: Boolean(row.file_path),
  };
}

export async function listUserTaxInvoiceOverview(
  supabase: SupabaseClient,
  userId: string,
): Promise<OrderTaxInvoiceOverviewDto[]> {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, order_number, grand_total, payment_status, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (ordersError) throw new Error(ordersError.message);

  const eligible = (orders ?? []).filter((order) =>
    isOrderEligibleForTaxInvoice(order.payment_status, order.status),
  );
  if (eligible.length === 0) return [];

  const orderIds = eligible.map((order) => order.id);
  const { data: invoices, error: invoicesError } = await supabase
    .from("order_tax_invoices")
    .select(
      "id, order_id, invoice_number, invoice_date, grand_total, status, file_name, file_path, issued_at",
    )
    .eq("user_id", userId)
    .in("order_id", orderIds)
    .neq("status", "void");

  if (invoicesError) throw new Error(invoicesError.message);

  const invoiceByOrder = new Map(
    (invoices ?? []).map((invoice) => [invoice.order_id, invoice]),
  );

  return eligible.map((order) => {
    const invoiceRow = invoiceByOrder.get(order.id);
    return {
      orderId: order.id,
      orderNumber: order.order_number,
      orderDate: order.created_at,
      orderTotal: Number(order.grand_total),
      invoice: invoiceRow ? mapInvoice(invoiceRow, order.order_number) : null,
    };
  });
}

export async function getOrderTaxInvoice(
  supabase: SupabaseClient,
  userId: string,
  orderId: string,
): Promise<OrderTaxInvoiceDto | null> {
  const { data, error } = await supabase
    .from("order_tax_invoices")
    .select(
      "id, order_id, invoice_number, invoice_date, grand_total, status, file_name, file_path, issued_at",
    )
    .eq("order_id", orderId)
    .eq("user_id", userId)
    .neq("status", "void")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("order_number")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (orderError) throw new Error(orderError.message);
  if (!order) return null;

  return mapInvoice(data, order.order_number);
}

export async function getAdminOrderTaxInvoice(
  supabase: SupabaseClient,
  orderId: string,
): Promise<OrderTaxInvoiceDto | null> {
  const { data, error } = await supabase
    .from("order_tax_invoices")
    .select(
      "id, order_id, invoice_number, invoice_date, grand_total, status, file_name, file_path, issued_at",
    )
    .eq("order_id", orderId)
    .neq("status", "void")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("order_number")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) throw new Error(orderError.message);
  if (!order) return null;

  return mapInvoice(data, order.order_number);
}

export async function getTaxInvoiceDownloadUrl(
  supabase: SupabaseClient,
  invoiceId: string,
  userId: string,
): Promise<string> {
  const { data: invoice, error } = await supabase
    .from("order_tax_invoices")
    .select("id, user_id, file_path, file_name, status")
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .neq("status", "void")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!invoice?.file_path) throw new Error("ไม่พบใบกำกับภาษี");

  const { data, error: signError } = await supabase.storage
    .from(TAX_INVOICE_BUCKET)
    .createSignedUrl(invoice.file_path, 3600, {
      download: invoice.file_name ?? "tax-invoice.pdf",
    });

  if (signError || !data?.signedUrl) {
    throw new Error(signError?.message ?? "ไม่สามารถดาวน์โหลดได้");
  }

  return data.signedUrl;
}

export async function issueOrderTaxInvoice(
  supabase: SupabaseClient,
  adminUserId: string,
  input: {
    orderId: string;
    invoiceNumber: string;
    invoiceDate?: string;
    file: File;
  },
): Promise<OrderTaxInvoiceDto> {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, user_id, order_number, subtotal, tax_amount, grand_total, payment_status, status",
    )
    .eq("id", input.orderId)
    .maybeSingle();

  if (orderError) throw new Error(orderError.message);
  if (!order) throw new Error("ไม่พบคำสั่งซื้อ");
  if (!isOrderEligibleForTaxInvoice(order.payment_status, order.status)) {
    throw new Error("ออเดอร์นี้ยังไม่ชำระเงิน — ออกใบกำกับไม่ได้");
  }

  const { data: profile } = await supabase
    .from("tax_invoice_profiles")
    .select("*")
    .eq("user_id", order.user_id)
    .eq("is_default", true)
    .maybeSingle();

  const ext = input.file.name.split(".").pop()?.toLowerCase() ?? "pdf";
  const path = `${order.user_id}/${order.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(TAX_INVOICE_BUCKET)
    .upload(path, input.file, {
      upsert: true,
      contentType: input.file.type || "application/pdf",
    });

  if (uploadError) throw new Error(uploadError.message);

  const payload = {
    order_id: order.id,
    user_id: order.user_id,
    tax_invoice_profile_id: profile?.id ?? null,
    invoice_number: input.invoiceNumber.trim(),
    invoice_date: input.invoiceDate ?? new Date().toISOString().slice(0, 10),
    subtotal: Number(order.subtotal),
    vat_amount: Number(order.tax_amount),
    grand_total: Number(order.grand_total),
    buyer_snapshot: profile
      ? {
          companyName: profile.company_name,
          taxId: profile.tax_id,
          branchCode: profile.branch_code,
          address: profile.address,
          email: profile.email,
          phone: profile.phone,
        }
      : {},
    file_path: path,
    file_name: input.file.name,
    mime_type: input.file.type || "application/pdf",
    file_size: input.file.size,
    status: "issued" as const,
    issued_by: adminUserId,
    issued_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("order_tax_invoices")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();

  let row;
  if (existing) {
    const { data, error: updateError } = await supabase
      .from("order_tax_invoices")
      .update(payload)
      .eq("id", existing.id)
      .select(
        "id, order_id, invoice_number, invoice_date, grand_total, status, file_name, file_path, issued_at",
      )
      .single();
    if (updateError) throw new Error(updateError.message);
    row = data;
  } else {
    const { data, error: insertError } = await supabase
      .from("order_tax_invoices")
      .insert(payload)
      .select(
        "id, order_id, invoice_number, invoice_date, grand_total, status, file_name, file_path, issued_at",
      )
      .single();
    if (insertError) throw new Error(insertError.message);
    row = data;
  }

  return mapInvoice(row, order.order_number);
}
