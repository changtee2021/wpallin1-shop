import { Check, Copy, Phone } from "lucide-react";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useDealerAccount } from "@/hooks/use-dealer-account";
import { dealerBusinessTypeLabel } from "@/lib/dealer.constants";
import { dealerProvinceName } from "@/lib/dealer-provinces";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

const TIER_LABELS: Record<string, string> = {
  silver_dealer: "Silver",
  gold_dealer: "Gold",
  platinum_dealer: "Platinum",
  retail: "Retail",
};

/** The dealer's "member card": code they quote to sales, who looks after them, and the shop on file. */
export function DealerIdentityCard() {
  const { data: account, isLoading } = useDealerAccount();
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return <Skeleton className="mb-8 h-56 w-full rounded-lg" />;
  }
  if (!account?.dealerCode) return null;

  async function copyCode() {
    if (!account?.dealerCode) return;
    await navigator.clipboard.writeText(account.dealerCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const shopRows = [
    { label: "ร้าน / บริษัท", value: account.companyName },
    { label: "ผู้ติดต่อ", value: account.contactName },
    { label: "โทร", value: account.phone },
    { label: "อีเมล", value: account.email },
    {
      label: "ประเภท",
      value: account.businessType
        ? dealerBusinessTypeLabel(account.businessType)
        : null,
    },
    {
      label: "เลขผู้เสียภาษี",
      value: account.companyTaxId
        ? `${account.companyTaxId}${account.companyBranch ? ` · ${account.companyBranch}` : ""}`
        : null,
    },
    { label: "ที่อยู่", value: account.address },
  ].filter((row) => row.value);

  return (
    <section className="mb-8 overflow-hidden rounded-lg border border-border">
      <div className="grid gap-px bg-border lg:grid-cols-[1.1fr_1fr]">
        <div className="relative bg-primary-deep p-6 text-white sm:p-8">
          <p className="brand-kicker flex items-center gap-3 text-accent">
            <span aria-hidden className="h-px w-8 bg-white/30" />
            Dealer
          </p>
          <div className="mt-6 flex items-end gap-3">
            <p className="font-mono text-[clamp(1.75rem,4vw,2.5rem)] leading-none tracking-wide">
              {account.dealerCode}
            </p>
            <button
              type="button"
              onClick={() => void copyCode()}
              className="mb-0.5 flex size-11 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="คัดลอกรหัสตัวแทน"
            >
              {copied ? (
                <Check className="size-4" aria-hidden />
              ) : (
                <Copy className="size-4" aria-hidden />
              )}
            </button>
          </div>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-white/15 pt-5 text-sm">
            <div>
              <dt className="text-white/55">ระดับ</dt>
              <dd className="mt-1">
                {TIER_LABELS[account.memberTier] ?? account.memberTier}
              </dd>
            </div>
            <div>
              <dt className="text-white/55">จังหวัด</dt>
              <dd className="mt-1 truncate">
                {dealerProvinceName(account.provinceCode) || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-white/55">ตัวแทนตั้งแต่</dt>
              <dd className="mt-1">
                {account.dealerSince ? formatDate(account.dealerSince) : "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col bg-background p-6 sm:p-8">
          <p className="brand-kicker text-primary">เซลที่ดูแล</p>
          <p className="mt-4 text-xl font-medium tracking-tight">
            {account.salesRep?.name ?? "ทีมขาย WP ALL"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            สั่งพิเศษ ขอราคาโครงการ หรือเช็กของ ทักเซลได้โดยตรง
          </p>
          <div className="mt-auto flex flex-wrap gap-2 pt-6">
            <a
              href={siteConfig.lineUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center rounded-full bg-[#06C755] px-5 text-sm font-medium text-white transition-colors hover:bg-[#05b34c]"
            >
              LINE {siteConfig.lineId}
            </a>
            <a
              href={`tel:${(account.salesRep?.phone ?? siteConfig.phoneTel).replace(/[^\d+]/g, "")}`}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Phone className="size-4" aria-hidden />
              {account.salesRep?.phone ?? siteConfig.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      {shopRows.length > 0 ? (
        <dl className="grid divide-y divide-border border-t border-border sm:grid-cols-2 sm:divide-y-0">
          {shopRows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[7rem_1fr] gap-4 border-border px-6 py-3 text-sm sm:border-b sm:px-8 sm:odd:border-r"
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="min-w-0 break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
