import { Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Loader2, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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
import {
  hotspotDraftToInput,
  newHotspotDraft,
  roomToEditorState,
  splitTags,
  type RoomEditorState,
} from "@/lib/inspiration-admin";
import { slugifyCatalogTitle } from "@/lib/catalog-slug";
import { saveAdminInspirationRoom } from "@/lib/api.functions";
import type { authServerFnOptions } from "@/lib/server-fn-auth";
import type { InspirationRoomStatus } from "@/types/api/inspiration";

import { InspirationDetailImageEditor } from "./inspiration-detail-image-editor";
import { InspirationHotspotCanvas } from "./inspiration-hotspot-canvas";
import { InspirationHotspotInspector } from "./inspiration-hotspot-inspector";
import { InspirationImageUploader } from "./inspiration-image-uploader";

type AuthOpts = ReturnType<typeof authServerFnOptions>;

type Props = {
  authOpts: AuthOpts;
  accessToken: string | undefined;
  initial: RoomEditorState;
  isNew: boolean;
  onSaved: (roomId: string) => void;
};

export function InspirationRoomEditor({
  authOpts,
  accessToken,
  initial,
  isNew,
  onSaved,
}: Props) {
  const [form, setForm] = useState<RoomEditorState>(initial);
  const [activeClientId, setActiveClientId] = useState<string | null>(
    initial.hotspots[0]?.clientId ?? null,
  );
  const [addMode, setAddMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const activeHotspot = useMemo(
    () =>
      form.hotspots.find((hotspot) => hotspot.clientId === activeClientId) ??
      null,
    [form.hotspots, activeClientId],
  );

  function updateHotspots(
    updater: (
      hotspots: RoomEditorState["hotspots"],
    ) => RoomEditorState["hotspots"],
  ) {
    setForm((current) => ({ ...current, hotspots: updater(current.hotspots) }));
  }

  async function handleSave(status: InspirationRoomStatus) {
    if (!form.title.trim()) {
      toast.error("กรุณาใส่ชื่อภาพ");
      return;
    }
    if (!form.imageUrl.trim()) {
      toast.error("กรุณาอัปโหลดหรือใส่ URL รูป");
      return;
    }

    if (status === "published" && !form.hotspots.length) {
      toast.warning("เผยแพร่โดยไม่มีจุด tag — ลูกค้าจะไม่เห็นสินค้าในภาพ");
    }

    setSaving(true);
    try {
      const slug =
        form.slug.trim() ||
        slugifyCatalogTitle(form.title) ||
        `room-${Date.now()}`;
      const saved = await saveAdminInspirationRoom({
        data: {
          id: form.id,
          slug,
          title: form.title.trim(),
          description: form.description.trim() || null,
          imageUrl: form.imageUrl.trim(),
          roomType: form.roomType.trim() || null,
          moodTags: splitTags(form.moodTags),
          styleTags: splitTags(form.styleTags),
          sortOrder: form.sortOrder,
          isFeatured: form.isFeatured,
          status,
          detailImages: form.detailImages.filter(
            (image) => image.imageUrl.trim() && image.label.trim(),
          ),
          hotspots: form.hotspots.map(hotspotDraftToInput),
        },
        ...authOpts,
      });
      toast.success(
        status === "published" ? "เผยแพร่แล้ว" : "บันทึกแบบร่างแล้ว",
      );
      const nextState = roomToEditorState(saved);
      setForm(nextState);
      setActiveClientId(
        activeClientId
          ? (nextState.hotspots.find(
              (hotspot) => hotspot.clientId === activeClientId,
            )?.clientId ??
              nextState.hotspots.find(
                (hotspot) => hotspot.id === activeClientId,
              )?.clientId ??
              nextState.hotspots[0]?.clientId ??
              null)
          : (nextState.hotspots[0]?.clientId ?? null),
      );
      onSaved(saved.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  function handlePreview() {
    const slug = form.slug.trim() || slugifyCatalogTitle(form.title);
    if (!slug) {
      toast.error("บันทึก slug ก่อน");
      return;
    }
    if (form.status !== "published") {
      toast.warning("ภาพยังเป็นแบบร่าง — หน้าร้านอาจเปิดไม่ได้จนกว่าจะเผยแพร่");
    }
    window.open(`/inspiration/${slug}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/inspiration">
            <ArrowLeft className="size-4" />
            กลับรายการ
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={handlePreview}>
            <ExternalLink className="size-4" />
            ดูตัวอย่าง
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => void handleSave("draft")}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            บันทึกแบบร่าง
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={() => void handleSave("published")}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            เผยแพร่
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={addMode ? "default" : "outline"}
              onClick={() => setAddMode((value) => !value)}
            >
              <MapPin className="size-4" />
              {addMode ? "โหมดเพิ่มจุด (คลิกบนรูป)" : "เพิ่มจุด tag"}
            </Button>
            {addMode ? (
              <p className="text-xs text-muted-foreground">
                คลิกบนรูปเพื่อวางจุดใหม่
              </p>
            ) : null}
          </div>

          <InspirationHotspotCanvas
            imageUrl={form.imageUrl}
            hotspots={form.hotspots}
            activeClientId={activeClientId}
            addMode={addMode}
            onSelectHotspot={(clientId) => {
              setActiveClientId(clientId);
              setAddMode(false);
            }}
            onAddHotspot={(posX, posY) => {
              const draft = newHotspotDraft(posX, posY, form.hotspots.length);
              updateHotspots((hotspots) => [...hotspots, draft]);
              setActiveClientId(draft.clientId);
              setAddMode(false);
            }}
            onMoveHotspot={(clientId, posX, posY) => {
              updateHotspots((hotspots) =>
                hotspots.map((hotspot) =>
                  hotspot.clientId === clientId
                    ? { ...hotspot, posX, posY }
                    : hotspot,
                ),
              );
            }}
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-4 rounded-lg border p-4">
            <h2 className="font-semibold">
              {isNew ? "เพิ่มภาพใหม่" : "ข้อมูลภาพ"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>ชื่อภาพ</Label>
                <Input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  placeholder="auto"
                  onChange={(event) =>
                    setForm({ ...form, slug: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>ประเภทห้อง</Label>
                <Input
                  value={form.roomType}
                  placeholder="ห้องนอน, ห้องนั่งเล่น"
                  onChange={(event) =>
                    setForm({ ...form, roomType: event.target.value })
                  }
                />
              </div>
            </div>

            <InspirationImageUploader
              accessToken={accessToken}
              authOpts={authOpts}
              imageUrl={form.imageUrl}
              onImageUrlChange={(imageUrl) => setForm({ ...form, imageUrl })}
            />

            <div className="space-y-2">
              <Label>คำอธิบาย</Label>
              <Textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Mood tags</Label>
                <Input
                  value={form.moodTags}
                  placeholder="อบอุ่น, มินิมอล"
                  onChange={(event) =>
                    setForm({ ...form, moodTags: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Style tags</Label>
                <Input
                  value={form.styleTags}
                  onChange={(event) =>
                    setForm({ ...form, styleTags: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>สถานะ</Label>
                <Select
                  value={form.status}
                  onValueChange={(value: InspirationRoomStatus) =>
                    setForm({ ...form, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">แบบร่าง</SelectItem>
                    <SelectItem value="published">เผยแพร่</SelectItem>
                    <SelectItem value="archived">เก็บถาวร</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Checkbox
                  id="featured"
                  checked={form.isFeatured}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, isFeatured: checked === true })
                  }
                />
                <Label htmlFor="featured">แสดงเด่น</Label>
              </div>
            </div>
          </div>

          <InspirationHotspotInspector
            authOpts={authOpts}
            hotspot={activeHotspot}
            onChange={(hotspot) => {
              updateHotspots((hotspots) =>
                hotspots.map((item) =>
                  item.clientId === hotspot.clientId ? hotspot : item,
                ),
              );
            }}
            onDelete={() => {
              if (!activeClientId) return;
              updateHotspots((hotspots) =>
                hotspots.filter((item) => item.clientId !== activeClientId),
              );
              setActiveClientId(null);
            }}
          />

          <InspirationDetailImageEditor
            accessToken={accessToken}
            detailImages={form.detailImages}
            hotspots={form.hotspots.map((hotspot) => ({
              id: hotspot.id,
              clientId: hotspot.clientId,
              label: hotspot.label,
            }))}
            onChange={(detailImages) => setForm({ ...form, detailImages })}
          />
        </div>
      </div>
    </div>
  );
}
