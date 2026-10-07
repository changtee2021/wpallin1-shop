import { Check, Copy, Loader2 } from "lucide-react";
import { useState, type ComponentProps, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field-error";
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
import { createDealerAccountFn } from "@/lib/api.functions";
import { DEALER_BUSINESS_TYPES } from "@/lib/dealer.constants";
import {
  DEALER_PROVINCE_CODE_PATTERN,
  DEALER_PROVINCES,
  dealerProvinceName,
  normalizeProvinceCode,
} from "@/lib/dealer-provinces";
import { authServerFnOptions } from "@/lib/server-fn-auth";

export type DealerHandoff = {
  dealerCode: string;
  companyName: string;
  contactName?: string | null;
  /** Only when sales set the password; web applicants already chose their own. */
  tempPassword?: string;
};

export function dealerWelcomeMessage(handoff: DealerHandoff, origin: string) {
  const lines = [
    `สวัสดีครับ คุณ${handoff.contactName ?? ""}`.trim(),
    `บัญชีตัวแทน WP ALL ของ ${handoff.companyName} เปิดใช้งานแล้ว`,
    "",
    `รหัสตัวแทน: ${handoff.dealerCode}`,
  ];
  if (handoff.tempPassword) {
    lines.push(`รหัสผ่านชั่วคราว: ${handoff.tempPassword}`);
  }
  lines.push(`เข้าสู่ระบบ: ${origin}/login`);
  lines.push("");
  lines.push(
    handoff.tempPassword
      ? "ใช้รหัสตัวแทนแทนอีเมลได้เลย เข้าครั้งแรกระบบจะให้ตั้งรหัสผ่านใหม่"
      : "เข้าสู่ระบบด้วยอีเมลเดิมหรือรหัสตัวแทนก็ได้ ราคาตัวแทนจะแสดงทันที",
  );
  return lines.join("\n");
}

export function ProvinceCodeField({
  id,
  value,
  onChange,
  error,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const listId = `${id}-options`;
  const name = dealerProvinceName(value);
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>รหัสจังหวัด</Label>
      <Input
        id={id}
        list={listId}
        value={value}
        onChange={(e) => onChange(normalizeProvinceCode(e.target.value))}
        placeholder="BKK"
        maxLength={4}
        autoComplete="off"
        className="h-11 font-mono uppercase"
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : `${id}-hint`}
      />
      <datalist id={listId}>
        {DEALER_PROVINCES.map((p) => (
          <option key={p.code} value={p.code}>
            {p.name}
          </option>
        ))}
      </datalist>
      {error ? (
        <FieldError id={`${id}-error`}>{error}</FieldError>
      ) : (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {value && name !== value
            ? `${name} → รหัสจะเป็น WPD-${value}-xxxx`
            : "พิมพ์หรือเลือก เช่น BKK, CNX, KKN (อังกฤษ 2–4 ตัว)"}
        </p>
      )}
    </div>
  );
}

const EMPTY_FORM = {
  companyName: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  provinceCode: "BKK",
  businessType: "curtain_shop",
  taxId: "",
  address: "",
};

