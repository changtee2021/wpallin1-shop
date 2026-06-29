import { Link } from "@tanstack/react-router";
import { PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { InlineRowsSkeleton } from "@/components/loading";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/format";
import type { CartItemDto } from "@/types/api/cart";
import type { QuotationBuyerInput } from "@/types/api/quotations";

type BuyerMode = "account" | "other";

type QuotationPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItemDto[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  profileBuyer?: Partial<QuotationBuyerInput>;
  profileLoading?: boolean;
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

function buildAccountBuyer(
  profile: Partial<QuotationBuyerInput>,
): QuotationBuyerInput {
  return {
    ...emptyBuyer,
    ...profile,
    customerType: profile.customerType ?? "individual",
  };
}

function buildOtherBuyer(
  profile: Partial<QuotationBuyerInput>,
): QuotationBuyerInput {
  return {
    ...emptyBuyer,
    customerEmail: profile.customerEmail ?? "",
  };
}

function hasProfileDetails(profile: Partial<QuotationBuyerInput>): boolean {
  return Boolean(
    profile.customerName?.trim() ||
    profile.customerPhone?.trim() ||
    profile.line1?.trim(),
  );
}

export function QuotationPreviewDialog({
  open,
  onOpenChange,
  items,
  subtotal,
  discount,
  grandTotal,
  profileBuyer = {},
  profileLoading,
  submitting,
  onSubmit,
}: QuotationPreviewDialogProps) {
  const [buyerMode, setBuyerMode] = useState<BuyerMode>("account");
  const [buyer, setBuyer] = useState<QuotationBuyerInput>(emptyBuyer);

  useEffect(() => {
    if (!open) return;
    setBuyerMode("account");
    setBuyer(buildAccountBuyer(profileBuyer));
    // Reset mode only when the dialog opens, not when profile data arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- profileBuyer handled below
  }, [open]);

  useEffect(() => {
    if (!open || buyerMode !== "account") return;
    setBuyer(buildAccountBuyer(profileBuyer));
  }, [open, buyerMode, profileBuyer]);

  function handleBuyerModeChange(mode: BuyerMode) {
    setBuyerMode(mode);
    setBuyer(
      mode === "account"
        ? buildAccountBuyer(profileBuyer)
        : buildOtherBuyer(profileBuyer),
    );
  }

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
          <div>
            <p className="text-sm font-semibold">ข้อมูลผู้ซื้อ</p>
            <p className="mt-1 text-xs text-muted-foreground">
              เลือกว่าจะออกใบเสนอราคาในนามตัวเอง หรือในนามลูกค้า/บริษัทอื่น
            </p>
          </div>

          <div className="space-y-2">
            <Label>ออกใบเสนอราคาในนาม</Label>
            <RadioGroup
              value={buyerMode}
              onValueChange={(value) =>
                handleBuyerModeChange(value as BuyerMode)
              }
              className="gap-2"
            >
              <label
                htmlFor="buyer-mode-account"
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <RadioGroupItem
                  value="account"
                  id="buyer-mode-account"
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">
                    ใช้ข้อมูลจากบัญชีของฉัน
                  </span>
                  <p className="text-xs text-muted-foreground">
                    ดึงชื่อ ที่อยู่ และข้อมูลใบกำกับจากโปรไฟล์
                  </p>
                </div>
              </label>
              <label
                htmlFor="buyer-mode-other"
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <RadioGroupItem
                  value="other"
                  id="buyer-mode-other"
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">ออกใบในนามอื่น</span>
                  <p className="text-xs text-muted-foreground">
                    เช่น ลูกค้าที่คุณแทน หรือนิติบุคคลคนละชื่อ
                  </p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {profileLoading && buyerMode === "account" ? (
            <InlineRowsSkeleton rows={2} />
          ) : null}

          {!profileLoading &&
          buyerMode === "account" &&
          !hasProfileDetails(profileBuyer) ? (
            <p className="text-xs text-amber-700">
              ยังไม่มีข้อมูลในโปรไฟล์ —{" "}
              <Link to="/account" className="underline underline-offset-2">
                ไปตั้งค่าบัญชี
              </Link>{" "}
              หรือเลือก &quot;ออกใบในนามอื่น&quot; แล้วกรอกเอง
            </p>
          ) : null}

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
