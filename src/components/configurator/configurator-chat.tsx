import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ProductImage } from "@/components/storefront/product-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/format";
import {
  CONFIGURATOR_STEPS,
  type ConfiguratorCatalog,
  type ConfiguratorDraft,
  type ConfiguratorPriceBreakdown,
  type ConfiguratorStep,
  validateDimensions,
} from "@/domain/configurator";
import { cn } from "@/lib/utils";

const STEP_PROMPTS: Record<ConfiguratorStep, string> = {
  product_type: "คุณอยากได้ม่านแบบไหนคะ? | Which curtain style?",
  fabric: "เลือกผ้าและสีที่ชอบค่ะ | Pick your fabric and color",
  dimensions: "กรอกขนาดหน้าต่าง (ซม.) | Enter dimensions in cm",
  rails: "เลือกราง / อุปกรณ์ค่ะ | Choose a rail option",
  installation: "ต้องการบริการติดตั้งไหมคะ? | Installation service?",
  summary: "สรุปรายการของคุณ | Your order summary",
};

const INITIAL_DRAFT: ConfiguratorDraft = {
  productType: null,
  fabricId: null,
  widthCm: 200,
  heightCm: 220,
  railOptionKey: null,
  installationOptionKey: null,
};

type ChatMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
  step: ConfiguratorStep;
};

function stepIndex(step: ConfiguratorStep): number {
  return CONFIGURATOR_STEPS.indexOf(step);
}

function clearDraftFromStep(
  draft: ConfiguratorDraft,
  fromStep: ConfiguratorStep,
): ConfiguratorDraft {
  const idx = stepIndex(fromStep);
  const next = { ...draft };
  if (idx <= stepIndex("product_type")) next.productType = null;
  if (idx <= stepIndex("fabric")) next.fabricId = null;
  if (idx <= stepIndex("dimensions")) {
    next.widthCm = INITIAL_DRAFT.widthCm;
    next.heightCm = INITIAL_DRAFT.heightCm;
  }
  if (idx <= stepIndex("rails")) next.railOptionKey = null;
  if (idx <= stepIndex("installation")) next.installationOptionKey = null;
  return next;
}

function answerLabelForStep(
  step: ConfiguratorStep,
  draft: ConfiguratorDraft,
  catalog: ConfiguratorCatalog,
): string {
  switch (step) {
    case "product_type":
      return (
        catalog.productTypes.find((o) => o.key === draft.productType)?.label ??
        ""
      );
    case "fabric":
      return catalog.fabrics.find((f) => f.id === draft.fabricId)?.name ?? "";
    case "dimensions":
      return `${draft.widthCm} x ${draft.heightCm} ซม.`;
    case "rails":
      return (
        catalog.railOptions.find((o) => o.key === draft.railOptionKey)?.label ??
        ""
      );
    case "installation":
      return (
        catalog.installationOptions.find(
          (o) => o.key === draft.installationOptionKey,
        )?.label ?? ""
      );
    default:
      return "";
  }
}

type Props = {
  catalog: ConfiguratorCatalog;
  draft: ConfiguratorDraft;
  onDraftChange: (draft: ConfiguratorDraft) => void;
  price: ConfiguratorPriceBreakdown | null;
  submitting: boolean;
  onAddToCart: () => void;
};

