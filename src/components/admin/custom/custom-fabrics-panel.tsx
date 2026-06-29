import { useState } from "react";
import { toast } from "sonner";

import { AdminImageUploader } from "@/components/admin/shared/admin-image-uploader";
import { ProductImage } from "@/components/storefront/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PRODUCT_IMAGE_ENDPOINT } from "@/lib/admin-image-upload";
import { saveAdminFabric, toggleAdminFabricActive } from "@/lib/api.functions";

import { useCustomAdmin } from "./custom-admin-context";

const emptyFabricForm = () => ({
  id: undefined as string | undefined,
  code: "",
  name: "",
  collectionId: "",
  colorId: "",
  pricePerMeter: 0,
  rollWidthCm: 280,
  swatchUrl: "",
  isActive: true,
});

export function CustomFabricsPanel() {
  const { authOpts, session, fabrics, collections, colors, reloadFabrics } =
    useCustomAdmin();
  const [form, setForm] = useState(emptyFabricForm);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveAdminFabric({
        data: {
          id: form.id,
          code: form.code,
          name: form.name,
          collectionId: form.collectionId || null,
          colorId: form.colorId || null,
          pricePerMeter: Number(form.pricePerMeter),
          rollWidthCm: Number(form.rollWidthCm),
          swatchUrl: form.swatchUrl || null,
          isActive: form.isActive,
        },
        ...authOpts,
      });
      toast.success(form.id ? "อัปเดตผ้าแล้ว" : "เพิ่มผ้าแล้ว");
      setForm(emptyFabricForm());
      await reloadFabrics();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <h2 className="font-semibold">จัดการผ้า (Fabrics)</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              ผ้าที่ใช้ใน Configurator และเงื่อนไข Preview Rules
            </p>
          </div>

          <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>รหัสผ้า</Label>
                <Input
                  required
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  placeholder="เช่น FB-001"
                />
              </div>
              <div>
                <Label>ชื่อผ้า</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label>คอลเลกชัน</Label>
                <Select
                  value={form.collectionId || "__none__"}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      collectionId: v === "__none__" ? "" : v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกคอลเลกชัน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— ไม่ระบุ —</SelectItem>
                    {collections.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>สี</Label>
                <Select
                  value={form.colorId || "__none__"}
                  onValueChange={(v) =>
                    setForm({ ...form, colorId: v === "__none__" ? "" : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสี" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— ไม่ระบุ —</SelectItem>
                    {colors.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ราคา/เมตร (บาท)</Label>
                <Input
                  type="number"
                  min={0}
                  required
                  value={form.pricePerMeter}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      pricePerMeter: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>ความกว้างม้วน (ซม.)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.rollWidthCm}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      rollWidthCm: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <AdminImageUploader
              accessToken={session?.access_token}
              imageUrl={form.swatchUrl}
              onImageUrlChange={(url) => setForm({ ...form, swatchUrl: url })}
              uploadEndpoint={PRODUCT_IMAGE_ENDPOINT}
              label="รูป Swatch"
              previewClassName="size-24 rounded-lg border object-cover"
            />

            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: !!v })}
              />
              เปิดใช้งาน
            </label>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "กำลังบันทึก..." : form.id ? "อัปเดตผ้า" : "เพิ่มผ้า"}
              </Button>
              {form.id ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm(emptyFabricForm())}
                >
                  ยกเลิกแก้ไข
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          ผ้าทั้งหมด ({fabrics.length})
        </h3>
        {fabrics.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            ยังไม่มีผ้า — เพิ่มรายการแรกด้านบน
          </p>
        ) : (
          fabrics.map((fabric) => (
            <Card key={fabric.id}>
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                  {fabric.swatchUrl ? (
                    <ProductImage
                      src={fabric.swatchUrl}
                      alt={fabric.name}
                      fill
                    />
                  ) : fabric.colorHex ? (
                    <div
                      className="size-full"
                      style={{ backgroundColor: fabric.colorHex }}
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{fabric.name}</p>
                    <Badge variant="outline">{fabric.code}</Badge>
                    <Badge variant={fabric.isActive ? "default" : "secondary"}>
                      {fabric.isActive ? "เปิด" : "ปิด"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {fabric.collectionName ?? "ไม่ระบุคอลเลกชัน"}
                    {fabric.colorName ? ` · ${fabric.colorName}` : ""} ·{" "}
                    {fabric.pricePerMeter.toLocaleString()} บาท/ม.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setForm({
                        id: fabric.id,
                        code: fabric.code,
                        name: fabric.name,
                        collectionId: fabric.collectionId ?? "",
                        colorId: fabric.colorId ?? "",
                        pricePerMeter: fabric.pricePerMeter,
                        rollWidthCm: fabric.rollWidthCm,
                        swatchUrl: fabric.swatchUrl ?? "",
                        isActive: fabric.isActive,
                      })
                    }
                  >
                    แก้ไข
                  </Button>
                  <Switch
                    checked={fabric.isActive}
                    onCheckedChange={() =>
                      void toggleAdminFabricActive({
                        data: { id: fabric.id, isActive: !fabric.isActive },
                        ...authOpts,
                      }).then(() => reloadFabrics())
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
