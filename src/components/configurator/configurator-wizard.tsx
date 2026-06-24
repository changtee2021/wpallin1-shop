import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { ConfiguratorProductGrid } from "@/components/configurator/configurator-product-grid";
import { PreviewPanel } from "@/components/configurator/preview-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import {
  addConfiguratorToCart,
  calculateConfiguratorPrice,
  fetchConfiguratorCatalog,
  saveConfiguratorConfiguration,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { getOrCreateCartSessionId } from "@/lib/cart-session";
import { formatPrice } from "@/lib/format";
import {
  type ConfiguratorCatalog,
  type ConfiguratorDraft,
  type ConfiguratorPriceBreakdown,
} from "@/domain/configurator";

const INITIAL_DRAFT: ConfiguratorDraft = {
  productType: null,
  fabricId: null,
  widthCm: 200,
  heightCm: 220,
  railOptionKey: null,
  installationOptionKey: null,
};

export function ConfiguratorWizard({
  initialCatalog = null,
  initialError = null,
}: {
  initialCatalog?: ConfiguratorCatalog | null;
  initialError?: string | null;
}) {
  const { session } = useAuth();
  const { refresh } = useCart();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<ConfiguratorCatalog | null>(
    initialCatalog,
  );
  const [loadError, setLoadError] = useState<string | null>(initialError);
  const [draft, setDraft] = useState<ConfiguratorDraft>(INITIAL_DRAFT);
  const [price, setPrice] = useState<ConfiguratorPriceBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchConfiguratorCatalog();
      setCatalog(data);
    } catch (err) {
      setCatalog(null);
      setLoadError(
        err instanceof Error ? err.message : "โหลดข้อมูล Custom ไม่สำเร็จ",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCatalog(initialCatalog);
    setLoadError(initialError);
  }, [initialCatalog, initialError]);

  useEffect(() => {
    if (!catalog || !draft.productType || !draft.fabricId) {
      setPrice(null);
      return;
    }
    void calculateConfiguratorPrice({ data: draft })
      .then(setPrice)
      .catch(() => setPrice(null));
  }, [draft, catalog]);

  if (loading) {
    return <ConfiguratorLoadingSkeleton />;
  }

  if (loadError || !catalog) {
    return (
      <Card className="border-dashed">
        <CardContent className="space-y-4 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {loadError ?? "โหลดข้อมูล Custom ไม่สำเร็จ"}
          </p>
          <p className="text-xs text-muted-foreground">
            Unable to load custom products | ไม่สามารถโหลดรายการสินค้าสั่งทำได้
          </p>
          <Button type="button" variant="outline" onClick={() => void loadCatalog()}>
            <RefreshCw className="size-4" />
            ลองใหม่ | Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Phase 1 — pick a product before customizing
  if (!draft.productType) {
    return (
      <ConfiguratorProductGrid
        productTypes={catalog.productTypes}
        onSelect={(key) =>
          setDraft({
            ...INITIAL_DRAFT,
            productType: key as ConfiguratorDraft["productType"],
          })
        }
      />
    );
  }

  // Phase 2 — customize the selected product
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

  async function handleAddToCart() {
    if (
      !draft.productType ||
      !draft.fabricId ||
      !draft.railOptionKey ||
      !draft.installationOptionKey
    ) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    setSubmitting(true);
    try {
      const saved = await saveConfiguratorConfiguration({
        data: {
          productType: draft.productType,
          fabricId: draft.fabricId,
          widthCm: draft.widthCm,
          heightCm: draft.heightCm,
          railOptionKey: draft.railOptionKey,
          installationOptionKey: draft.installationOptionKey,
        },
        ...authServerFnOptions(session),
      });
      await addConfiguratorToCart({
        data: {
          configurationId: saved.configurationId,
          sessionId: getOrCreateCartSessionId(),
        },
        ...authServerFnOptions(session),
      });
      await refresh();
      toast.success("ใส่ตะกร้าแล้ว");
      void navigate({ to: "/cart" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setDraft(INITIAL_DRAFT)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        เปลี่ยนสินค้า | Change product
      </button>

      <div className="space-y-6">
        <PreviewPanel
          fabric={selectedFabric ?? null}
          productImageUrl={selectedType?.imageUrl}
          productLabel={selectedType?.label}
          widthCm={draft.widthCm}
          heightCm={draft.heightCm}
        />

        <div className="space-y-4">
          <OptionSection step={1} title="เลือกผ้าและสี">
            <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto">
              {catalog.fabrics.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setDraft({ ...draft, fabricId: f.id })}
                  className={`rounded border p-2 text-left text-xs ${
                    draft.fabricId === f.id
                      ? "border-primary ring-1 ring-primary"
                      : ""
                  }`}
                >
                  <span
                    className="mb-1 inline-block size-4 rounded-full border"
                    style={{ background: f.colorHex ?? "#ccc" }}
                  />
                  <p className="font-medium">{f.name}</p>
                  <p className="text-muted-foreground">
                    {formatPrice(f.pricePerMeter)}/ม.
                  </p>
                </button>
              ))}
            </div>
          </OptionSection>

          <OptionSection step={2} title="เลือกราง / อุปกรณ์">
            <div className="grid gap-2">
              {catalog.railOptions.map((opt) => (
                <Button
                  key={opt.key}
                  type="button"
                  variant={
                    draft.railOptionKey === opt.key ? "default" : "outline"
                  }
                  onClick={() => setDraft({ ...draft, railOptionKey: opt.key })}
                >
                  {opt.label} (+{formatPrice(opt.priceDelta)})
                </Button>
              ))}
            </div>
          </OptionSection>

          <OptionSection step={3} title="กรอกขนาด">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>กว้าง (ซม.)</Label>
                <Input
                  type="number"
                  value={draft.widthCm}
                  onChange={(e) =>
                    setDraft({ ...draft, widthCm: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>สูง (ซม.)</Label>
                <Input
                  type="number"
                  value={draft.heightCm}
                  onChange={(e) =>
                    setDraft({ ...draft, heightCm: Number(e.target.value) })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground sm:col-span-2">
                {catalog.limits.minWidthCm}-{catalog.limits.maxWidthCm} x{" "}
                {catalog.limits.minHeightCm}-{catalog.limits.maxHeightCm} ซม.
              </p>
            </div>
          </OptionSection>

          <OptionSection step={4} title="บริการติดตั้ง">
            <div className="grid gap-2">
              {catalog.installationOptions.map((opt) => (
                <Button
                  key={opt.key}
                  type="button"
                  variant={
                    draft.installationOptionKey === opt.key
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setDraft({ ...draft, installationOptionKey: opt.key })
                  }
                >
                  {opt.label}
                  {opt.priceDelta > 0
                    ? ` (+${formatPrice(opt.priceDelta)})`
                    : ""}
                </Button>
              ))}
            </div>
          </OptionSection>

          <Card className="border-accent/40 bg-accent/5">
            <CardContent className="space-y-3 p-4">
              <h3 className="text-sm font-semibold">Current Summary | สรุป</h3>
              <dl className="space-y-1 text-xs text-muted-foreground">
                <SummaryRow label="สินค้า" value={selectedType?.label} />
                <SummaryRow label="ผ้า/สี" value={selectedFabric?.name} />
                <SummaryRow
                  label="ขนาด"
                  value={`${draft.widthCm} x ${draft.heightCm} ซม.`}
                />
                <SummaryRow label="ราง" value={selectedRail?.label} />
                <SummaryRow label="ติดตั้ง" value={selectedInstall?.label} />
              </dl>

              <div className="flex items-end justify-between border-t pt-3">
                <span className="text-sm font-medium">LIVE PRICE | ราคา</span>
                <span className="text-2xl font-bold text-accent">
                  {price ? formatPrice(price.total) : "—"}
                </span>
              </div>

              <Button
                type="button"
                disabled={submitting || !canAddToCart}
                className="w-full bg-accent hover:bg-accent/90"
                onClick={() => void handleAddToCart()}
              >
                {submitting ? "กำลังใส่ตะกร้า..." : "ADD TO CART | ใส่ตะกร้า"}
              </Button>
            </CardContent>
          </Card>
        </div>
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
    <Card>
      <CardContent className="space-y-3 p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {step}
          </span>
          {title}
        </h2>
        {children}
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt>{label}</dt>
      <dd className="text-right font-medium text-foreground">
        {value ?? "—"}
      </dd>
    </div>
  );
}

function ConfiguratorLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-xl border">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
