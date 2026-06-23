import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Shield, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/layout/page-header";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  deleteAccountAddress,
  deleteTaxInvoiceProfileFn,
  fetchAccountAddresses,
  fetchAccountProfile,
  fetchTaxInvoiceProfiles,
  fetchWalletSummary,
  fetchWalletTransactions,
  fetchTierProgress,
  submitWalletTopup,
  fetchUserTopupRequests,
  saveAccountAddress,
  saveTaxInvoiceProfileFn,
  updateAccountProfileFn,
  fetchCreditAccount,
} from "@/lib/api.functions";
import { formatDate, formatPrice } from "@/lib/format";
import {
  authServerFnOptions,
  useAuthServerFnOptions,
} from "@/lib/server-fn-auth";
import {
  tierLabel,
  customerTypeLabel,
  showCreditPanel,
} from "@/lib/member-tier";
import { useT, useLocaleControl } from "@/i18n";
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

const accountTabSchema = z.enum([
  "profile",
  "wallet",
  "addresses",
  "tax",
  "documents",
  "credit",
  "settings",
]);

export const Route = createFileRoute("/account/")({
  validateSearch: (search) => ({
    tab: accountTabSchema.catch("profile").parse(search.tab ?? "profile"),
  }),
  component: AccountProfilePage,
});

const emptyAddress = {
  label: "",
  recipientName: "",
  phone: "",
  line1: "",
  line2: "",
  district: "",
  province: "",
  postalCode: "",
  isDefault: false,
};

const emptyTax = {
  companyName: "",
  taxId: "",
  branchCode: "",
  address: "",
  email: "",
  phone: "",
  isDefault: false,
};

