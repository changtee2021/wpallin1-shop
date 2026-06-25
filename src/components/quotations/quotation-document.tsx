import { formatDate, formatPrice } from "@/lib/format";
import type { QuotationDto } from "@/types/api/quotations";

function value(v: string | number | null | undefined): string {
  if (v == null || v === "") return "-";
  return String(v);
}

function formatAddress(quote: QuotationDto): string {
  const addr = quote.metadata?.address;
  if (!addr?.line1) return "-";
  return [addr.line1, addr.district, addr.province, addr.postalCode]
    .filter(Boolean)
    .join(" ");
}

function customerDisplayName(quote: QuotationDto): string {
  const meta = quote.metadata;
  if (meta?.customerType === "juristic" && meta.companyName) {
    const branch = meta.companyBranch ? ` (${meta.companyBranch})` : "";
    return `${meta.companyName}${branch}`;
  }
  return quote.customerName ?? "-";
}

const statusLabels: Record<string, string> = {
  draft: "ร่าง",
  sent: "ส่งแล้ว",
  accepted: "ยอมรับแล้ว",
  rejected: "ปฏิเสธ",
  expired: "หมดอายุ",
  converted: "แปลงเป็นออเดอร์",
};

type QuotationDocumentProps = {
  quote: QuotationDto;
  showStatus?: boolean;
};

export function QuotationDocument({
  quote,
  showStatus = true,
}: QuotationDocumentProps) {
  const meta = quote.metadata ?? {};
  const items = quote.items ?? [];
  const vatAmount = quote.taxAmount ?? 0;

  return (
    <article
      id="quotation-document"
      className="mx-auto min-h-[1123px] w-full max-w-[794px] bg-white p-10 text-slate-950 shadow-sm print:shadow-none"
    >
      <header className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-6">
        <div>
          <p className="text-sm font-semibold tracking-[0.28em] text-slate-500">
            WP ALL IN 1
          </p>
          <h1 className="mt-2 text-3xl font-bold">ใบเสนอราคา</h1>
          <p className="text-lg font-semibold text-slate-600">QUOTATION</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            เอกสารนี้ออกโดย WP ALL IN 1 Shop
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4 text-right text-sm">
          <p className="text-slate-500">เลขที่เอกสาร</p>
          <p className="text-xl font-bold">{quote.quotationNumber}</p>
          {showStatus ? (
            <p className="mt-2 text-slate-600">
              สถานะ: {statusLabels[quote.status] ?? quote.status}
            </p>
          ) : null}
          <p className="mt-2">วันที่ออก: {formatDate(quote.createdAt)}</p>
          {quote.validUntil ? <p>ใช้ได้ถึง: {quote.validUntil}</p> : null}
        </div>
      </header>

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <h2 className="text-sm font-bold text-slate-500">
            ลูกค้า / Customer
          </h2>
          <p className="mt-2 text-lg font-semibold">
            {customerDisplayName(quote)}
          </p>
          {meta.customerType === "juristic" ? (
            <p className="text-sm text-slate-600">
              เลขผู้เสียภาษี: {value(meta.taxId)}
            </p>
          ) : meta.taxId ? (
            <p className="text-sm text-slate-600">
              เลขประจำตัว: {value(meta.taxId)}
            </p>
          ) : null}
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {formatAddress(quote)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <h2 className="text-sm font-bold text-slate-500">
            ผู้ติดต่อ / Contact
          </h2>
          <p className="mt-2 text-sm">โทร: {value(quote.customerPhone)}</p>
          <p className="text-sm">อีเมล: {value(quote.customerEmail)}</p>
          {quote.note ? (
            <p className="mt-3 text-sm text-slate-600">
              หมายเหตุลูกค้า: {quote.note}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-8">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="w-12 p-3 text-left">#</th>
              <th className="p-3 text-left">รายการ</th>
              <th className="w-24 p-3 text-right">ราคา/หน่วย</th>
              <th className="w-20 p-3 text-right">จำนวน</th>
              <th className="w-32 p-3 text-right">ยอดรวม</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id ?? idx} className="border-b border-slate-200">
                <td className="p-3 align-top">{idx + 1}</td>
                <td className="p-3 align-top">
                  <p className="font-medium">{item.productName}</p>
                  {item.optionSummary ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {item.optionSummary}
                    </p>
                  ) : null}
                </td>
                <td className="p-3 text-right align-top">
                  {formatPrice(item.unitPrice)}
                </td>
                <td className="p-3 text-right align-top">{item.qty}</td>
                <td className="p-3 text-right align-top font-medium">
                  {formatPrice(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8 grid gap-6 sm:grid-cols-[1fr_280px]">
        <div className="space-y-4 text-sm leading-6">
          {meta.customerNote ? (
            <div>
              <h3 className="font-bold">หมายเหตุถึงลูกค้า</h3>
              <p className="whitespace-pre-wrap text-slate-700">
                {meta.customerNote}
              </p>
            </div>
          ) : null}
          <div>
            <h3 className="font-bold">เงื่อนไขการชำระเงิน</h3>
            <p className="whitespace-pre-wrap text-slate-700">
              {meta.paymentTerms ?? "-"}
            </p>
          </div>
          <div>
            <h3 className="font-bold">เงื่อนไขการจัดส่ง</h3>
            <p className="whitespace-pre-wrap text-slate-700">
              {meta.deliveryTerms ?? "-"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between py-2">
            <span>Subtotal</span>
            <span>{formatPrice(quote.subtotal)}</span>
          </div>
          {quote.discount > 0 ? (
            <div className="flex justify-between py-2">
              <span>Discount</span>
              <span>-{formatPrice(quote.discount)}</span>
            </div>
          ) : null}
          {vatAmount > 0 ? (
            <div className="flex justify-between py-2">
              <span>VAT 7%</span>
              <span>{formatPrice(vatAmount)}</span>
            </div>
          ) : null}
          <div className="mt-2 flex justify-between border-t border-slate-300 pt-4 text-lg font-bold">
            <span>Grand Total</span>
            <span>{formatPrice(quote.grandTotal)}</span>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-10 text-sm sm:grid-cols-2">
        <div className="border-t border-slate-400 pt-3 text-center">
          ผู้เสนอราคา / Sales
        </div>
        <div className="border-t border-slate-400 pt-3 text-center">
          ลูกค้ายืนยัน / Customer
        </div>
      </section>
    </article>
  );
}

export { statusLabels as quotationStatusLabels };
