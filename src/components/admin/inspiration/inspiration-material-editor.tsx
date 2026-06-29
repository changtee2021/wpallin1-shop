import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ExternalLink,
  ImagePlus,
  Loader2,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminImageUploader } from "@/components/admin/shared/admin-image-uploader";
import { useAdminConfirm } from "@/components/admin/shared/admin-confirm-dialog";
import { AdminPreviewLink } from "@/components/admin/shared/admin-preview-link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { slugifyCatalogTitle } from "@/lib/catalog-slug";
import {
  deleteAdminInspirationMaterial,
  saveAdminInspirationMaterial,
} from "@/lib/api.functions";
import type { authServerFnOptions } from "@/lib/server-fn-auth";
import type {
  InspirationMaterialAdminDto,
  InspirationMaterialStatus,
  InspirationMaterialType,
  InspirationRoomDto,
} from "@/types/api/inspiration";

import { InspirationFabricPicker } from "./inspiration-fabric-picker";
import { InspirationProductPicker } from "./inspiration-product-picker";

type AuthOpts = ReturnType<typeof authServerFnOptions>;

export type MaterialEditorState = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  materialType: InspirationMaterialType;
  fabricId: string | null;
  productId: string | null;
  heroImageUrl: string;
  galleryUrls: string[];
  sortOrder: number;
  isFeatured: boolean;
  status: InspirationMaterialStatus;
  roomLinks: Array<{ roomId: string; hotspotId: string | null }>;
};

export function emptyMaterialEditorState(): MaterialEditorState {
  return {
    slug: "",
    title: "",
    description: "",
    materialType: "fabric",
    fabricId: null,
    productId: null,
    heroImageUrl: "",
    galleryUrls: [],
    sortOrder: 0,
    isFeatured: false,
    status: "draft",
    roomLinks: [],
  };
}

export function materialToEditorState(
  material: InspirationMaterialAdminDto,
): MaterialEditorState {
  return {
    id: material.id,
    slug: material.slug,
    title: material.title,
    description: material.description ?? "",
    materialType: material.materialType,
    fabricId: material.fabricId,
    productId: material.productId,
    heroImageUrl: material.heroImageUrl,
    galleryUrls: material.galleryUrls,
    sortOrder: material.sortOrder,
    isFeatured: material.isFeatured,
    status: material.status,
    roomLinks: material.roomLinks.map((link) => ({
      roomId: link.roomId,
      hotspotId: link.hotspotId,
    })),
  };
}

type Props = {
  authOpts: AuthOpts;
  accessToken: string | undefined;
  initial: MaterialEditorState;
  isNew: boolean;
  rooms: InspirationRoomDto[];
  onSaved: (materialId: string) => void;
  onDeleted?: () => void;
};

const TYPE_OPTIONS: Array<{ value: InspirationMaterialType; label: string }> = [
  { value: "fabric", label: "ผ้า" },
  { value: "style", label: "สไตล์จีบ" },
  { value: "rail", label: "รางม่าน" },
  { value: "blind", label: "มู่ลี่" },
];

