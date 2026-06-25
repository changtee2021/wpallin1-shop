import { ProductImage } from "@/components/storefront/product-image";
import type { ConfiguratorPreviewState } from "@/domain/configurator";

export function PreviewPanel({
  preview,
}: {
  preview: ConfiguratorPreviewState;
}) {
  const aspect = Math.min(preview.widthCm / Math.max(preview.heightCm, 1), 2);
  const showRoomPreview = Boolean(preview.imageUrl);

  return (
    <div className="isolate min-w-0 rounded-xl border bg-muted/20 p-4 sm:p-6 lg:sticky lg:top-4 lg:z-0">
      {showRoomPreview ? (
        <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-lg border bg-background shadow-sm">
          <ProductImage
            key={preview.imageUrl ?? "preview"}
            src={preview.imageUrl}
            alt={preview.productTypeLabel ?? "Custom product preview"}
            fill
            imgClassName="transition-opacity duration-300"
          />
          {(preview.fabricSwatchUrl || preview.fabricColorHex) && (
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-full border bg-background/95 px-3 py-1.5 text-xs shadow-sm backdrop-blur-sm">
              {preview.fabricSwatchUrl ? (
                <span className="relative inline-block size-5 shrink-0 overflow-hidden rounded-full border">
                  <ProductImage
                    src={preview.fabricSwatchUrl}
                    alt={preview.fabricName ?? "Fabric"}
                    fill
                  />
                </span>
              ) : (
                <span
                  className="inline-block size-4 shrink-0 rounded-full border"
                  style={{ background: preview.fabricColorHex ?? "#ccc" }}
                />
              )}
              {preview.fabricName && (
                <span className="font-medium text-foreground">
                  {preview.fabricName}
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto flex aspect-[4/3] w-full max-w-lg items-end justify-center overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/30 bg-background p-4">
          <div
            className="rounded-sm border shadow-md transition-all duration-300"
            style={{
              width: `${Math.min(80, 40 * aspect)}%`,
              height: `${Math.min(70, 35 / aspect)}%`,
              background: preview.fabricSwatchUrl
                ? `url(${preview.fabricSwatchUrl}) center/cover`
                : (preview.fabricColorHex ??
                  "linear-gradient(135deg,#e5e7eb,#d1d5db)"),
            }}
          />
        </div>
      )}

      <div className="mt-4 space-y-1 text-center text-sm text-muted-foreground">
        {preview.productTypeLabel && (
          <p className="font-medium text-foreground">
            {preview.productTypeLabel}
          </p>
        )}
        <p>
          {preview.widthCm} x {preview.heightCm} ซม.
          {preview.fabricName
            ? ` — ${preview.fabricName}`
            : " — เลือกตัวเลือกเพื่อดูตัวอย่าง"}
        </p>
        {(preview.railLabel || preview.installationLabel) && (
          <p className="text-xs">
            {[preview.railLabel, preview.installationLabel]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