function AccountProfilePage() {
  const { t } = useT();
  const { setLocale: applyLocale } = useLocaleControl();
  const { session, signOut, isAdmin, isDealer } = useAuth();
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [profile, setProfile] = useState<AccountProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [locale, setLocale] = useState<"th" | "en">("th");
  const [customerType, setCustomerType] = useState<"individual" | "juristic">(
    "individual",
  );
  const [nationalId, setNationalId] = useState("");
  const [companyTaxId, setCompanyTaxId] = useState("");
  const [companyBranch, setCompanyBranch] = useState("");
  const [hasCreditAccount, setHasCreditAccount] = useState(false);

  const [walletBalance, setWalletBalance] = useState(0);
  const [walletPending, setWalletPending] = useState(0);
  const [walletTxs, setWalletTxs] = useState<WalletTransactionDto[]>([]);
  const [tierProgress, setTierProgress] = useState<TierProgressDto | null>(
    null,
  );
  const [topupRequests, setTopupRequests] = useState<WalletTopupRequestDto[]>(
    [],
  );
  const [topupAmount, setTopupAmount] = useState("");
  const [topupSlipFile, setTopupSlipFile] = useState<File | null>(null);
  const [activeTopupId, setActiveTopupId] = useState<string | null>(null);
  const [submittingTopup, setSubmittingTopup] = useState(false);

  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const [taxProfiles, setTaxProfiles] = useState<TaxInvoiceProfileDto[]>([]);
  const [taxForm, setTaxForm] = useState(emptyTax);
  const [editingTaxId, setEditingTaxId] = useState<string | null>(null);
  const [savingTax, setSavingTax] = useState(false);

  const authOpts = useAuthServerFnOptions(session);

  const loadProfile = useCallback(async () => {
    const data = await fetchAccountProfile(authOpts);
    setProfile(data);
    setFullName(data.fullName ?? "");
    setPhone(data.phone ?? "");
    setLocale(data.locale === "en" ? "en" : "th");
    setCustomerType(data.customerType);
    setNationalId(data.nationalId ?? "");
    setCompanyTaxId(data.companyTaxId ?? "");
    setCompanyBranch(data.companyBranch ?? "");
    try {
      const credit = await fetchCreditAccount(authOpts);
      setHasCreditAccount(Boolean(credit && credit.status === "active"));
    } catch {
      setHasCreditAccount(false);
    }
  }, [authOpts]);

  const loadWallet = useCallback(async () => {
    const [summary, txs, progress, topups] = await Promise.all([
      fetchWalletSummary(authOpts),
      fetchWalletTransactions(authOpts),
      fetchTierProgress(authOpts),
      fetchUserTopupRequests(authOpts),
    ]);
    setWalletBalance(summary.availableBalance);
    setWalletPending(summary.pendingBalance);
    setWalletTxs(txs);
    setTierProgress(progress);
    setTopupRequests(topups);
  }, [authOpts]);

  const loadAddresses = useCallback(async () => {
    setAddresses(await fetchAccountAddresses(authOpts));
  }, [authOpts]);

  const loadTaxProfiles = useCallback(async () => {
    setTaxProfiles(await fetchTaxInvoiceProfiles(authOpts));
  }, [authOpts]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        await loadProfile();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadProfile]);

  useEffect(() => {
    if (!profile) return;

    if (tab === "profile" || tab === "settings") {
      setTabLoading(false);
      return;
    }

    if (tab === "documents" || tab === "credit") {
      setTabLoading(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      setTabLoading(true);
      try {
        if (tab === "wallet") {
          await loadWallet();
        } else if (tab === "addresses") {
          await loadAddresses();
        } else if (tab === "tax") {
          await loadTaxProfiles();
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (!cancelled) setTabLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tab, profile, loadWallet, loadAddresses, loadTaxProfiles]);

  async function saveProfileData(successMessage: string) {
    setSavingProfile(true);
    try {
      await updateAccountProfileFn({
        data: {
          fullName,
          phone,
          locale,
          customerType,
          nationalId,
          companyTaxId,
          companyBranch,
        },
        ...authOpts,
      });
      applyLocale(locale);
      await loadProfile();
      toast.success(successMessage);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    await saveProfileData("บันทึกโปรไฟล์แล้ว");
  }

  async function handleSaveAddress(e: FormEvent) {
    e.preventDefault();
    setSavingAddress(true);
    try {
      await saveAccountAddress({
        data: {
          id: editingAddressId ?? undefined,
          ...addressForm,
        },
        ...authOpts,
      });
      setAddressForm(emptyAddress);
      setEditingAddressId(null);
      await loadAddresses();
      toast.success("บันทึกที่อยู่แล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleDeleteAddress(id: string) {
    try {
      await deleteAccountAddress({ data: { id }, ...authOpts });
      if (editingAddressId === id) {
        setEditingAddressId(null);
        setAddressForm(emptyAddress);
      }
      await loadAddresses();
      toast.success("ลบที่อยู่แล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
    }
  }

  async function handleSaveTax(e: FormEvent) {
    e.preventDefault();
    setSavingTax(true);
    try {
      await saveTaxInvoiceProfileFn({
        data: {
          id: editingTaxId ?? undefined,
          ...taxForm,
        },
        ...authOpts,
      });
      setTaxForm(emptyTax);
      setEditingTaxId(null);
      await loadTaxProfiles();
      toast.success("บันทึกข้อมูลใบกำกับแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSavingTax(false);
    }
  }

  async function handleDeleteTax(id: string) {
    try {
      await deleteTaxInvoiceProfileFn({ data: { id }, ...authOpts });
      if (editingTaxId === id) {
        setEditingTaxId(null);
        setTaxForm(emptyTax);
      }
      await loadTaxProfiles();
      toast.success("ลบข้อมูลใบกำกับแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
    }
  }

  async function handleSubmitTopup(e: FormEvent) {
    e.preventDefault();
    const amount = Number(topupAmount);
    if (!amount || amount < 100) {
      toast.error("ยอดเติมขั้นต่ำ 100 บาท");
      return;
    }
    if (!session?.access_token) {
      toast.error("กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    setSubmittingTopup(true);
    try {
      const { requestId } = await submitWalletTopup({
        data: { amount },
        ...authOpts,
      });
      setActiveTopupId(requestId);

      if (topupSlipFile) {
        const form = new FormData();
        form.append("file", topupSlipFile);
        form.append("requestId", requestId);
        const res = await fetch("/api/v1/wallet-topup-slip", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: form,
        });
        if (!res.ok) {
          const body = (await res.json()) as { error?: string };
          throw new Error(body.error ?? "อัปโหลดสลิปไม่สำเร็จ");
        }
      }

      toast.success(
        topupSlipFile
          ? "ส่งคำขอเติมเงินแล้ว รอแอดมินตรวจสอบ"
          : "สร้างคำขอแล้ว กรุณาอัปโหลดสลิป",
      );
      setTopupAmount("");
      setTopupSlipFile(null);
      await loadWallet();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setSubmittingTopup(false);
    }
  }

  async function handleUploadTopupSlip(requestId: string, file: File) {
    if (!session?.access_token) return;
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("requestId", requestId);
      const res = await fetch("/api/v1/wallet-topup-slip", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: form,
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "อัปโหลดไม่สำเร็จ");
      }
      toast.success("อัปโหลดสลิปแล้ว");
      await loadWallet();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("account.profile")}
        description="จัดการข้อมูลส่วนตัว กระเป๋าเงิน ที่อยู่ และการตั้งค่า"
      />

      {!profile.profileCompleted && (
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-sm text-amber-900">
            กรุณากรอกข้อมูลให้ครบ (ประเภทผู้ซื้อและเลขประจำตัว/เลขภาษี)
            เพื่อใช้งานใบกำกับภาษีและขอวงเงินเครดิต
          </CardContent>
        </Card>
      )}

      {(isAdmin || isDealer) && (
        <div className="mb-6 flex flex-wrap gap-2">
          {isAdmin && (
            <Button asChild>
              <Link to="/admin">
                <Shield className="mr-2 size-4" />
                {t("nav.admin")}
              </Link>
            </Button>
          )}
          {isDealer && (
            <Button asChild variant="outline">
              <Link to="/dealer">{t("nav.dealer")}</Link>
            </Button>
          )}
        </div>
      )}

      <Tabs
        value={tab}
        onValueChange={(value) =>
          navigate({ search: { tab: value as typeof tab } })
        }
        className="space-y-6"
      >
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 lg:hidden">
          <TabsTrigger value="profile">ข้อมูลส่วนตัว</TabsTrigger>
          <TabsTrigger value="wallet">{t("account.wallet")}</TabsTrigger>
          <TabsTrigger value="addresses">{t("account.addresses")}</TabsTrigger>
          <TabsTrigger value="tax">{t("account.taxInvoice")}</TabsTrigger>
          <TabsTrigger value="documents">เอกสาร</TabsTrigger>
          {showCreditPanel(hasCreditAccount) && (
            <TabsTrigger value="credit">เครดิต</TabsTrigger>
          )}
          <TabsTrigger value="settings">{t("account.settings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ข้อมูลบัญชี</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input id="email" value={profile.email ?? ""} disabled />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>ประเภทผู้ซื้อ</Label>
                  <Select
                    value={customerType}
                    onValueChange={(v) =>
                      setCustomerType(v as "individual" | "juristic")
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
                {customerType === "individual" ? (
                  <div className="grid gap-2">
                    <Label htmlFor="nationalId">เลขบัตรประชาชน</Label>
                    <Input
                      id="nationalId"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="companyTaxId">เลขผู้เสียภาษี</Label>
                      <Input
                        id="companyTaxId"
                        value={companyTaxId}
                        onChange={(e) => setCompanyTaxId(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="companyBranch">
                        สาขา (00000 = สำนักงานใหญ่)
                      </Label>
                      <Input
                        id="companyBranch"
                        value={companyBranch}
                        onChange={(e) => setCompanyBranch(e.target.value)}
                      />
                    </div>
                  </>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="phone">เบอร์โทร</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08x-xxx-xxxx"
                  />
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    บันทึก
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-3 p-6 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">ระดับสมาชิก</p>
                <p className="font-medium">{tierLabel(profile.memberTier)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">สถานะบัญชี</p>
                <Badge variant="secondary">{profile.accountStatus}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">คำสั่งซื้อทั้งหมด</p>
                <p className="font-medium">{profile.orderCount} รายการ</p>
              </div>
              <div>
                <p className="text-muted-foreground">ยอดซื้อสะสม</p>
                <p className="font-medium">{formatPrice(profile.totalSpent)}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet" className="space-y-4">
          {tabLoading ? (
            <TabLoading />
          ) : (
            <>
              {tierProgress ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">ระดับสมาชิก</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{tierProgress.currentTierName}</Badge>
                      {tierProgress.discountPct > 0 ? (
                        <span className="text-muted-foreground">
                          ส่วนลด {tierProgress.discountPct}%
                        </span>
                      ) : null}
                    </div>
                    <p>
                      ยอดซื้อสะสม {formatPrice(tierProgress.totalSpent)}
                      {tierProgress.nextTierName ? (
                        <>
                          {" "}
                          · อีก {formatPrice(
                            tierProgress.amountToNext ?? 0,
                          )}{" "}
                          ถึง {tierProgress.nextTierName}
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
                      {formatPrice(walletBalance)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">รอดำเนินการ</p>
                    <p className="text-2xl font-semibold">
                      {formatPrice(walletPending)}
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
                    onSubmit={handleSubmitTopup}
                    className="grid gap-4 sm:max-w-md"
                  >
                    <div className="grid gap-2">
                      <Label htmlFor="topup-amount">จำนวนเงิน (บาท)</Label>
                      <Input
                        id="topup-amount"
                        type="number"
                        min={100}
                        step={1}
                        value={topupAmount}
                        onChange={(e) => setTopupAmount(e.target.value)}
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
                          setTopupSlipFile(e.target.files?.[0] ?? null)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        โอนเข้าบัญชีร้านตามหน้า checkout แล้วแนบสลิป
                      </p>
                    </div>
                    <Button type="submit" disabled={submittingTopup}>
                      {submittingTopup ? "กำลังส่ง..." : "ส่งคำขอเติมเงิน"}
                    </Button>
                    {activeTopupId ? (
                      <p className="text-xs text-muted-foreground">
                        คำขอล่าสุด: {activeTopupId.slice(0, 8)}…
                      </p>
                    ) : null}
                  </form>
                </CardContent>
              </Card>

              {topupRequests.some((r) => r.status === "pending") ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">คำขอเติมเงิน</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topupRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm"
                      >
                        <div>
                          <p className="font-medium">
                            {formatPrice(req.amount)}
                          </p>
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
                              if (file)
                                void handleUploadTopupSlip(req.id, file);
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
                  {walletTxs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      ยังไม่มีธุรกรรม
                    </p>
                  ) : (
                    walletTxs.map((tx) => (
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
            </>
          )}
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4">
          {tabLoading ? (
            <TabLoading />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {editingAddressId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่จัดส่ง"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveAddress} className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>ชื่อที่อยู่ (เช่น บ้าน, ออฟฟิศ)</Label>
                        <Input
                          value={addressForm.label}
                          onChange={(e) =>
                            setAddressForm((f) => ({
                              ...f,
                              label: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>ชื่อผู้รับ</Label>
                        <Input
                          value={addressForm.recipientName}
                          onChange={(e) =>
                            setAddressForm((f) => ({
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
                          value={addressForm.phone}
                          onChange={(e) =>
                            setAddressForm((f) => ({
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
                          value={addressForm.line1}
                          onChange={(e) =>
                            setAddressForm((f) => ({
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
                          value={addressForm.district}
                          onChange={(e) =>
                            setAddressForm((f) => ({
                              ...f,
                              district: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>จังหวัด</Label>
                        <Input
                          value={addressForm.province}
                          onChange={(e) =>
                            setAddressForm((f) => ({
                              ...f,
                              province: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>รหัสไปรษณีย์</Label>
                        <Input
                          value={addressForm.postalCode}
                          onChange={(e) =>
                            setAddressForm((f) => ({
                              ...f,
                              postalCode: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <Switch
                          checked={addressForm.isDefault}
                          onCheckedChange={(checked) =>
                            setAddressForm((f) => ({
                              ...f,
                              isDefault: checked,
                            }))
                          }
                        />
                        <Label>ตั้งเป็นที่อยู่หลัก</Label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={savingAddress}>
                        {savingAddress && (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        )}
                        บันทึกที่อยู่
                      </Button>
                      {editingAddressId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingAddressId(null);
                            setAddressForm(emptyAddress);
                          }}
                        >
                          ยกเลิก
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {addresses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    ยังไม่มีที่อยู่
                  </p>
                ) : (
                  addresses.map((addr) => (
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
                            onClick={() => {
                              setEditingAddressId(addr.id);
                              setAddressForm({
                                label: addr.label ?? "",
                                recipientName: addr.recipientName ?? "",
                                phone: addr.phone ?? "",
                                line1: addr.line1,
                                line2: addr.line2 ?? "",
                                district: addr.district ?? "",
                                province: addr.province ?? "",
                                postalCode: addr.postalCode ?? "",
                                isDefault: addr.isDefault,
                              });
                            }}
                          >
                            แก้ไข
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void handleDeleteAddress(addr.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          {tabLoading ? (
            <TabLoading />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {editingTaxId
                      ? "แก้ไขข้อมูลใบกำกับภาษี"
                      : "เพิ่มข้อมูลใบกำกับภาษี"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveTax} className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2 sm:col-span-2">
                        <Label>ชื่อบริษัท / นิติบุคคล</Label>
                        <Input
                          value={taxForm.companyName}
                          onChange={(e) =>
                            setTaxForm((f) => ({
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
                          value={taxForm.taxId}
                          onChange={(e) =>
                            setTaxForm((f) => ({ ...f, taxId: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>รหัสสาขา</Label>
                        <Input
                          value={taxForm.branchCode}
                          onChange={(e) =>
                            setTaxForm((f) => ({
                              ...f,
                              branchCode: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2 sm:col-span-2">
                        <Label>ที่อยู่ในใบกำกับ</Label>
                        <Textarea
                          value={taxForm.address}
                          onChange={(e) =>
                            setTaxForm((f) => ({
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
                          value={taxForm.email}
                          onChange={(e) =>
                            setTaxForm((f) => ({ ...f, email: e.target.value }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>เบอร์โทร</Label>
                        <Input
                          value={taxForm.phone}
                          onChange={(e) =>
                            setTaxForm((f) => ({ ...f, phone: e.target.value }))
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <Switch
                          checked={taxForm.isDefault}
                          onCheckedChange={(checked) =>
                            setTaxForm((f) => ({ ...f, isDefault: checked }))
                          }
                        />
                        <Label>ตั้งเป็นข้อมูลหลัก</Label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={savingTax}>
                        {savingTax && (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        )}
                        บันทึก
                      </Button>
                      {editingTaxId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingTaxId(null);
                            setTaxForm(emptyTax);
                          }}
                        >
                          ยกเลิก
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {taxProfiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    ยังไม่มีข้อมูลใบกำกับภาษี
                  </p>
                ) : (
                  taxProfiles.map((tax) => (
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
                            onClick={() => {
                              setEditingTaxId(tax.id);
                              setTaxForm({
                                companyName: tax.companyName,
                                taxId: tax.taxId,
                                branchCode: tax.branchCode ?? "",
                                address: tax.address,
                                email: tax.email ?? "",
                                phone: tax.phone ?? "",
                                isDefault: tax.isDefault,
                              });
                            }}
                          >
                            แก้ไข
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void handleDeleteTax(tax.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <DocumentsPanel customerType={customerType} />
        </TabsContent>

        {showCreditPanel(hasCreditAccount) && (
          <TabsContent value="credit" className="space-y-4">
            <CreditPanel />
          </TabsContent>
        )}

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">การตั้งค่า</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 max-w-xs">
                <Label>ภาษา / Language</Label>
                <Select
                  value={locale}
                  onValueChange={(v) => setLocale(v as "th" | "en")}
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
                onClick={() => void saveProfileData("บันทึกการตั้งค่าแล้ว")}
                disabled={savingProfile}
              >
                {savingProfile && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                บันทึกการตั้งค่า
              </Button>
              <Separator />
              <div>
                <p className="mb-2 text-sm text-muted-foreground">
                  ออกจากระบบจากอุปกรณ์นี้
                </p>
                <Button variant="outline" onClick={() => void signOut()}>
                  {t("nav.logout")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TabLoading() {
  return (
    <div className="flex min-h-[24vh] items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
