import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PreviewPanel } from "@/components/configurator/preview-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CONFIGURATOR_STEPS,
  type ConfiguratorCatalog,
  type ConfiguratorDraft,
  type ConfiguratorPriceBreakdown,
  type ConfiguratorStep,
  canProceedStep,
} from "@/domain/configurator";

const STEP_LABELS: Record<ConfiguratorStep, string> = {
  product_type: "เลือกประเภทสินค้า",
  fabric: "เลือกผ้าและสี",
  dimensions: "กรอกขนาด",
  rails: "เลือกราง/อุปกรณ์",
  installation: "บริการติดตั้ง",
  summary: "สรุปราคา",
};

export function ConfiguratorWizard() {
  const { session } = useAuth();
  const { refresh } = useCart();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<ConfiguratorCatalog | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<ConfiguratorDraft>({
    productType: null,
    fabricId: null,
    widthCm: 200,
    heightCm: 220,
    railOptionKey: null,
    installationOptionKey: null,
  });
  const [price, setPrice] = useState<ConfiguratorPriceBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const step = CONFIGURATOR_STEPS[stepIndex];

  useEffect(() => {
    void fetchConfiguratorCatalog()
      .then(setCatalog)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!catalog || step === "product_type" || step === "fabric") return;
    void calculateConfiguratorPrice({ data: draft })
      .then(setPrice)
      .catch(() => setPrice(null));
  }, [draft, catalog, step]);

  if (loading || !catalog) {
    return <p className="text-muted-foreground">กำลังโหลด...</p>;
  }

  const selectedFabric = catalog.fabrics.find((f) => f.id === draft.fabricId);

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
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <PreviewPanel
        fabric={selectedFabric ?? null}
        widthCm={draft.widthCm}
        heightCm={draft.heightCm}
      />

      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-3 p-4">
            {CONFIGURATOR_STEPS.map((s, index) => (
              <button
                key={s}
                type="button"
                onClick={() => setStepIndex(index)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm ${
                  index === stepIndex ? "border-primary bg-primary/5" : ""
                }`}
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-muted font-medium">
                  {index + 1}
                </span>
                <span>{STEP_LABELS[s]}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="font-semibold">{STEP_LABELS[step]}</h2>

            {step === "product_type" && (
              <div className="grid gap-2">
                {catalog.productTypes.map((opt) => (
                  <Button
                    key={opt.key}
                    type="button"
                    variant={
                      draft.productType === opt.key ? "default" : "outline"
                    }
                    onClick={() =>
                      setDraft({
                        ...draft,
                        productType:
                          opt.key as ConfiguratorDraft["productType"],
                      })
                    }
                  >
                    {opt.label}
                    {opt.priceDelta > 0
                      ? ` (+${formatPrice(opt.priceDelta)})`
                      : ""}
                  </Button>
                ))}
              </div>
            )}

            {step === "fabric" && (
              <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto">
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
            )}

            {step === "dimensions" && (
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
                <p className="sm:col-span-2 text-xs text-muted-foreground">
                  {catalog.limits.minWidthCm}-{catalog.limits.maxWidthCm} x{" "}
                  {catalog.limits.minHeightCm}-{catalog.limits.maxHeightCm} ซม.
                </p>
              </div>
            )}

            {step === "rails" && (
              <div className="grid gap-2">
                {catalog.railOptions.map((opt) => (
                  <Button
                    key={opt.key}
                    type="button"
                    variant={
                      draft.railOptionKey === opt.key ? "default" : "outline"
                    }
                    onClick={() =>
                      setDraft({ ...draft, railOptionKey: opt.key })
                    }
                  >
                    {opt.label} (+{formatPrice(opt.priceDelta)})
                  </Button>
                ))}
              </div>
            )}

            {step === "installation" && (
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
            )}

            {step === "summary" && price && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>ผ้า</span>
                  <span>{formatPrice(price.fabricCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>อุปกรณ์</span>
                  <span>{formatPrice(price.optionsCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ติดตั้ง</span>
                  <span>{formatPrice(price.installationCost)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>รวม</span>
                  <span className="text-accent">
                    {formatPrice(price.total)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {stepIndex > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStepIndex(stepIndex - 1)}
                >
                  ย้อนกลับ
                </Button>
              )}
              {stepIndex < CONFIGURATOR_STEPS.length - 1 ? (
                <Button
                  type="button"
                  disabled={!canProceedStep(step, draft)}
                  onClick={() => setStepIndex(stepIndex + 1)}
                >
                  ถัดไป
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={submitting || !price}
                  className="bg-accent hover:bg-accent/90"
                  onClick={() => void handleAddToCart()}
                >
                  {submitting ? "กำลังใส่ตะกร้า..." : "ใส่ตะกร้า"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
