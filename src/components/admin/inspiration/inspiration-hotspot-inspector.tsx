import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HotspotDraft, HotspotDraftKind } from "@/lib/inspiration-admin";
import type { authServerFnOptions } from "@/lib/server-fn-auth";

import { InspirationFabricPicker } from "./inspiration-fabric-picker";
import { InspirationProductPicker } from "./inspiration-product-picker";

type AuthOpts = ReturnType<typeof authServerFnOptions>;

type Props = {
  authOpts: AuthOpts;
  hotspot: HotspotDraft | null;
  onChange: (hotspot: HotspotDraft) => void;
  onDelete: () => void;
};

const KIND_LABELS: Record<HotspotDraftKind, string> = {
  ready: "สินค้าพร้อมขาย",
  custom: "ม่านสั่งตัด",
  rail: "รางม่าน",
  blind: "มู่ลี่ / ชัตเตอร์",
};

export function InspirationHotspotInspector({
  authOpts,
  hotspot,
  onChange,
  onDelete,
}: Props) {
  if (!hotspot) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        เลือกจุดบนรูป หรือกด &quot;เพิ่มจุด tag&quot; แล้วคลิกบนรูป
      </div>
    );
  }

  function patch(partial: Partial<HotspotDraft>) {
    onChange({ ...hotspot, ...partial, clientId: hotspot.clientId });
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">แก้ไขจุด tag</p>
        <Button type="button" size="sm" variant="outline" onClick={onDelete}>
          <Trash2 className="size-4" />
          ลบ
        </Button>
      </div>

      <div className="space-y-2">
        <Label>ประเภท</Label>
        <Select
          value={hotspot.kind}
          onValueChange={(value: HotspotDraftKind) => {
            patch({
              kind: value,
              productId: value === "custom" ? null : hotspot.productId,
              fabricId:
                value === "ready" || value === "rail" || value === "blind"
                  ? null
                  : hotspot.fabricId,
              configuratorProductType:
                value === "custom" ? hotspot.configuratorProductType : null,
            });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(KIND_LABELS) as HotspotDraftKind[]).map((kind) => (
              <SelectItem key={kind} value={kind}>
                {KIND_LABELS[kind]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>ชื่อ tag</Label>
        <Input
          value={hotspot.label}
          placeholder="เช่น ผ้า Linen, รางม่าน"
          onChange={(event) => patch({ label: event.target.value })}
        />
      </div>

      {hotspot.kind === "ready" ||
      hotspot.kind === "rail" ||
      hotspot.kind === "blind" ? (
        <div className="space-y-2">
          <Label>สินค้า</Label>
          <InspirationProductPicker
            authOpts={authOpts}
            value={hotspot.productId}
            label={hotspot.productName}
            onChange={(productId, productName) =>
              patch({ productId, productName })
            }
          />
        </div>
      ) : null}

      {hotspot.kind === "custom" ? (
        <>
          <div className="space-y-2">
            <Label>ผ้า</Label>
            <InspirationFabricPicker
              authOpts={authOpts}
              value={hotspot.fabricId}
              label={hotspot.fabricName}
              onChange={(fabricId, fabricName) =>
                patch({ fabricId, fabricName })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>สไตล์จีบ</Label>
            <Select
              value={hotspot.configuratorProductType ?? ""}
              onValueChange={(value) =>
                patch({
                  configuratorProductType: value || null,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกสไตล์" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pleated">จีบ (Pleated)</SelectItem>
                <SelectItem value="eyelet">ตาไก่ (Eyelet)</SelectItem>
                <SelectItem value="wave">Wave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      ) : null}

      <p className="text-xs text-muted-foreground">
        ตำแหน่ง {hotspot.posX.toFixed(1)}%, {hotspot.posY.toFixed(1)}%
      </p>
    </div>
  );
}
