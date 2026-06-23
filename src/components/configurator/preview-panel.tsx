import type { ConfiguratorCatalog } from "@/domain/configurator";

type FabricPreview = ConfiguratorCatalog["fabrics"][number] | null;

export function PreviewPanel({
  fabric,
  widthCm,
  heightCm,
}: {
  fabric: FabricPreview;
  widthCm: number;
  heightCm: number;
}) {
  const aspect = Math.min(widthCm / Math.max(heightCm, 1), 2);

  return (
    <div className="rounded-xl border bg-muted/20 p-6">
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
      <div className="mt-4 text-center text-sm text-muted-foreground">
        {fabric ? (
          <>
            <p className="font-medium text-foreground">{fabric.name}</p>
            <p>
              {widthCm} x {heightCm} ซม.
            </p>
          </>
        ) : (
          <p>เลือกผ้าเพื่อดูตัวอย่าง</p>
        )}
      </div>
    </div>
  );
}
