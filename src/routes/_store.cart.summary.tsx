import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, PackageCheck, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { QuotationPreviewDialog } from "@/components/cart/quotation-preview-dialog";
import { PageLoading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import {
  applyCartCoupon,
  fetchAccountAddresses,
  fetchAccountProfile,
  fetchTaxInvoiceProfiles,
  requestQuotationFromCart,
} from "@/lib/api.functions";
import {
  calcSelectedQty,
  calcSelectedSubtotal,
  filterCartItems,
  parseItemIds,
  proportionalDiscount,
  serializeItemIds,
} from "@/lib/cart-selection";
import { getOrCreateCartSessionId } from "@/lib/cart-session";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatPrice } from "@/lib/format";
import type { QuotationBuyerInput } from "@/types/api/quotations";

const summarySearchSchema = z.object({
  items: z.string().min(1),
});

export const Route = createFileRoute("/_store/cart/summary")({
  validateSearch: summarySearchSchema,
  component: CartSummaryPage,
});

function CartSummaryPage() {
  const { session, user } = useAuth();
  const { cart, loading, refresh } = useCart();
  const navigate = useNavigate();
  const { items: itemsParam } = Route.useSearch();
  const selectedIds = useMemo(() => parseItemIds(itemsParam), [itemsParam]);
  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [profileBuyer, setProfileBuyer] = useState<
    Partial<QuotationBuyerInput>
  >({});
  const [profileLoading, setProfileLoading] = useState(false);

  const selectedItems = useMemo(
    () => filterCartItems(cart.items, selectedIds),
    [cart.items, selectedIds],
  );
  const selectedSubtotal = calcSelectedSubtotal(selectedItems);
  const selectedQty = calcSelectedQty(selectedItems);
  const selectedDiscount = proportionalDiscount(
    cart.subtotal,
    cart.discount,
    selectedSubtotal,
  );
  const payableTotal = Math.max(0, selectedSubtotal - selectedDiscount);

  useEffect(() => {
    if (!session || !quoteDialogOpen) return;
    setProfileLoading(true);
    const opts = authServerFnOptions(session);
    void Promise.all([
      fetchAccountProfile(opts),
      fetchAccountAddresses(opts),
      fetchTaxInvoiceProfiles(opts),
    ])
      .then(([profile, addresses, taxProfiles]) => {
        const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
        const tax = taxProfiles.find((t) => t.isDefault) ?? taxProfiles[0];
        setProfileBuyer({
          customerName: profile.fullName ?? "",
          customerPhone: profile.phone ?? defaultAddr?.phone ?? "",
          customerEmail: profile.email ?? user?.email ?? "",
          customerType: profile.customerType ?? "individual",
          taxId: tax?.taxId ?? profile.companyTaxId ?? profile.nationalId ?? "",
          companyName: tax?.companyName ?? "",
          companyBranch: tax?.branchCode ?? profile.companyBranch ?? "",
          line1: defaultAddr?.line1 ?? tax?.address ?? "",
          district: defaultAddr?.district ?? "",
          province: defaultAddr?.province ?? "",
          postalCode: defaultAddr?.postalCode ?? "",
        });
      })
      .finally(() => setProfileLoading(false));
  }, [session, quoteDialogOpen, user?.email]);

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setApplying(true);
    try {
      await applyCartCoupon({
        data: { code: couponCode, sessionId: getOrCreateCartSessionId() },
        ...authServerFnOptions(session),
      });
      await refresh();
      toast.success("ใช้คูปองแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "คูปองไม่ถูกต้อง");
    } finally {
      setApplying(false);
    }
  }

  function openQuoteDialog() {
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบ");
      return;
    }
    setQuoteDialogOpen(true);
  }

  async function handleSubmitQuote(buyer: QuotationBuyerInput) {
    setQuoting(true);
    try {
      await requestQuotationFromCart({
        data: {
          sessionId: getOrCreateCartSessionId(),
          itemIds: selectedIds,
          buyer,
        },
        ...authServerFnOptions(session),
      });
      toast.success("ส่งคำขอใบเสนอราคาแล้ว — ทีมขายจะติดต่อกลับ");
      setQuoteDialogOpen(false);
      void navigate({ to: "/account/quotations" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setQuoting(false);
    }
  }

  function handleCheckout() {
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบ");
      void navigate({ to: "/login" });
      return;
    }
    void navigate({
      to: "/checkout",
      search: { items: serializeItemIds(selectedIds) },
    });
  }

  if (loading) {
    return <PageLoading variant="cart" />;
  }

  if (!selectedItems.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
          <Link to="/cart">
            <ArrowLeft className="size-4" />
            กลับตะกร้า
          </Link>
        </Button>
        <Card className="border-dashed">
          <CardContent className="space-y-4 p-8 text-center">
            <p className="text-muted-foreground">ไม่พบรายการที่เลือก</p>
            <Button asChild>
              <Link to="/cart">กลับไปเลือกสินค้า</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-8 sm:px-6">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link to="/cart">
          <ArrowLeft className="size-4" />
          กลับตะกร้า
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">สรุปคำสั่งซื้อ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ตรวจสอบรายการที่เลือก {selectedQty} ชิ้น ก่อนชำระเงิน
        </p>
      </div>

      <div className="space-y-3">
        {selectedItems.map((item) => (
          <Card key={item.id} className="border-muted/80 shadow-sm">
            <CardContent className="flex gap-3 p-4">
              <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <PackageCheck className="size-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      x{item.qty} · {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-bold">{formatPrice(item.lineTotal)}</p>
                </div>
                {item.optionSummary ? (
                  <p className="mt-2 text-xs text-primary">
                    {item.optionSummary}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="รหัสคูปอง"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={applying}
              onClick={() => void handleApplyCoupon()}
            >
              {applying ? "กำลังใช้..." : "ใช้"}
            </Button>
          </div>
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ยอดสินค้าที่เลือก</span>
              <span>{formatPrice(selectedSubtotal)}</span>
            </div>
            {selectedDiscount > 0 ? (
              <div className="flex justify-between text-green-600">
                <span>ส่วนลด</span>
                <span>-{formatPrice(selectedDiscount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-base font-bold">
              <span>รวมสุทธิ</span>
              <span className="text-accent">{formatPrice(payableTotal)}</span>
            </div>
          </div>
          <Button
            className="w-full bg-accent hover:bg-accent/90"
            size="lg"
            onClick={handleCheckout}
          >
            ชำระเงิน
            <ArrowRight className="size-4" />
          </Button>
          {user ? (
            <Button
              className="w-full"
              size="lg"
              variant="outline"
              disabled={quoting}
              onClick={openQuoteDialog}
            >
              ขอใบเสนอราคา
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <QuotationPreviewDialog
        open={quoteDialogOpen}
        onOpenChange={setQuoteDialogOpen}
        items={selectedItems}
        subtotal={selectedSubtotal}
        discount={selectedDiscount}
        grandTotal={payableTotal}
        profileBuyer={profileBuyer}
        profileLoading={profileLoading}
        submitting={quoting}
        onSubmit={(buyer) => void handleSubmitQuote(buyer)}
      />
    </div>
  );
}
