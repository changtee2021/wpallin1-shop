import { Loader2, Trash2 } from "lucide-react";
import type { FormEvent, ReactNode } from "react";

import { CreditPanel } from "@/components/account/credit-panel";
import { DocumentsPanel } from "@/components/account/documents-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/i18n";
import { tierLabel, showCreditPanel } from "@/lib/member-tier";
import { formatDate, formatPrice } from "@/lib/format";
import type {
  AccountProfileDto,
  AddressDto,
  TaxInvoiceProfileDto,
} from "@/types/api/profile";
import type {
  WalletTransactionDto,
  WalletTopupRequestDto,
} from "@/services/wallet.service";
import type { TierProgressDto } from "@/services/tier.service";
import { cn } from "@/lib/utils";

const SETTINGS_SECTIONS = [
  { id: "section-personal", label: "ข้อมูลส่วนตัว" },
  { id: "section-finance", label: "การเงิน" },
  { id: "section-address-tax", label: "ที่อยู่และภาษี" },
  { id: "section-system", label: "ระบบ" },
] as const;

export type AccountSettingsSectionsProps = {
  loading: boolean;
  profile: AccountProfileDto;
  hasCreditAccount: boolean;
  customerType: "individual" | "juristic";
  setCustomerType: (v: "individual" | "juristic") => void;
  fullName: string;
  setFullName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  nationalId: string;
  setNationalId: (v: string) => void;
  companyTaxId: string;
  setCompanyTaxId: (v: string) => void;
  companyBranch: string;
  setCompanyBranch: (v: string) => void;
  savingProfile: boolean;
  onSaveProfile: (e: FormEvent) => void;
  walletBalance: number;
  walletPending: number;
  walletTxs: WalletTransactionDto[];
  tierProgress: TierProgressDto | null;
  topupRequests: WalletTopupRequestDto[];
  topupAmount: string;
  setTopupAmount: (v: string) => void;
  topupSlipFile: File | null;
  setTopupSlipFile: (v: File | null) => void;
  activeTopupId: string | null;
  submittingTopup: boolean;
  onSubmitTopup: (e: FormEvent) => void;
  onUploadTopupSlip: (requestId: string, file: File) => void;
  addresses: AddressDto[];
  addressForm: {
    label: string;
    recipientName: string;
    phone: string;
    line1: string;
    line2: string;
    district: string;
    province: string;
    postalCode: string;
    isDefault: boolean;
  };
  setAddressForm: React.Dispatch<
    React.SetStateAction<AccountSettingsSectionsProps["addressForm"]>
  >;
  editingAddressId: string | null;
  setEditingAddressId: (v: string | null) => void;
  savingAddress: boolean;
  onSaveAddress: (e: FormEvent) => void;
  onDeleteAddress: (id: string) => void;
  onEditAddress: (addr: AddressDto) => void;
  onCancelAddressEdit: () => void;
  taxProfiles: TaxInvoiceProfileDto[];
  taxForm: {
    companyName: string;
    taxId: string;
    branchCode: string;
    address: string;
    email: string;
    phone: string;
    isDefault: boolean;
  };
  setTaxForm: React.Dispatch<
    React.SetStateAction<AccountSettingsSectionsProps["taxForm"]>
  >;
  editingTaxId: string | null;
  setEditingTaxId: (v: string | null) => void;
  savingTax: boolean;
  onSaveTax: (e: FormEvent) => void;
  onDeleteTax: (id: string) => void;
  onEditTax: (tax: TaxInvoiceProfileDto) => void;
  onCancelTaxEdit: () => void;
  locale: "th" | "en";
  setLocale: (v: "th" | "en") => void;
  onSaveSettings: () => void;
  onSignOut: () => void;
};

