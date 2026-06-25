import { PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/format";
import type { CartItemDto } from "@/types/api/cart";
import type { QuotationBuyerInput } from "@/types/api/quotations";

type QuotationPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItemDto[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  initialBuyer?: Partial<QuotationBuyerInput>;
  submitting?: boolean;
  onSubmit: (buyer: QuotationBuyerInput) => void;
};

const emptyBuyer: QuotationBuyerInput = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerType: "individual",
  taxId: "",
  companyName: "",
  companyBranch: "",
  line1: "",
  district: "",
  province: "",
  postalCode: "",
  note: "",
};

export function QuotationPreviewDialog({
  open,
  onOpenChange,
  items,
  subtotal,
  discount,
  grandTotal,
  initialBuyer,
  submitting,
  onSubmit,
}: QuotationPreviewDialogProps) {
  const [buyer, setBuyer] = useState<QuotationBuyerInput>(emptyBuyer);

  useEffect(() => {
    if (!open) return;
    setBuyer({
      ...emptyBuyer,
      ...initialBuyer,
      customerType: initialBuyer?.customerType ?? "individual",
    });
  }, [open, initialBuyer]);

  function updateField<K extends keyof QuotationBuyerInput>(
    key: K,
    value: QuotationBuyerInput[K],
  ) {
    setBuyer((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!buyer.customerName.trim() || !buyer.customerPhone.trim()) {
      return;
    }
    if (!buyer.line1.trim()) return;
    if (buyer.customerType === "juristic") {
      if (!buyer.companyName?.trim() || !buyer.taxId?.trim()) return;
    }
    onSubmit(buyer);
  }

  const isJuristic = buyer.customerType === "juristic";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ตรวจสอบก่อนขอใบเสนอราคา</DialogTitle>
          <DialogDescription>
            ตรวจสอบรายการและข้อมูลผู้ซื้อ — ทีมขายจะติดต่อกลับพร้อมใบเสนอราคา
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm font-semibold">รายการสินค้า</p>
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-lg border p-3">
              <div className="size-12 shrink-0 overflow-hidden rounded bg-muted">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <PackageCheck className="size-4" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  x{item.qty} · {formatPrice(item.unitPrice)}
                </p>
                {item.optionSummary ? (
                  <p className="mt-1 text-xs text-primary">
                    {item.optionSummary}
                  </p>
                ) : null}
              </div>
              <p className="text-sm font-semibold">
                {formatPrice(item.lineTotal)}
              </p>
            </div>
          ))}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ยอดสินค้า</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between text-green-600">
                <span>ส่วนลด</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between font-bold">
              <span>รวมประมาณ</span>
              <span className="text-accent">{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <p className="text-sm font-semibold">ข้อมูลผู้ซื้อ</p>

          <div className="space-y-2">
            <Label>ประเภทลูกค้า</Label>
            <Select
              value={buyer.customerType}
              onValueChange={(v) =>
                updateField("customerType", v as "individual" | "juristic")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">บุคคลธรรมดา</SelectItem>
                <SelectItem value="juristic">นิติบุคคล</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isJuristic ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName">ชื่อบริษัท *</Label>
                <Input
                  id="companyName"
                  value={buyer.companyName ?? ""}
                  onChange={(e) => updateField("companyName", e.target.value)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="taxId">เลขผู้เสียภาษี *</Label>
                  <Input
                    id="taxId"
                    value={buyer.taxId ?? ""}
                    onChange={(e) => updateField("taxId", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyBranch">สาขา</Label>
                  <Input
                    id="companyBranch"
                    value={buyer.companyBranch ?? ""}
                    onChange={(e) =>
                      updateField("companyBranch", e.target.value)
                    }
                  />
                </div>
              </div>
            </>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="customerName">
              {isJuristic ? "ชื่อผู้ติดต่อ *" : "ชื่อ-นามสกุล *"}
            </Label>
            <Input
              id="customerName"
              value={buyer.customerName}
              onChange={(e) => updateField("customerName", e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerPhone">เบอร์โทร *</Label>
              <Input
                id="customerPhone"
                value={buyer.customerPhone}
                onChange={(e) => updateField("customerPhone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">อีเมล</Label>
              <Input
                id="customerEmail"
                type="email"
                value={buyer.customerEmail ?? ""}
                onChange={(e) => updateField("customerEmail", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="line1">ที่อยู่ *</Label>
            <Input
              id="line1"
              value={buyer.line1}
              onChange={(e) => updateField("line1", e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="district">เขต/อำเภอ</Label>
              <Input
                id="district"
                value={buyer.district ?? ""}
                onChange={(e) => updateField("district", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">จังหวัด</Label>
              <Input
                id="province"
                value={buyer.province ?? ""}
                onChange={(e) => updateField("province", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">รหัสไปรษณีย์</Label>
              <Input
                id="postalCode"
                value={buyer.postalCode ?? ""}
                onChange={(e) => updateField("postalCode", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">หมายเหตุถึงทีมขาย</Label>
            <Textarea
              id="note"
              rows={2}
              value={buyer.note ?? ""}
              onChange={(e) => updateField("note", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button disabled={submitting} onClick={handleSubmit}>
            {submitting ? "กำลังส่ง..." : "ยืนยันขอใบเสนอราคา"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
