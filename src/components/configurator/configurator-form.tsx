import { ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";

import { ProductImage } from "@/components/storefront/product-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n";
import { buildConfiguratorShareUrl } from "@/lib/configurator-share";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  ConfiguratorCatalog,
  ConfiguratorDraft,
  ConfiguratorPriceBreakdown,
} from "@/domain/configurator";

type Props = {
  catalog: ConfiguratorCatalog;
  draft: ConfiguratorDraft;
  onDraftChange: (draft: ConfiguratorDraft) => void;
  onResetProduct: () => void;
  price: ConfiguratorPriceBreakdown | null;
  submitting: boolean;
  onAddToCart: () => void;
};

export function ConfiguratorForm({
  catalog,
  draft,
  onDraftChange,
  onResetProduct,
  price,
  submitting,
  onAddToCart,
}: Props) {
  const { t } = useT();
  const selectedType = catalog.productTypes.find(
    (o) => o.key === draft.productType,
  );
  const selectedFabric = catalog.fabrics.find((f) => f.id === draft.fabricId);
  const selectedRail = catalog.railOptions.find(
    (o) => o.key === draft.railOptionKey,
  );
  const selectedInstall = catalog.installationOptions.find(
    (o) => o.key === draft.installationOptionKey,
  );

  const canAddToCart =
    !!draft.productType &&
    !!draft.fabricId &&
    !!draft.railOptionKey &&
    !!draft.installationOptionKey &&
    !!price;

  async function handleShare() {
    const url = buildConfiguratorShareUrl(draft);
    try {
      if (navigator.share) {
        await navigator.share({ title: "WP ALL Custom", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success(t("configurator.shareCopied"));
    } catch {
      toast.error(t("configurator.shareFailed"));
    }
  }

  return (
    <div className="flex min-w-0 max-h-[calc(100vh-8rem)] flex-col rounded-xl border bg-card md:max-h-[calc(100vh-6rem)] md:z-10">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden p-4">
        <div className="space-y-2">
          <button
            type="button"
            onClick={onResetProduct}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            เปลี่ยนสินค้า | Change product
          </button>
          {selectedType && (
            <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm font-medium">
              {selectedType.label}
            </p>
          )}
        </div>

        <OptionSection step={1} title="เลือกผ้าและสี | SELECT FABRIC">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {catalog.fabrics.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onDraftChange({ ...draft, fabricId: f.id })}
                className={cn(
                  "min-w-0 overflow-hidden rounded-lg border p-2 text-left text-xs transition",
                  draft.fabricId === f.id
                    ? "border-primary ring-2 ring-primary"
                    : "hover:border-primary/50",
                )}
              >
                {f.swatchUrl ? (
                  <div className="relative mb-1.5 aspect-square w-full overflow-hidden rounded border bg-muted">
                    <ProductImage src={f.swatchUrl} alt={f.name} fill />
                  </div>
                ) : (
                  <span
                    className="mb-1.5 inline-block size-8 rounded-full border"
                    style={{ background: f.colorHex ?? "#ccc" }}
                  />
                )}
                <p className="truncate font-medium">{f.name}</p>
                <p className="text-muted-foreground">
                  {formatPrice(f.pricePerMeter)}/ม.
                </p>
              </button>
            ))}
          </div>
        </OptionSection>

        <OptionSection step={2} title="กรอกขนาด | DIMENSIONS">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>กว้าง (ซม.)</Label>
              <Input
                type="number"
                value={draft.widthCm}
                onChange={(e) =>
                  onDraftChange({
                    ...draft,
                    widthCm: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>สูง (ซม.)</Label>
              <Input
                type="number"
                value={draft.heightCm}
                onChange={(e) =>
                  onDraftChange({
                    ...draft,
                    heightCm: Number(e.target.value),
                  })
                }
              />
            </div>
            <p className="text-xs text-muted-foreground sm:col-span-2">
              {catalog.limits.minWidthCm}-{catalog.limits.maxWidthCm} x{" "}
              {catalog.limits.minHeightCm}-{catalog.limits.maxHeightCm} ซม.
            </p>
          </div>
        </OptionSection>

        <OptionSection step={3} title="เลือกราง | SELECT RAIL">
          <div className="grid gap-2">
            {catalog.railOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() =>
                  onDraftChange({ ...draft, railOptionKey: opt.key })
                }
                className={cn(
                  "flex min-w-0 items-center gap-3 overflow-hidden rounded-lg border p-2 text-left transition",
                  draft.railOptionKey === opt.key
                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                    : "hover:border-primary/50",
                )}
              >
                {opt.imageUrl && (
                  <div className="relative size-12 shrink-0 overflow-hidden rounded border bg-muted">
                    <ProductImage src={opt.imageUrl} alt={opt.label} fill />
                  </div>
                )}
                <span className="min-w-0 text-sm font-medium">
                  {opt.label} (+{formatPrice(opt.priceDelta)})
                </span>
              </button>
            ))}
          </div>
        </OptionSection>

        <OptionSection step={4} title="บริการติดตั้ง | INSTALLATION">
          <div className="grid gap-2">
            {catalog.installationOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() =>
                  onDraftChange({
                    ...draft,
                    installationOptionKey: opt.key,
                  })
                }
                className={cn(
                  "flex min-w-0 items-center gap-3 overflow-hidden rounded-lg border p-2 text-left transition",
                  draft.installationOptionKey === opt.key
                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                    : "hover:border-primary/50",
                )}
              >
                {opt.imageUrl && (
                  <div className="relative size-12 shrink-0 overflow-hidden rounded border bg-muted">
                    <ProductImage src={opt.imageUrl} alt={opt.label} fill />
                  </div>
                )}
                <span className="min-w-0 text-sm font-medium">
                  {opt.label}
                  {opt.priceDelta > 0
                    ? ` (+${formatPrice(opt.priceDelta)})`
                    : ""}
                </span>
              </button>
            ))}
          </div>
        </OptionSection>

        <Card className="border-muted bg-muted/30">
          <CardContent className="space-y-2 p-4">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground">
              CURRENT SUMMARY | สรุป
            </h3>
            <dl className="space-y-1 text-xs">
              <SummaryRow label="สินค้า" value={selectedType?.label} />
              <SummaryRow label="ผ้า/สี" value={selectedFabric?.name} />
              <SummaryRow
                label="ขนาด"
                value={`${draft.widthCm} x ${draft.heightCm} ซม.`}
              />
              <SummaryRow label="ราง" value={selectedRail?.label} />
              <SummaryRow label="ติดตั้ง" value={selectedInstall?.label} />
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="shrink-0 space-y-2 border-t bg-card p-4">
        <div className="mb-3 flex items-end justify-between gap-2">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground">
            LIVE PRICE | ราคา
          </span>
          <span className="text-2xl font-bold text-accent">
            {price ? formatPrice(price.total) : "—"}
          </span>
        </div>
        <Button
          type="button"
          disabled={submitting || !canAddToCart}
          className="w-full bg-accent hover:bg-accent/90"
          onClick={onAddToCart}
        >
          {submitting ? "กำลังใส่ตะกร้า..." : "ADD TO CART | ใส่ตะกร้า"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={!draft.productType || !draft.fabricId}
          onClick={() => void handleShare()}
        >
          <Share2 className="size-4" />
          {t("configurator.share")}
        </Button>
      </div>
    </div>
  );
}

function OptionSection({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 space-y-3">
      <h2 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-foreground">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
          {step}
        </span>
        <span className="min-w-0">{title}</span>
      </h2>
      {children}
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-2 text-muted-foreground">
      <dt>{label}</dt>
      <dd className="text-right font-medium text-foreground">{value ?? "—"}</dd>
    </div>
  );
}