export function AccountSettingsSections(props: AccountSettingsSectionsProps) {
  const { t } = useT();

  if (props.loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <nav className="hidden shrink-0 lg:block lg:w-44">
        <div className="sticky top-24 space-y-1">
          {SETTINGS_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {section.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="min-w-0 flex-1 space-y-10">
        <SettingsSection id="section-personal" title="ข้อมูลส่วนตัว">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ข้อมูลบัญชี</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={props.onSaveProfile} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input
                    id="email"
                    value={props.profile.email ?? ""}
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                  <Input
                    id="fullName"
                    value={props.fullName}
                    onChange={(e) => props.setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>ประเภทผู้ซื้อ</Label>
                  <Select
                    value={props.customerType}
                    onValueChange={(v) =>
                      props.setCustomerType(v as "individual" | "juristic")
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
                {props.customerType === "individual" ? (
                  <div className="grid gap-2">
                    <Label htmlFor="nationalId">เลขบัตรประชาชน</Label>
                    <Input
                      id="nationalId"
                      value={props.nationalId}
                      onChange={(e) => props.setNationalId(e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="companyTaxId">เลขผู้เสียภาษี</Label>
                      <Input
                        id="companyTaxId"
                        value={props.companyTaxId}
                        onChange={(e) => props.setCompanyTaxId(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="companyBranch">
                        สาขา (00000 = สำนักงานใหญ่)
                      </Label>
                      <Input
                        id="companyBranch"
                        value={props.companyBranch}
                        onChange={(e) => props.setCompanyBranch(e.target.value)}
                      />
                    </div>
                  </>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="phone">เบอร์โทร</Label>
                  <Input
                    id="phone"
                    value={props.phone}
                    onChange={(e) => props.setPhone(e.target.value)}
                    placeholder="08x-xxx-xxxx"
                  />
                </div>
                <Button type="submit" disabled={props.savingProfile}>
                  {props.savingProfile && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  บันทึก
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-3 p-6 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">ระดับสมาชิก</p>
                <p className="font-medium">
                  {tierLabel(props.profile.memberTier)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">สถานะบัญชี</p>
                <Badge variant="secondary">{props.profile.accountStatus}</Badge>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              {t("account.documents")} / KYC
            </h3>
            <DocumentsPanel customerType={props.customerType} />
          </div>
        </SettingsSection>

        <SettingsSection id="section-finance" title="การเงิน">
          {props.tierProgress ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">ระดับสมาชิก</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{props.tierProgress.currentTierName}</Badge>
                  {props.tierProgress.discountPct > 0 ? (
                    <span className="text-muted-foreground">
                      ส่วนลด {props.tierProgress.discountPct}%
                    </span>
                  ) : null}
                </div>
                <p>
                  ยอดซื้อสะสม {formatPrice(props.tierProgress.totalSpent)}
                  {props.tierProgress.nextTierName ? (
                    <>
                      {" "}
                      · อีก{" "}
                      {formatPrice(props.tierProgress.amountToNext ?? 0)} ถึง{" "}
                      {props.tierProgress.nextTierName}
                    </>
                  ) : (
                    " · ระดับสูงสุดแล้ว"
                  )}
                </p>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">ยอดใช้ได้</p>
                <p className="text-3xl font-bold text-accent">
                  {formatPrice(props.walletBalance)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">รอดำเนินการ</p>
                <p className="text-2xl font-semibold">
                  {formatPrice(props.walletPending)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">เติมเงินกระเป๋า</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={props.onSubmitTopup}
                className="grid gap-4 sm:max-w-md"
              >
                <div className="grid gap-2">
                  <Label htmlFor="topup-amount">จำนวนเงิน (บาท)</Label>
                  <Input
                    id="topup-amount"
                    type="number"
                    min={100}
                    step={1}
                    value={props.topupAmount}
                    onChange={(e) => props.setTopupAmount(e.target.value)}
                    placeholder="ขั้นต่ำ 100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="topup-slip">สลิปโอนเงิน</Label>
                  <Input
                    id="topup-slip"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      props.setTopupSlipFile(e.target.files?.[0] ?? null)
                    }
                  />
                </div>
                <Button type="submit" disabled={props.submittingTopup}>
                  {props.submittingTopup ? "กำลังส่ง..." : "ส่งคำขอเติมเงิน"}
                </Button>
                {props.activeTopupId ? (
                  <p className="text-xs text-muted-foreground">
                    คำขอล่าสุด: {props.activeTopupId.slice(0, 8)}…
                  </p>
                ) : null}
              </form>
            </CardContent>
          </Card>

          {props.topupRequests.some((r) => r.status === "pending") ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">คำขอเติมเงิน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {props.topupRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{formatPrice(req.amount)}</p>
                      <p className="text-muted-foreground">
                        {formatDate(req.createdAt)}
                      </p>
                      <Badge variant="outline">{req.status}</Badge>
                    </div>
                    {req.status === "pending" && !req.slipFileUrl ? (
                      <Input
                        type="file"
                        accept="image/*"
                        className="max-w-xs"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) props.onUploadTopupSlip(req.id, file);
                        }}
                      />
                    ) : req.slipSignedUrl ? (
                      <a
                        href={req.slipSignedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        ดูสลิป
                      </a>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">ประวัติธุรกรรม</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {props.walletTxs.length === 0 ? (
                <p className="text-sm text-muted-foreground">ยังไม่มีธุรกรรม</p>
              ) : (
                props.walletTxs.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div>
                      <p>{tx.description ?? tx.type}</p>
                      <p className="text-muted-foreground">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{tx.status}</Badge>
                      <p
                        className={
                          tx.direction === "debit"
                            ? "text-destructive"
                            : "text-green-600"
                        }
                      >
                        {tx.direction === "debit" ? "-" : "+"}
                        {formatPrice(tx.amount)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {showCreditPanel(props.hasCreditAccount) && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                {t("account.credit")}
              </h3>
              <CreditPanel />
            </div>
          )}
        </SettingsSection>

        <SettingsSection id="section-address-tax" title="ที่อยู่และภาษี">
          <div>
            <h3 className="mb-3 text-sm font-medium">{t("account.addresses")}</h3>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {props.editingAddressId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่จัดส่ง"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={props.onSaveAddress} className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>ชื่อที่อยู่</Label>
                      <Input
                        value={props.addressForm.label}
                        onChange={(e) =>
                          props.setAddressForm((f) => ({
                            ...f,
                            label: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>ชื่อผู้รับ</Label>
                      <Input
                        value={props.addressForm.recipientName}
                        onChange={(e) =>
                          props.setAddressForm((f) => ({
                            ...f,
                            recipientName: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>เบอร์โทร</Label>
                      <Input
                        value={props.addressForm.phone}
                        onChange={(e) =>
                          props.setAddressForm((f) => ({
                            ...f,
                            phone: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                      <Label>ที่อยู่</Label>
                      <Input
                        value={props.addressForm.line1}
                        onChange={(e) =>
                          props.setAddressForm((f) => ({
                            ...f,
                            line1: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>แขวง/ตำบล</Label>
                      <Input
                        value={props.addressForm.district}
                        onChange={(e) =>
                          props.setAddressForm((f) => ({
                            ...f,
                            district: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>จังหวัด</Label>
                      <Input
                        value={props.addressForm.province}
                        onChange={(e) =>
                          props.setAddressForm((f) => ({
                            ...f,
                            province: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>รหัสไปรษณีย์</Label>
                      <Input
                        value={props.addressForm.postalCode}
                        onChange={(e) =>
                          props.setAddressForm((f) => ({
                            ...f,
                            postalCode: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <Switch
                        checked={props.addressForm.isDefault}
                        onCheckedChange={(checked) =>
                          props.setAddressForm((f) => ({
                            ...f,
                            isDefault: checked,
                          }))
                        }
                      />
                      <Label>ตั้งเป็นที่อยู่หลัก</Label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={props.savingAddress}>
                      {props.savingAddress && (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      )}
                      บันทึกที่อยู่
                    </Button>
                    {props.editingAddressId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={props.onCancelAddressEdit}
                      >
                        ยกเลิก
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="mt-3 space-y-2">
              {props.addresses.length === 0 ? (
                <p className="text-sm text-muted-foreground">ยังไม่มีที่อยู่</p>
              ) : (
                props.addresses.map((addr) => (
                  <Card key={addr.id}>
                    <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
                      <div className="text-sm">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <p className="font-medium">
                            {addr.label ?? "ที่อยู่จัดส่ง"}
                          </p>
                          {addr.isDefault && (
                            <Badge variant="secondary">หลัก</Badge>
                          )}
                        </div>
                        <p>{addr.recipientName}</p>
                        <p className="text-muted-foreground">{addr.phone}</p>
                        <p>
                          {addr.line1}
                          {addr.district ? ` ${addr.district}` : ""}
                          {addr.province ? ` ${addr.province}` : ""}
                          {addr.postalCode ? ` ${addr.postalCode}` : ""}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => props.onEditAddress(addr)}
                        >
                          แก้ไข
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => props.onDeleteAddress(addr.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium">
              {t("account.taxInvoice")}
            </h3>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {props.editingTaxId
                    ? "แก้ไขข้อมูลใบกำกับภาษี"
                    : "เพิ่มข้อมูลใบกำกับภาษี"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={props.onSaveTax} className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2 sm:col-span-2">
                      <Label>ชื่อบริษัท / นิติบุคคล</Label>
                      <Input
                        value={props.taxForm.companyName}
                        onChange={(e) =>
                          props.setTaxForm((f) => ({
                            ...f,
                            companyName: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>เลขประจำตัวผู้เสียภาษี</Label>
                      <Input
                        value={props.taxForm.taxId}
                        onChange={(e) =>
                          props.setTaxForm((f) => ({
                            ...f,
                            taxId: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>รหัสสาขา</Label>
                      <Input
                        value={props.taxForm.branchCode}
                        onChange={(e) =>
                          props.setTaxForm((f) => ({
                            ...f,
                            branchCode: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                      <Label>ที่อยู่ในใบกำกับ</Label>
                      <Textarea
                        value={props.taxForm.address}
                        onChange={(e) =>
                          props.setTaxForm((f) => ({
                            ...f,
                            address: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>อีเมล</Label>
                      <Input
                        type="email"
                        value={props.taxForm.email}
                        onChange={(e) =>
                          props.setTaxForm((f) => ({
                            ...f,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>เบอร์โทร</Label>
                      <Input
                        value={props.taxForm.phone}
                        onChange={(e) =>
                          props.setTaxForm((f) => ({
                            ...f,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <Switch
                        checked={props.taxForm.isDefault}
                        onCheckedChange={(checked) =>
                          props.setTaxForm((f) => ({ ...f, isDefault: checked }))
                        }
                      />
                      <Label>ตั้งเป็นข้อมูลหลัก</Label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={props.savingTax}>
                      {props.savingTax && (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      )}
                      บันทึก
                    </Button>
                    {props.editingTaxId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={props.onCancelTaxEdit}
                      >
                        ยกเลิก
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="mt-3 space-y-2">
              {props.taxProfiles.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  ยังไม่มีข้อมูลใบกำกับภาษี
                </p>
              ) : (
                props.taxProfiles.map((tax) => (
                  <Card key={tax.id}>
                    <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
                      <div className="text-sm">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <p className="font-medium">{tax.companyName}</p>
                          {tax.isDefault && (
                            <Badge variant="secondary">หลัก</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">
                          เลขภาษี {tax.taxId}
                          {tax.branchCode ? ` สาขา ${tax.branchCode}` : ""}
                        </p>
                        <p>{tax.address}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => props.onEditTax(tax)}
                        >
                          แก้ไข
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => props.onDeleteTax(tax.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </SettingsSection>

        <SettingsSection id="section-system" title="ระบบ">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">การตั้งค่า</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid max-w-xs gap-2">
                <Label>ภาษา / Language</Label>
                <Select
                  value={props.locale}
                  onValueChange={(v) => props.setLocale(v as "th" | "en")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="th">ไทย</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={props.onSaveSettings}
                disabled={props.savingProfile}
              >
                {props.savingProfile && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                บันทึกการตั้งค่า
              </Button>
              <Separator />
              <div>
                <p className="mb-2 text-sm text-muted-foreground">
                  ออกจากระบบจากอุปกรณ์นี้
                </p>
                <Button variant="outline" onClick={props.onSignOut}>
                  {t("nav.logout")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </SettingsSection>
      </div>
    </div>
  );
}

function SettingsSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <h2
        className={cn(
          "border-b pb-2 text-lg font-semibold tracking-tight",
        )}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
