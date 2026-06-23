import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchAdminMembers,
  fetchCustomerAddressesForStaff,
  fetchPublicProducts,
  placeAssistedOrder,
} from "@/lib/api.functions";
import { formatPrice } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { AdminMemberDto } from "@/services/tier.service";

const searchSchema = z.object({
  customerId: z.string().uuid().optional(),
});

export const Route = createFileRoute("/admin/sales-order")({
  validateSearch: searchSchema,
  component: AdminSalesOrderPage,
});

type LineItem = {
  productId: string;
  productName: string;
  sku: string | null;
  qty: number;
  unitPrice: number;
};

function AdminSalesOrderPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { customerId } = Route.useSearch();
  const authOpts = authServerFnOptions(session);

  const [step, setStep] = useState(1);
  const [members, setMembers] = useState<AdminMemberDto[]>([]);
  const [products, setProducts] = useState<
    Awaited<ReturnType<typeof fetchPublicProducts>>["data"]
  >([]);
  const [customerUserId, setCustomerUserId] = useState(customerId ?? "");
  const [lines, setLines] = useState<LineItem[]>([]);
  const [productPick, setProductPick] = useState("");
  const [qty, setQty] = useState("1");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "bank_transfer" | "wallet" | "pay_later"
  >("bank_transfer");
  const [internalNote, setInternalNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetchAdminMembers(authOpts),
      fetchPublicProducts({ data: { pageSize: 100 } }),
    ]).then(([m, p]) => {
      setMembers(m);
      setProducts(p.data);
    });
  }, [session]);

  useEffect(() => {
    if (!customerUserId) return;
    const member = members.find((m) => m.userId === customerUserId);
    if (member) {
      setRecipientName(member.fullName ?? "");
      setPhone(member.phone ?? "");
    }
    void fetchCustomerAddressesForStaff({
      data: { customerUserId },
      ...authOpts,
    }).then((addrs) => {
      const def = addrs.find((a) => a.isDefault) ?? addrs[0];
      if (def) {
        setRecipientName(def.recipientName);
        setPhone(def.phone);
        setLine1(def.line1);
      }
    });
  }, [customerUserId, members]);

  function addLine() {
    const product = products.find((p) => p.id === productPick);
    if (!product) return;
    setLines((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        qty: Number(qty) || 1,
        unitPrice: product.retailPrice,
      },
    ]);
    setProductPick("");
    setQty("1");
  }

  const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);

  async function submit() {
    if (!customerUserId || !lines.length) {
      toast.error("เลือกลูกค้าและสินค้า");
      return;
    }
    setSubmitting(true);
    try {
      const result = await placeAssistedOrder({
        data: {
          customerUserId,
          items: lines.map((l) => ({
            productId: l.productId,
            productName: l.productName,
            sku: l.sku,
            qty: l.qty,
          })),
          recipientName,
          phone,
          line1,
          paymentMethod,
          internalNote: internalNote || undefined,
        },
        ...authOpts,
      });
      toast.success(`สร้างออเดอร์ ${result.orderNumber} แล้ว`);
      void navigate({
        to: "/admin/orders/$orderId",
        params: { orderId: result.orderId },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="สั่งซื้อแทนลูกค้า"
        description="เซล/แอดมินสร้างออเดอร์ในนามลูกค้า"
      />

      <div className="mb-4 flex gap-2 text-sm">
        {[1, 2, 3, 4].map((s) => (
          <BadgeStep
            key={s}
            active={step === s}
            done={step > s}
            label={`ขั้น ${s}`}
          />
        ))}
      </div>

      {step === 1 ? (
        <Card>
          <CardContent className="grid gap-4 p-4">
            <Label>เลือกลูกค้า</Label>
            <Select value={customerUserId} onValueChange={setCustomerUserId}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกสมาชิก" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.userId} value={m.userId}>
                    {m.fullName ?? m.email} · {m.memberTier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button disabled={!customerUserId} onClick={() => setStep(2)}>
              ถัดไป
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardContent className="grid gap-4 p-4">
            <div className="grid gap-2 sm:grid-cols-[1fr_100px_auto]">
              <Select value={productPick} onValueChange={setProductPick}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสินค้า" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} · {formatPrice(p.retailPrice)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
              <Button type="button" onClick={addLine}>
                เพิ่ม
              </Button>
            </div>
            <ul className="space-y-2 text-sm">
              {lines.map((l, i) => (
                <li key={i} className="flex justify-between rounded border p-2">
                  <span>
                    {l.productName} × {l.qty}
                  </span>
                  <span>{formatPrice(l.qty * l.unitPrice)}</span>
                </li>
              ))}
            </ul>
            <p className="font-semibold">รวม {formatPrice(subtotal)}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                ย้อนกลับ
              </Button>
              <Button disabled={!lines.length} onClick={() => setStep(3)}>
                ถัดไป
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card>
          <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>ชื่อผู้รับ</Label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>เบอร์โทร</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>ที่อยู่</Label>
              <Input value={line1} onChange={(e) => setLine1(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>ชำระเงิน</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) =>
                  setPaymentMethod(v as typeof paymentMethod)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">โอนเงิน</SelectItem>
                  <SelectItem value="wallet">กระเป๋าลูกค้า</SelectItem>
                  <SelectItem value="pay_later">รอชำระ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                ย้อนกลับ
              </Button>
              <Button onClick={() => setStep(4)}>ถัดไป</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 4 ? (
        <Card>
          <CardContent className="grid gap-4 p-4">
            <p className="text-sm">
              ลูกค้า: {members.find((m) => m.userId === customerUserId)?.email}
            </p>
            <p className="text-sm">
              รายการ: {lines.length} · {formatPrice(subtotal)}
            </p>
            <div className="space-y-2">
              <Label>หมายเหตุภายใน</Label>
              <Textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                ย้อนกลับ
              </Button>
              <Button disabled={submitting} onClick={() => void submit()}>
                {submitting ? "กำลังสร้าง..." : "ยืนยันสร้างออเดอร์"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function BadgeStep({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 ${active ? "bg-primary text-primary-foreground" : done ? "bg-muted" : "bg-muted/50 text-muted-foreground"}`}
    >
      {label}
    </span>
  );
}
