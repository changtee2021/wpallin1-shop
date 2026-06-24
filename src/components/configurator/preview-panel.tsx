import { ProductImage } from "@/components/storefront/product-image";
import type { ConfiguratorCatalog } from "@/domain/configurator";

type FabricPreview = ConfiguratorCatalog["fabrics"][number] | null;

export function PreviewPanel({
  fabric,
  productImageUrl,
  productLabel,
  widthCm,
  heightCm,
}: {
  fabric: FabricPreview;
  productImageUrl?: string | null;
  productLabel?: string | null;
  widthCm: number;
  heightCm: number;
}) {
  const aspect = Math.min(widthCm / Math.max(heightCm, 1), 2);
  const showRoomPreview = Boolean(productImageUrl);

  return (
    <div className="rounded-xl border bg-muted/20 p-4 sm:p-6">
      {showRoomPreview ? (
        <div className="relative mx-auto aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-lg border bg-background shadow-sm">
          <ProductImage
            src={productImageUrl}
            alt={productLabel ?? "Custom product preview"}
            imgClassName="object-cover"
          />
          {fabric && (
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border bg-background/95 px-3 py-1.5 text-xs shadow-sm backdrop-blur-sm">
              <span
                className="inline-block size-4 shrink-0 rounded-full border"
                style={{ background: fabric.colorHex ?? "#ccc" }}
              />
              <span className="font-medium text-foreground">{fabric.name}</span>
            </div>
          )}
        </div>
      ) : (
        <div
          className="mx-auto flex aspect-video max-w-lg items-end justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-background p-4"
          style={{ maxHeight: 320 }}
        >
          <div
            className="rounded-sm border shadow-md transition-all"
            style={{
              width: `${Math.min(80, 40 * aspect)}%`,
              height: `${Math.min(70, 35 / aspect)}%`,
              background:
                fabric?.colorHex ?? "linear-gradient(135deg,#e5e7eb,#d1d5db)",
            }}
          />
        </div>
      )}

      <div className="mt-4 text-center text-sm text-muted-foreground">
        {productLabel && (
          <p className="font-medium text-foreground">{productLabel}</p>
        )}
        {fabric ? (
          <p>
            {widthCm} x {heightCm} ซม. — ตัวอย่างสีผ้าที่เลือก
          </p>
        ) : (
          <p>ภาพตัวอย่างในห้องจริง | Room preview — เลือกผ้าเพื่อดูสี</p>
        )}
      </div>
    </div>
  );
}
