import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { InlineRowsSkeleton } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import {
  calcSelectedSubtotal,
  filterCartItems,
  parseItemIds,
  proportionalDiscount,
} from "@/lib/cart-selection";
import {
  checkoutOrder,
  fetchAccountAddresses,
  fetchAccountProfile,
  fetchCreditAccount,
  fetchOrderDetail,
  fetchPromptPayId,
  fetchWalletSummary,
} from "@/lib/api.functions";
import { PromptPayPanel } from "@/components/checkout/promptpay-panel";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { getAffiliateRef } from "@/lib/affiliate-cookie";
import { formatPrice } from "@/lib/format";
import type { BankAccountDto } from "@/types/api/orders";
import type { AddressDto } from "@/types/api/profile";

const checkoutSearchSchema = z.object({
  orderId: z.string().uuid().optional(),
  paymentId: z.string().uuid().optional(),
  orderNumber: z.string().optional(),
  items: z.string().optional(),
});

export const Route = createFileRoute("/_store/checkout")({
  validateSearch: checkoutSearchSchema,
  component: CheckoutPage,
});

function CheckoutPage() {
  const { session, user } = useAuth();
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const selectedIds = useMemo(() => parseItemIds(search.items), [search.items]);
  const selectedItems = useMemo(
    () => filterCartItems(cart.items, selectedIds),
    [cart.items, selectedIds],
  );
  const checkoutItems = selectedIds.length ? selectedItems : cart.items;
  const checkoutSubtotal =
    selectedIds.length > 0
      ? calcSelectedSubtotal(selectedItems)
      : cart.subtotal;
  const checkoutDiscount =
    selectedIds.length > 0
      ? proportionalDiscount(cart.subtotal, cart.discount, checkoutSubtotal)
      : cart.discount;
  const checkoutTotal = Math.max(0, checkoutSubtotal - checkoutDiscount);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "bank_transfer" | "wallet" | "credit"
  >("bank_transfer");
  const [walletBalance, setWalletBalance] = useState(0);
  const [creditAvailable, setCreditAvailable] = useState(0);
  const [hasCredit, setHasCredit] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<AddressDto[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("manual");
  const [form, setForm] = useState({
    recipientName: user?.user_metadata?.full_name ?? "",
    phone: "",
    line1: "",
    district: "",
    province: "",
    postalCode: "",
    note: "",
  });

  function applyAddress(addr: AddressDto) {
    setForm((prev) => ({
      recipientName: addr.recipientName ?? "",
      phone: addr.phone ?? "",
      line1: addr.line1,
      district: addr.district ?? "",
      province: addr.province ?? "",
      postalCode: addr.postalCode ?? "",
      note: prev.note,
    }));
  }

  useEffect(() => {
    if (!session) return;
    const opts = authServerFnOptions(session);
    void fetchWalletSummary(opts).then((w) =>
      setWalletBalance(w.availableBalance),
    );
    void fetchCreditAccount(opts).then((acct) => {
      if (acct && acct.status === "active") {
        setHasCredit(true);
        setCreditAvailable(acct.availableCredit);
      }
    });
    void Promise.all([
      fetchAccountAddresses(opts),
      fetchAccountProfile(opts),
    ]).then(([addresses, profile]) => {
      setSavedAddresses(addresses);
      if (profile.phone && !form.phone) {
        setForm((prev) => ({ ...prev, phone: profile.phone ?? "" }));
      }
      const defaultAddr =
        addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        applyAddress(defaultAddr);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once per session
  }, [session]);

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <p className="mb-4">กรุณาเข้าสู่ระบบก่อนชำระเงิน</p>
        <Button asChild>
          <Link to="/login">เข้าสู่ระบบ</Link>
        </Button>
      </div>
    );
  }

  if (search.orderId && search.paymentId) {
    return (
      <OrderSuccess
        orderId={search.orderId}
        paymentId={search.paymentId}
        orderNumber={search.orderNumber ?? ""}
        sessionToken={session?.access_token}
        session={session}
        uploading={uploading}
        setUploading={setUploading}
      />
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await checkoutOrder({
        data: {
          ...form,
          paymentMethod,
          affiliateCode: getAffiliateRef() ?? undefined,
          itemIds: selectedIds.length ? selectedIds : undefined,
        },
        ...authServerFnOptions(session),
      });
      await refresh();
      if (paymentMethod === "credit") {
        toast.success("ส่งคำขอชำระเครดิตแล้ว รอแอดมินอนุมัติ");
        void navigate({
          to: "/account/orders/$orderId",
          params: { orderId: result.orderId },
        });
        return;
      }

      if (paymentMethod === "wallet") {
        void navigate({
          to: "/account/orders/$orderId",
          params: { orderId: result.orderId },
        });
      } else {
        void navigate({
          to: "/checkout",
          search: {
            orderId: result.orderId,
            paymentId: result.paymentId,
            orderNumber: result.orderNumber,
          },
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "สั่งซื้อไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">ชำระเงิน</h1>
      {checkoutItems.length > 0 ? (
        <Card className="mb-6">
          <CardContent className="space-y-2 p-4">
            <h2 className="font-semibold">รายการที่สั่ง</h2>
            {checkoutItems.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">
                  {item.productName} x{item.qty}
                </span>
                <span className="shrink-0 font-medium">
                  {formatPrice(item.lineTotal)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="font-semibold">ที่อยู่จัดส่ง</h2>
            {savedAddresses.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="saved-address">เลือกที่อยู่ที่บันทึกไว้</Label>
                <Select
                  value={selectedAddressId}
                  onValueChange={(value) => {
                    setSelectedAddressId(value);
                    if (value === "manual") return;
                    const addr = savedAddresses.find((a) => a.id === value);
                    if (addr) applyAddress(addr);
                  }}
                >
                  <SelectTrigger id="saved-address">
                    <SelectValue placeholder="เลือกที่อยู่" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedAddresses.map((addr) => (
                      <SelectItem key={addr.id} value={addr.id}>
                        {(addr.label ?? addr.recipientName ?? "ที่อยู่") +
                          (addr.isDefault ? " (หลัก)" : "")}
                      </SelectItem>
                    ))}
                    <SelectItem value="manual">กรอกที่อยู่ใหม่</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">ชื่อผู้รับ</Label>
                <Input
                  id="name"
                  required
                  value={form.recipientName}
                  onChange={(e) => {
                    setSelectedAddressId("manual");
                    setForm({ ...form, recipientName: e.target.value });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="phone">เบอร์โทร</Label>
                <Input
                  id="phone"
                  required
                  value={form.phone}
                  onChange={(e) => {
                    setSelectedAddressId("manual");
                    setForm({ ...form, phone: e.target.value });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="postal">รหัสไปรษณีย์</Label>
                <Input
                  id="postal"
                  value={form.postalCode}
                  onChange={(e) => {
                    setSelectedAddressId("manual");
                    setForm({ ...form, postalCode: e.target.value });
                  }}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="line1">ที่อยู่</Label>
                <Input
                  id="line1"
                  required
                  value={form.line1}
                  onChange={(e) => {
                    setSelectedAddressId("manual");
                    setForm({ ...form, line1: e.target.value });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="district">เขต/อำเภอ</Label>
                <Input
                  id="district"
                  value={form.district}
                  onChange={(e) => {
                    setSelectedAddressId("manual");
                    setForm({ ...form, district: e.target.value });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="province">จังหวัด</Label>
                <Input
                  id="province"
                  value={form.province}
                  onChange={(e) => {
                    setSelectedAddressId("manual");
                    setForm({ ...form, province: e.target.value });
                  }}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="note">หมายเหตุ</Label>
                <Textarea
                  id="note"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="font-semibold">วิธีชำระเงิน</h2>
            <Select
              value={paymentMethod}
              onValueChange={(v) =>
                setPaymentMethod(v as "bank_transfer" | "wallet" | "credit")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">โอนเงิน</SelectItem>
                <SelectItem value="wallet">
                  กระเป๋าเงิน (ยอด {formatPrice(walletBalance)})
                </SelectItem>
                {hasCredit && (
                  <SelectItem value="credit">
                    เครดิต/วางบิล (คงเหลือ {formatPrice(creditAvailable)})
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {paymentMethod === "credit" && (
              <p className="text-xs text-muted-foreground">
                ออเดอร์จะรอแอดมินอนุมัติก่อนดำเนินการ
              </p>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>ยอดชำระ</span>
              <span className="text-accent">{formatPrice(checkoutTotal)}</span>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90"
          size="lg"
          disabled={submitting || !checkoutItems.length}
        >
          {submitting ? "กำลังสั่งซื้อ..." : "ยืนยันคำสั่งซื้อ"}
        </Button>
      </form>
    </div>
  );
}

function OrderSuccess({
  orderId,
  paymentId,
  orderNumber,
  sessionToken,
  session,
  uploading,
  setUploading,
}: {
  orderId: string;
  paymentId: string;
  orderNumber: string;
  sessionToken?: string;
  session: ReturnType<typeof useAuth>["session"];
  uploading: boolean;
  setUploading: (v: boolean) => void;
}) {
  const [bankAccounts, setBankAccounts] = useState<BankAccountDto[]>([]);
  const [promptPayId, setPromptPayId] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);

  useEffect(() => {
    void Promise.all([
      fetchOrderDetail({
        data: { orderId },
        ...authServerFnOptions(session),
      }),
      fetchPromptPayId(),
    ]).then(([detail, pp]) => {
      if (detail?.bankAccounts) setBankAccounts(detail.bankAccounts);
      if (detail?.grandTotal) setOrderTotal(detail.grandTotal);
      setPromptPayId(pp.promptPayId);
    });
  }, [orderId, session]);
  async function handleSlipUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !sessionToken) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("paymentId", paymentId);
      form.append("orderId", orderId);
      const res = await fetch("/api/v1/payment-slip", {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionToken}` },
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      toast.success("อัปโหลดสลิปแล้ว — รอตรวจสอบ");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <Card>
        <CardContent className="space-y-4 p-6 text-center">
          <h1 className="text-2xl font-bold text-primary">สั่งซื้อสำเร็จ</h1>
          <p>
            เลขที่คำสั่งซื้อ: <strong>{orderNumber}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            โอนเงินตามบัญชีที่แจ้งในอีเมล/หน้าคำสั่งซื้อ แล้วอัปโหลดสลิปด้านล่าง
          </p>
          <div className="rounded-lg border bg-muted/30 p-4 text-left text-sm">
            <p className="mb-2 font-medium">บัญชีโอน</p>
            {bankAccounts.length === 0 ? (
              <InlineRowsSkeleton rows={2} />
            ) : (
              bankAccounts.map((b) => (
                <div key={b.account_no} className="mb-2 last:mb-0">
                  <p>{b.bank}</p>
                  <p className="font-mono">{b.account_no}</p>
                  <p>{b.account_name}</p>
                </div>
              ))
            )}
          </div>
          {promptPayId && orderTotal > 0 ? (
            <PromptPayPanel promptPayId={promptPayId} amount={orderTotal} />
          ) : null}
          <div>
            <Label htmlFor="slip">อัปโหลดสลิปโอนเงิน</Label>
            <Input
              id="slip"
              type="file"
              accept="image/*"
              className="mt-2"
              disabled={uploading}
              onChange={(e) => void handleSlipUpload(e)}
            />
          </div>
          <Button asChild variant="outline">
            <Link to="/account/orders">ดูคำสั่งซื้อ</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