export function CreateDealerDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (handoff: DealerHandoff) => void;
}) {
  const { session } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof EMPTY_FORM>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.companyName.trim()) next.companyName = "กรอกชื่อร้าน/บริษัท";
    if (!form.contactName.trim()) next.contactName = "กรอกชื่อผู้ติดต่อ";
    if (form.contactPhone.replace(/\D/g, "").length < 9) {
      next.contactPhone = "เบอร์โทรไม่ครบ";
    }
    if (!DEALER_PROVINCE_CODE_PATTERN.test(form.provinceCode)) {
      next.provinceCode = "ใช้ตัวอักษรอังกฤษ 2–4 ตัว";
    }
    if (form.taxId && !/^\d{13}$/.test(form.taxId)) {
      next.taxId = "เลขผู้เสียภาษีต้องมี 13 หลัก";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const result = await createDealerAccountFn({
        data: { ...form, source: "line" },
        ...authServerFnOptions(session),
      });
      onCreated(result);
      setForm(EMPTY_FORM);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เปิดบัญชีไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  const field = (
    key: keyof typeof EMPTY_FORM,
    label: string,
    props: Partial<ComponentProps<typeof Input>> = {},
  ) => (
    <div className="space-y-2">
      <Label htmlFor={`dealer-${key}`}>{label}</Label>
      <Input
        id={`dealer-${key}`}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        className="h-11"
        aria-invalid={Boolean(errors[key]) || undefined}
        aria-describedby={errors[key] ? `dealer-${key}-error` : undefined}
        {...props}
      />
      <FieldError id={`dealer-${key}-error`}>{errors[key]}</FieldError>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>เปิดบัญชีตัวแทน</DialogTitle>
          <DialogDescription>
            สำหรับลูกค้าที่คุยกับเซลทาง LINE แล้ว
            ระบบจะออกรหัสตัวแทนและรหัสผ่านชั่วคราวให้ส่งต่อ
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              {field("companyName", "ชื่อร้าน / บริษัท", {
                autoComplete: "organization",
              })}
            </div>
            {field("contactName", "ชื่อผู้ติดต่อ", { autoComplete: "name" })}
            {field("contactPhone", "เบอร์โทร", {
              type: "tel",
              inputMode: "tel",
              autoComplete: "tel",
            })}
            <ProvinceCodeField
              id="dealer-province"
              value={form.provinceCode}
              onChange={(value) => set("provinceCode", value)}
              error={errors.provinceCode}
            />
            <div className="space-y-2">
              <Label htmlFor="dealer-business-type">ประเภทธุรกิจ</Label>
              <Select
                value={form.businessType}
                onValueChange={(value) => set("businessType", value)}
              >
                <SelectTrigger id="dealer-business-type" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEALER_BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {field("contactEmail", "อีเมล (ไม่บังคับ)", {
              type: "email",
              inputMode: "email",
              autoComplete: "email",
              placeholder: "เว้นว่างได้ ใช้รหัสตัวแทนเข้าระบบ",
            })}
            {field("taxId", "เลขผู้เสียภาษี (ไม่บังคับ)", {
              inputMode: "numeric",
              maxLength: 13,
            })}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="dealer-address">ที่อยู่จัดส่ง (ไม่บังคับ)</Label>
              <Textarea
                id="dealer-address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" className="h-11" disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              ) : null}
              เปิดบัญชีและออกรหัส
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DealerHandoffDialog({
  handoff,
  onClose,
}: {
  handoff: DealerHandoff | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  if (!handoff) return null;

  const message = dealerWelcomeMessage(
    handoff,
    typeof window === "undefined" ? "" : window.location.origin,
  );

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("คัดลอกข้อความแล้ว วางในแชท LINE ได้เลย");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("คัดลอกไม่สำเร็จ ลองเลือกข้อความแล้วคัดลอกเอง");
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>ส่งรหัสให้ลูกค้า</DialogTitle>
          <DialogDescription>
            {handoff.tempPassword
              ? "รหัสผ่านชั่วคราวแสดงครั้งเดียว ปิดหน้าต่างนี้แล้วจะดูอีกไม่ได้"
              : "ลูกค้าเข้าระบบด้วยอีเมลเดิมหรือรหัสตัวแทนก็ได้"}
          </DialogDescription>
        </DialogHeader>

        <dl className="divide-y divide-border rounded-lg border border-border">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-sm text-muted-foreground">รหัสตัวแทน</dt>
            <dd className="font-mono text-lg font-medium tracking-wide">
              {handoff.dealerCode}
            </dd>
          </div>
          {handoff.tempPassword ? (
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-muted-foreground">
                รหัสผ่านชั่วคราว
              </dt>
              <dd className="font-mono text-lg font-medium tracking-wide select-all">
                {handoff.tempPassword}
              </dd>
            </div>
          ) : null}
        </dl>

        <pre className="max-h-48 overflow-auto rounded-lg bg-muted/50 p-4 font-sans text-sm leading-6 whitespace-pre-wrap">
          {message}
        </pre>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" className="h-11" onClick={onClose}>
            ปิด
          </Button>
          <Button className="h-11" onClick={() => void copyMessage()}>
            {copied ? (
              <Check className="mr-2 size-4" aria-hidden />
            ) : (
              <Copy className="mr-2 size-4" aria-hidden />
            )}
            คัดลอกข้อความส่ง LINE
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ApproveDealerDialog({
  application,
  saving,
  onCancel,
  onConfirm,
}: {
  application: { companyName: string; provinceCode: string | null } | null;
  saving: boolean;
  onCancel: () => void;
  onConfirm: (provinceCode: string) => void;
}) {
  const [province, setProvince] = useState("");
  const [error, setError] = useState("");
  const value = province || application?.provinceCode || "";

  if (!application) return null;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          setProvince("");
          onCancel();
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>อนุมัติ {application.companyName}</DialogTitle>
          <DialogDescription>
            เลือกจังหวัดของร้าน ระบบจะออกรหัสตัวแทนให้อัตโนมัติ
          </DialogDescription>
        </DialogHeader>
        <ProvinceCodeField
          id="approve-province"
          value={value}
          onChange={(next) => {
            setProvince(next);
            setError("");
          }}
          error={error}
        />
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" className="h-11" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button
            className="h-11"
            disabled={saving}
            onClick={() => {
              if (!DEALER_PROVINCE_CODE_PATTERN.test(value)) {
                setError("ใช้ตัวอักษรอังกฤษ 2–4 ตัว เช่น BKK");
                return;
              }
              onConfirm(value);
            }}
          >
            {saving ? (
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            ) : null}
            อนุมัติและออกรหัส
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
