import { useNavigate } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { ConfiguratorForm } from "@/components/configurator/configurator-form";
import { ConfiguratorProductGrid } from "@/components/configurator/configurator-product-grid";
import { PreviewPanel } from "@/components/configurator/preview-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  type ConfiguratorCatalog,
  type ConfiguratorDraft,
  type ConfiguratorPriceBreakdown,
  resolveConfiguratorPreview,
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
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadCatalog()}
          >
            <RefreshCw className="size-4" />
            ลองใหม่ | Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

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

  const preview = resolveConfiguratorPreview(draft, catalog);

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
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] md:items-start">
      <div className="min-w-0">
        <PreviewPanel preview={preview} />
      </div>
      <ConfiguratorForm
        catalog={catalog}
        draft={draft}
        onDraftChange={setDraft}
        onResetProduct={() => setDraft(INITIAL_DRAFT)}
        price={price}
        submitting={submitting}
        onAddToCart={() => void handleAddToCart()}
      />
    </div>
  );
}

function ConfiguratorLoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
      <Skeleton className="aspect-[4/3] w-full rounded-xl" />
      <div className="space-y-3 rounded-xl border p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
