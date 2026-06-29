import { useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { HotspotDraft } from "@/lib/inspiration-admin";

type Props = {
  imageUrl: string;
  hotspots: HotspotDraft[];
  activeClientId: string | null;
  addMode: boolean;
  onSelectHotspot: (clientId: string) => void;
  onAddHotspot: (posX: number, posY: number) => void;
  onMoveHotspot: (clientId: string, posX: number, posY: number) => void;
};

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

export function InspirationHotspotCanvas({
  imageUrl,
  hotspots,
  activeClientId,
  addMode,
  onSelectHotspot,
  onAddHotspot,
  onMoveHotspot,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function positionFromEvent(clientX: number, clientY: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const posX = clampPercent(((clientX - rect.left) / rect.width) * 100);
    const posY = clampPercent(((clientY - rect.top) / rect.height) * 100);
    return { posX, posY };
  }

  function handleCanvasClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!addMode || draggingId) return;
    const pos = positionFromEvent(event.clientX, event.clientY);
    if (!pos) return;
    onAddHotspot(pos.posX, pos.posY);
  }

  function handleDotPointerDown(
    event: React.PointerEvent<HTMLButtonElement>,
    clientId: string,
  ) {
    event.stopPropagation();
    event.preventDefault();
    onSelectHotspot(clientId);
    setDraggingId(clientId);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleDotPointerMove(
    event: React.PointerEvent<HTMLButtonElement>,
    clientId: string,
  ) {
    if (draggingId !== clientId) return;
    const pos = positionFromEvent(event.clientX, event.clientY);
    if (!pos) return;
    onMoveHotspot(clientId, pos.posX, pos.posY);
  }

  function handleDotPointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    if (draggingId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      setDraggingId(null);
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-muted/30",
        addMode ? "cursor-crosshair" : "cursor-default",
      )}
      onClick={handleCanvasClick}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="block w-full select-none"
          draggable={false}
        />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center text-sm text-muted-foreground">
          อัปโหลดรูปเพื่อวางจุด tag
        </div>
      )}

      {hotspots.map((hotspot, index) => (
        <button
          key={hotspot.clientId}
          type="button"
          className={cn(
            "absolute z-10 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md transition-transform",
            activeClientId === hotspot.clientId
              ? "scale-125 bg-primary"
              : "bg-rose-500 hover:scale-110",
          )}
          style={{ left: `${hotspot.posX}%`, top: `${hotspot.posY}%` }}
          title={hotspot.label || `จุด ${index + 1}`}
          onClick={(event) => {
            event.stopPropagation();
            onSelectHotspot(hotspot.clientId);
          }}
          onPointerDown={(event) =>
            handleDotPointerDown(event, hotspot.clientId)
          }
          onPointerMove={(event) =>
            handleDotPointerMove(event, hotspot.clientId)
          }
          onPointerUp={handleDotPointerUp}
          onPointerCancel={handleDotPointerUp}
        />
      ))}
    </div>
  );
}
