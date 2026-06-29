import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AccountDashboard } from "@/components/account/account-dashboard";
import {
  AccountSettingsSections,
  type SettingsSectionId,
} from "@/components/account/account-settings-sections";
import { PageHeader } from "@/components/layout/page-header";
import { PageLoading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  deleteAccountAddress,
  deleteTaxInvoiceProfileFn,
  fetchAccountAddresses,
  fetchAccountProfile,
  fetchCreditSummary,
  fetchMyOrders,
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
import {
  authServerFnOptions,
  useAuthServerFnOptions,
} from "@/lib/server-fn-auth";
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
import type { CreditAccountDto } from "@/services/credit.service";
import type { OrderSummaryDto } from "@/types/api/orders";

const accountTabSchema = z.enum(["dashboard", "settings"]);
const settingsSectionSchema = z.enum([
  "personal",
  "finance",
  "address-tax",
  "system",
]);

export const Route = createFileRoute("/account/")({
  validateSearch: (search) => ({
    tab: accountTabSchema.catch("dashboard").parse(search.tab ?? "dashboard"),
    section: settingsSectionSchema
      .catch("personal")
      .parse(search.section ?? "personal"),
  }),
  component: AccountPage,
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

function AccountPage() {
  const { t } = useT();
  const { setLocale: applyLocale } = useLocaleControl();
  const { session, signOut, loading: authLoading } = useAuth();
  const { tab, section } = Route.useSearch();

  const [profile, setProfile] = useState<AccountProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
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

  const [recentOrders, setRecentOrders] = useState<OrderSummaryDto[]>([]);
  const [creditAccount, setCreditAccount] = useState<CreditAccountDto | null>(
    null,
  );

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

  const loadDashboard = useCallback(async () => {
    const [orders, creditSummary] = await Promise.all([
      fetchMyOrders(authOpts),
      fetchCreditSummary(authOpts).catch(() => null),
    ]);
    setRecentOrders(orders);
    setCreditAccount(creditSummary?.account ?? null);
  }, [authOpts]);

  const loadAddresses = useCallback(async () => {
    setAddresses(await fetchAccountAddresses(authOpts));
  }, [authOpts]);

  const loadTaxProfiles = useCallback(async () => {
    setTaxProfiles(await fetchTaxInvoiceProfiles(authOpts));
  }, [authOpts]);

  useEffect(() => {
    if (authLoading || !session?.access_token) return;

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
  }, [authLoading, loadProfile, session?.access_token]);

  useEffect(() => {
    if (!profile) return;

    if (tab === "dashboard") {
      let cancelled = false;
      setDashboardLoading(true);
      void loadDashboard()
        .catch((err) =>
          toast.error(err instanceof Error ? err.message : "โหลดไม่สำเร็จ"),
        )
        .finally(() => {
          if (!cancelled) setDashboardLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }

    if (tab === "settings") {
      let cancelled = false;
      setSettingsLoading(true);
      const loaders: Promise<unknown>[] = [];
      if (section === "finance") {
        loaders.push(loadWallet());
      }
      if (section === "address-tax") {
        loaders.push(loadAddresses(), loadTaxProfiles());
      }
      void Promise.all(loaders)
        .catch((err) =>
          toast.error(err instanceof Error ? err.message : "โหลดไม่สำเร็จ"),
        )
        .finally(() => {
          if (!cancelled) setSettingsLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }
  }, [
    tab,
    section,
    profile,
    loadDashboard,
    loadWallet,
    loadAddresses,
    loadTaxProfiles,
  ]);

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

  if (authLoading || loading || !profile) {
    return <PageLoading variant="dashboard" />;
  }

  const settingsSectionTitles: Record<SettingsSectionId, string> = {
    personal: "ข้อมูลส่วนตัว",
    finance: "การเงิน",
    "address-tax": "ที่อยู่และภาษี",
    system: "ระบบ",
  };

  return (
    <div>
      <PageHeader
        title={
          tab === "settings"
            ? settingsSectionTitles[section]
            : t("account.dashboard")
        }
        description={
          tab === "settings"
            ? "จัดการข้อมูลส่วนตัว การเงิน ที่อยู่ และระบบ"
            : "ภาพรวมบัญชีและกิจกรรมล่าสุดของคุณ"
        }
      />

      {tab === "dashboard" ? (
        <AccountDashboard
          profile={profile}
          creditAccount={creditAccount}
          recentOrders={recentOrders}
          loading={dashboardLoading}
        />
      ) : (
        <AccountSettingsSections
          section={section}
          loading={
            settingsLoading &&
            (section === "finance" || section === "address-tax")
          }
          profile={profile}
          onProfileRefresh={() => void loadProfile()}
          hasCreditAccount={hasCreditAccount}
          customerType={customerType}
          setCustomerType={setCustomerType}
          fullName={fullName}
          setFullName={setFullName}
          phone={phone}
          setPhone={setPhone}
          nationalId={nationalId}
          setNationalId={setNationalId}
          companyTaxId={companyTaxId}
          setCompanyTaxId={setCompanyTaxId}
          companyBranch={companyBranch}
          setCompanyBranch={setCompanyBranch}
          savingProfile={savingProfile}
          onSaveProfile={handleSaveProfile}
          walletBalance={walletBalance}
          walletPending={walletPending}
          walletTxs={walletTxs}
          tierProgress={tierProgress}
          topupRequests={topupRequests}
          topupAmount={topupAmount}
          setTopupAmount={setTopupAmount}
          topupSlipFile={topupSlipFile}
          setTopupSlipFile={setTopupSlipFile}
          activeTopupId={activeTopupId}
          submittingTopup={submittingTopup}
          onSubmitTopup={handleSubmitTopup}
          onUploadTopupSlip={(id, file) => void handleUploadTopupSlip(id, file)}
          addresses={addresses}
          addressForm={addressForm}
          setAddressForm={setAddressForm}
          editingAddressId={editingAddressId}
          setEditingAddressId={setEditingAddressId}
          savingAddress={savingAddress}
          onSaveAddress={handleSaveAddress}
          onDeleteAddress={(id) => void handleDeleteAddress(id)}
          onEditAddress={(addr) => {
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
          onCancelAddressEdit={() => {
            setEditingAddressId(null);
            setAddressForm(emptyAddress);
          }}
          taxProfiles={taxProfiles}
          taxForm={taxForm}
          setTaxForm={setTaxForm}
          editingTaxId={editingTaxId}
          setEditingTaxId={setEditingTaxId}
          savingTax={savingTax}
          onSaveTax={handleSaveTax}
          onDeleteTax={(id) => void handleDeleteTax(id)}
          onEditTax={(tax) => {
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
          onCancelTaxEdit={() => {
            setEditingTaxId(null);
            setTaxForm(emptyTax);
          }}
          locale={locale}
          setLocale={setLocale}
          onSaveSettings={() => void saveProfileData("บันทึกการตั้งค่าแล้ว")}
          onSignOut={() => void signOut()}
        />
      )}
    </div>
  );
}