export function ConfiguratorChat({
  catalog,
  draft,
  onDraftChange,
  price,
  submitting,
  onAddToCart,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] =
    useState<ConfiguratorStep>("product_type");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      text: "สวัสดีค่ะ มาออกแบบผ้าม่านสั่งทำกันเลย | Hi! Let's design your custom curtains.",
      step: "product_type",
    },
    {
      id: "prompt-product_type",
      role: "bot",
      text: STEP_PROMPTS.product_type,
      step: "product_type",
    },
  ]);
  const [dimWidth, setDimWidth] = useState(String(draft.widthCm));
  const [dimHeight, setDimHeight] = useState(String(draft.heightCm));

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, currentStep]);

  function advanceToStep(nextStep: ConfiguratorStep) {
    setCurrentStep(nextStep);
    setMessages((prev) => [
      ...prev,
      {
        id: `prompt-${nextStep}-${Date.now()}`,
        role: "bot",
        text: STEP_PROMPTS[nextStep],
        step: nextStep,
      },
    ]);
  }

  function commitAnswer(step: ConfiguratorStep, nextDraft: ConfiguratorDraft) {
    const label = answerLabelForStep(step, nextDraft, catalog);
    if (!label) return;

    onDraftChange(nextDraft);
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${step}-${Date.now()}`,
        role: "user",
        text: label,
        step,
      },
    ]);

    const nextIdx = stepIndex(step) + 1;
    if (nextIdx < CONFIGURATOR_STEPS.length) {
      advanceToStep(CONFIGURATOR_STEPS[nextIdx]!);
    }
  }

  function rewindToStep(step: ConfiguratorStep) {
    const idx = stepIndex(step);
    const cleared = clearDraftFromStep(draft, step);
    setMessages((prev) =>
      prev.filter((m) => {
        if (m.role === "bot" && stepIndex(m.step) > idx) return false;
        if (m.role === "user" && stepIndex(m.step) >= idx) return false;
        return true;
      }),
    );
    onDraftChange(cleared);
    setCurrentStep(step);
    setDimWidth(String(cleared.widthCm));
    setDimHeight(String(cleared.heightCm));
  }

  function handleProductType(key: string) {
    if (currentStep !== "product_type") return;
    commitAnswer("product_type", {
      ...INITIAL_DRAFT,
      productType: key as ConfiguratorDraft["productType"],
    });
  }

  function handleFabric(id: string) {
    if (currentStep !== "fabric") return;
    commitAnswer("fabric", { ...draft, fabricId: id });
  }

  function handleDimensionsSubmit() {
    if (currentStep !== "dimensions") return;
    const widthCm = Number(dimWidth);
    const heightCm = Number(dimHeight);
    const nextDraft = { ...draft, widthCm, heightCm };
    const err = validateDimensions(nextDraft, catalog.limits);
    if (err) {
      toast.error(err);
      return;
    }
    commitAnswer("dimensions", nextDraft);
  }

  function handleRail(key: string) {
    if (currentStep !== "rails") return;
    commitAnswer("rails", { ...draft, railOptionKey: key });
  }

  function handleInstallation(key: string) {
    if (currentStep !== "installation") return;
    commitAnswer("installation", { ...draft, installationOptionKey: key });
  }

  const canAddToCart =
    !!draft.productType &&
    !!draft.fabricId &&
    !!draft.railOptionKey &&
    !!draft.installationOptionKey &&
    !!price;

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-xl border bg-card">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => (
          <button
            key={msg.id}
            type="button"
            disabled={msg.role === "bot"}
            onClick={() => {
              if (msg.role === "user") rewindToStep(msg.step);
            }}
            className={cn(
              "block max-w-[90%] rounded-2xl px-4 py-2.5 text-left text-sm transition",
              msg.role === "bot"
                ? "mr-auto rounded-bl-md bg-muted text-foreground"
                : "ml-auto cursor-pointer rounded-br-md bg-primary text-primary-foreground hover:opacity-90",
            )}
          >
            {msg.text}
          </button>
        ))}

        {currentStep === "product_type" && (
          <OptionPicker>
            <div className="grid gap-2 sm:grid-cols-2">
              {catalog.productTypes.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleProductType(opt.key)}
                  className="overflow-hidden rounded-lg border text-left transition hover:border-primary hover:ring-1 hover:ring-primary"
                >
                  {opt.imageUrl && (
                    <div className="relative aspect-[4/3] w-full bg-muted">
                      <ProductImage
                        src={opt.imageUrl}
                        alt={opt.label}
                        imgClassName="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-sm font-medium">{opt.label}</p>
                    {opt.description && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {opt.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </OptionPicker>
        )}

        {currentStep === "fabric" && (
          <OptionPicker>
            <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto">
              {catalog.fabrics.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleFabric(f.id)}
                  className="rounded border p-2 text-left text-xs transition hover:border-primary hover:ring-1 hover:ring-primary"
                >
                  {f.swatchUrl ? (
                    <div className="relative mb-1 aspect-square w-full overflow-hidden rounded border">
                      <ProductImage
                        src={f.swatchUrl}
                        alt={f.name}
                        imgClassName="object-cover"
                      />
                    </div>
                  ) : (
                    <span
                      className="mb-1 inline-block size-8 rounded-full border"
                      style={{ background: f.colorHex ?? "#ccc" }}
                    />
                  )}
                  <p className="font-medium">{f.name}</p>
                  <p className="text-muted-foreground">
                    {formatPrice(f.pricePerMeter)}/ม.
                  </p>
                </button>
              ))}
            </div>
          </OptionPicker>
        )}

        {currentStep === "dimensions" && (
          <OptionPicker>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>กว้าง (ซม.)</Label>
                <Input
                  type="number"
                  value={dimWidth}
                  onChange={(e) => setDimWidth(e.target.value)}
                />
              </div>
              <div>
                <Label>สูง (ซม.)</Label>
                <Input
                  type="number"
                  value={dimHeight}
                  onChange={(e) => setDimHeight(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground sm:col-span-2">
                {catalog.limits.minWidthCm}-{catalog.limits.maxWidthCm} x{" "}
                {catalog.limits.minHeightCm}-{catalog.limits.maxHeightCm} ซม.
              </p>
              <Button
                type="button"
                className="sm:col-span-2"
                onClick={handleDimensionsSubmit}
              >
                ถัดไป | Next
              </Button>
            </div>
          </OptionPicker>
        )}

        {currentStep === "rails" && (
          <OptionPicker>
            <div className="grid gap-2">
              {catalog.railOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleRail(opt.key)}
                  className="flex items-center gap-3 rounded-lg border p-2 text-left transition hover:border-primary hover:ring-1 hover:ring-primary"
                >
                  {opt.imageUrl && (
                    <div className="relative size-14 shrink-0 overflow-hidden rounded border">
                      <ProductImage
                        src={opt.imageUrl}
                        alt={opt.label}
                        imgClassName="object-cover"
                      />
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {opt.label} (+{formatPrice(opt.priceDelta)})
                  </span>
                </button>
              ))}
            </div>
          </OptionPicker>
        )}

        {currentStep === "installation" && (
          <OptionPicker>
            <div className="grid gap-2">
              {catalog.installationOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleInstallation(opt.key)}
                  className="flex items-center gap-3 rounded-lg border p-2 text-left transition hover:border-primary hover:ring-1 hover:ring-primary"
                >
                  {opt.imageUrl && (
                    <div className="relative size-14 shrink-0 overflow-hidden rounded border">
                      <ProductImage
                        src={opt.imageUrl}
                        alt={opt.label}
                        imgClassName="object-cover"
                      />
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {opt.label}
                    {opt.priceDelta > 0
                      ? ` (+${formatPrice(opt.priceDelta)})`
                      : ""}
                  </span>
                </button>
              ))}
            </div>
          </OptionPicker>
        )}

        {currentStep === "summary" && (
          <Card className="border-accent/40 bg-accent/5">
            <CardContent className="space-y-3 p-4">
              <dl className="space-y-1 text-xs text-muted-foreground">
                <SummaryRow
                  label="สินค้า"
                  value={
                    catalog.productTypes.find(
                      (o) => o.key === draft.productType,
                    )?.label
                  }
                />
                <SummaryRow
                  label="ผ้า/สี"
                  value={
                    catalog.fabrics.find((f) => f.id === draft.fabricId)?.name
                  }
                />
                <SummaryRow
                  label="ขนาด"
                  value={`${draft.widthCm} x ${draft.heightCm} ซม.`}
                />
                <SummaryRow
                  label="ราง"
                  value={
                    catalog.railOptions.find(
                      (o) => o.key === draft.railOptionKey,
                    )?.label
                  }
                />
                <SummaryRow
                  label="ติดตั้ง"
                  value={
                    catalog.installationOptions.find(
                      (o) => o.key === draft.installationOptionKey,
                    )?.label
                  }
                />
              </dl>
              <div className="flex items-end justify-between border-t pt-3">
                <span className="text-sm font-medium">ราคา | Price</span>
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function OptionPicker({ children }: { children: React.ReactNode }) {
  return <div className="mr-auto max-w-full pt-1">{children}</div>;
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt>{label}</dt>
      <dd className="text-right font-medium text-foreground">{value ?? "—"}</dd>
    </div>
  );
}