export function InspirationMaterialEditor({
  authOpts,
  accessToken,
  initial,
  isNew,
  rooms,
  onSaved,
  onDeleted,
}: Props) {
  const [form, setForm] = useState<MaterialEditorState>(initial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { confirm, AdminConfirmDialog } = useAdminConfirm();

  const previewSlug =
    form.slug.trim() || slugifyCatalogTitle(form.title) || "preview";

  const linkedRoomIds = useMemo(
    () => new Set(form.roomLinks.map((link) => link.roomId)),
    [form.roomLinks],
  );

  function toggleRoom(roomId: string) {
    setForm((current) => {
      const exists = current.roomLinks.some((link) => link.roomId === roomId);
      return {
        ...current,
        roomLinks: exists
          ? current.roomLinks.filter((link) => link.roomId !== roomId)
          : [...current.roomLinks, { roomId, hotspotId: null }],
      };
    });
  }

  async function handleSave(status: InspirationMaterialStatus) {
    if (!form.title.trim()) {
      toast.error("กรุณาใส่ชื่อวัสดุ");
      return;
    }
    if (!form.heroImageUrl.trim()) {
      toast.error("กรุณาอัปโหลดหรือใส่ URL รูป");
      return;
    }

    setSaving(true);
    try {
      const slug =
        form.slug.trim() ||
        slugifyCatalogTitle(form.title) ||
        `material-${Date.now()}`;
      const saved = await saveAdminInspirationMaterial({
        data: {
          id: form.id,
          slug,
          title: form.title.trim(),
          description: form.description.trim() || null,
          materialType: form.materialType,
          fabricId: form.fabricId,
          productId: form.productId,
          heroImageUrl: form.heroImageUrl.trim(),
          galleryUrls: form.galleryUrls.filter(Boolean),
          sortOrder: form.sortOrder,
          isFeatured: form.isFeatured,
          status,
          roomLinks: form.roomLinks,
        },
        ...authOpts,
      });
      setForm(materialToEditorState(saved));
      toast.success(status === "published" ? "เผยแพร่แล้ว" : "บันทึกแล้ว");
      onSaved(saved.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!form.id) return;
    if (!(await confirm({ description: "ลบวัสดุนี้?", destructive: true })))
      return;
    setDeleting(true);
    try {
      await deleteAdminInspirationMaterial({
        data: { id: form.id },
        ...authOpts,
      });
      toast.success("ลบแล้ว");
      onDeleted?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link to="/admin/inspiration/materials">
            <ArrowLeft className="size-4" />
            กลับ
          </Link>
        </Button>
        <AdminPreviewLink
          href={`/inspiration/materials/${previewSlug}`}
          disabled={!form.heroImageUrl.trim()}
        />
        {!isNew && form.id ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={deleting}
            onClick={() => void handleDelete()}
          >
            {deleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            ลบ
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="material-title">ชื่อวัสดุ</Label>
            <Input
              id="material-title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="material-slug">Slug</Label>
            <Input
              id="material-slug"
              value={form.slug}
              placeholder="auto จากชื่อ"
              onChange={(event) =>
                setForm((current) => ({ ...current, slug: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="material-desc">คำอธิบาย</Label>
            <Textarea
              id="material-desc"
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>ประเภท</Label>
            <Select
              value={form.materialType}
              onValueChange={(value: InspirationMaterialType) =>
                setForm((current) => ({ ...current, materialType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.materialType === "fabric" ? (
            <InspirationFabricPicker
              authOpts={authOpts}
              value={form.fabricId}
              label={null}
              onChange={(fabricId) =>
                setForm((current) => ({ ...current, fabricId }))
              }
            />
          ) : (
            <InspirationProductPicker
              authOpts={authOpts}
              value={form.productId}
              label={null}
              onChange={(productId) =>
                setForm((current) => ({ ...current, productId }))
              }
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="material-sort">ลำดับ</Label>
              <Input
                id="material-sort"
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sortOrder: Number(event.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="flex items-end gap-2 pb-2">
              <Checkbox
                id="material-featured"
                checked={form.isFeatured}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    isFeatured: checked === true,
                  }))
                }
              />
              <Label htmlFor="material-featured">แนะนำ</Label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <AdminImageUploader
            accessToken={accessToken}
            authOpts={authOpts}
            imageUrl={form.heroImageUrl}
            onImageUrlChange={(url) =>
              setForm((current) => ({ ...current, heroImageUrl: url }))
            }
            uploadEndpoint="/api/v1/admin-media"
            mediaFolder="inspiration-materials"
            label="รูปหลัก"
          />

          <div className="space-y-2">
            <Label>แกลเลอรี (URL)</Label>
            {form.galleryUrls.map((url, index) => (
              <div key={`${url}-${index}`} className="flex gap-2">
                <Input
                  value={url}
                  onChange={(event) =>
                    setForm((current) => {
                      const galleryUrls = [...current.galleryUrls];
                      galleryUrls[index] = event.target.value;
                      return { ...current, galleryUrls };
                    })
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      galleryUrls: current.galleryUrls.filter(
                        (_, i) => i !== index,
                      ),
                    }))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  galleryUrls: [...current.galleryUrls, ""],
                }))
              }
            >
              <ImagePlus className="size-4" />
              เพิ่มรูป
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>เชื่อมภาพห้อง</Label>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <label
              key={room.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
            >
              <Checkbox
                checked={linkedRoomIds.has(room.id)}
                onCheckedChange={() => toggleRoom(room.id)}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{room.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {room.slug}
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" asChild>
                <a
                  href={`/admin/inspiration/rooms/${room.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t pt-4">
        <Button
          type="button"
          disabled={saving}
          onClick={() => void handleSave("draft")}
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          บันทึกแบบร่าง
        </Button>
        <Button
          type="button"
          variant="default"
          disabled={saving}
          onClick={() => void handleSave("published")}
        >
          เผยแพร่
        </Button>
      </div>
      {AdminConfirmDialog}
    </div>
  );
}
