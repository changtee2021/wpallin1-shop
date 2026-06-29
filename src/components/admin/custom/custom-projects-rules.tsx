import { ImageIcon, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { InlineRowsSkeleton } from "@/components/loading";
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
import {
  createAdminCustomProject,
  saveAdminCustomProduct,
  saveAdminConfiguratorPreviewRule,
  toggleAdminConfiguratorPreviewRule,
} from "@/lib/api.functions";

import { CustomConditionBuilder } from "./custom-condition-builder";
import { useCustomAdmin } from "./custom-admin-context";
import {
  buildConditionOptions,
  conditionRowsToRecord,
  CONDITION_LABELS,
  emptyPreviewRuleForm,
  recordToConditionRows,
  slugify,
  type ConditionKey,
} from "./custom-utils";

export function CustomProjectsPanel() {
  const {
    authOpts,
    projects,
    categories,
    productId,
    productForm,
    setProductForm,
    loadProject,
    reloadProjects,
    loadingProject,
  } = useCustomAdmin();

  const [creatingProject, setCreatingProject] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    name: "",
    slug: "",
    categoryId: "",
    isActive: true,
  });

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    setCreatingProject(true);
    try {
      const result = await createAdminCustomProject({
        data: {
          name: newProjectForm.name,
          slug: newProjectForm.slug || slugify(newProjectForm.name),
          categoryId: newProjectForm.categoryId || null,
          isActive: newProjectForm.isActive,
        },
        ...authOpts,
      });
      toast.success("สร้าง Custom Project แล้ว");
      setNewProjectForm({
        name: "",
        slug: "",
        categoryId: "",
        isActive: true,
      });
      await reloadProjects();
      await loadProject(result.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "สร้างไม่สำเร็จ");
    } finally {
      setCreatingProject(false);
    }
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setSavingProduct(true);
    try {
      await saveAdminCustomProduct({
        data: {
          productId,
          name: productForm.name,
          slug: productForm.slug || slugify(productForm.name),
          categoryId: productForm.categoryId || null,
          isActive: productForm.isActive,
        },
        ...authOpts,
      });
      toast.success("บันทึกสินค้า Custom แล้ว");
      await reloadProjects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSavingProduct(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <h2 className="font-semibold">Custom Projects</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              1 สินค้า Custom = 1 Project และแต่ละ Project จะมี Preview Rules
              ของตัวเอง
            </p>
          </div>

          <form
            onSubmit={(e) => void handleCreateProject(e)}
            className="grid gap-3 rounded-xl border bg-muted/20 p-3 md:grid-cols-[1fr_1fr_1fr_auto]"
          >
            <div>
              <Label>ชื่อ Project / สินค้า</Label>
              <Input
                required
                value={newProjectForm.name}
                onChange={(e) =>
                  setNewProjectForm({
                    ...newProjectForm,
                    name: e.target.value,
                    slug: slugify(e.target.value),
                  })
                }
                placeholder="เช่น ม่าน Wave สั่งทำ"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                required
                value={newProjectForm.slug}
                onChange={(e) =>
                  setNewProjectForm({
                    ...newProjectForm,
                    slug: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>หมวดหมู่</Label>
              <Select
                value={newProjectForm.categoryId || "__none__"}
                onValueChange={(v) =>
                  setNewProjectForm({
                    ...newProjectForm,
                    categoryId: v === "__none__" ? "" : v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— ไม่ระบุ —</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={creatingProject}>
                {creatingProject ? "กำลังสร้าง..." : "สร้าง Project"}
              </Button>
            </div>
          </form>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => void loadProject(project.id)}
                className={`rounded-xl border p-4 text-left transition hover:border-primary/50 ${
                  productId === project.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "bg-background"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {project.categoryName ?? "ไม่ระบุหมวด"} ·{" "}
                      {project.ruleCount} rules
                    </p>
                  </div>
                  <Badge variant={project.isActive ? "default" : "secondary"}>
                    {project.isActive ? "เปิด" : "ปิด"}
                  </Badge>
                </div>
                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  {project.slug}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {loadingProject ? (
        <InlineRowsSkeleton rows={4} className="rounded-xl border p-6" />
      ) : null}

      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="font-semibold">ข้อมูลสินค้า Custom</h2>
          <form
            onSubmit={(e) => void handleSaveProduct(e)}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>ชื่อสินค้า</Label>
                <Input
                  required
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      name: e.target.value,
                      slug: productForm.slug || slugify(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  required
                  value={productForm.slug}
                  onChange={(e) =>
                    setProductForm({ ...productForm, slug: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>หมวดหมู่</Label>
              <Select
                value={productForm.categoryId || "__none__"}
                onValueChange={(v) =>
                  setProductForm({
                    ...productForm,
                    categoryId: v === "__none__" ? "" : v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— ไม่ระบุ —</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={productForm.isActive}
                onCheckedChange={(v) =>
                  setProductForm({ ...productForm, isActive: !!v })
                }
              />
              เปิดใช้งานสินค้า
            </label>
            <Button type="submit" disabled={savingProduct}>
              {savingProduct ? "กำลังบันทึก..." : "บันทึกสินค้า"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function CustomRulesPanel() {
  const {
    authOpts,
    session,
    productId,
    optionGroups,
    fabrics,
    collections,
    colors,
    previewRules,
    ruleForm,
    setRuleForm,
    reloadRules,
    loadingProject,
  } = useCustomAdmin();

  const uploadRef = useRef<HTMLInputElement>(null);
  const [savingRule, setSavingRule] = useState(false);
  const [uploadingRuleImage, setUploadingRuleImage] = useState(false);

  const conditionOptions = (key: ConditionKey) =>
    buildConditionOptions(key, optionGroups, fabrics, collections, colors);

  function conditionValueLabel(key: string, value: string) {
    return (
      conditionOptions(key as ConditionKey).find((o) => o.value === value)
        ?.label ?? value
    );
  }

  async function handleUploadRuleImage(file: File) {
    if (!session?.access_token || !productId) {
      toast.error("กรุณาเข้าสู่ระบบ");
      return;
    }
    setUploadingRuleImage(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("productId", productId);
      form.set("assetType", "preview");
      form.set("name", ruleForm.name || file.name.replace(/\.[^.]+$/, ""));
      const res = await fetch("/api/v1/configurator-asset", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: form,
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "อัปโหลดไม่สำเร็จ");
      setRuleForm({
        ...ruleForm,
        assetId: payload.asset.id,
        previewImageUrl: payload.asset.publicUrl,
      });
      toast.success("อัปโหลดรูปแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploadingRuleImage(false);
    }
  }

  async function handleSaveRule(e: React.FormEvent) {
    e.preventDefault();
    const conditions = conditionRowsToRecord(ruleForm.conditions);
    if (Object.keys(conditions).length === 0) {
      toast.error("กรุณาเพิ่มเงื่อนไขอย่างน้อย 1 รายการ");
      return;
    }
    if (!ruleForm.assetId && !ruleForm.previewImageUrl) {
      toast.error("กรุณาอัปโหลดรูป Preview");
      return;
    }
    setSavingRule(true);
    try {
      await saveAdminConfiguratorPreviewRule({
        data: {
          id: ruleForm.id,
          productId,
          name: ruleForm.name || "Preview rule",
          priority: Number(ruleForm.priority),
          conditions,
          assetId: ruleForm.assetId || null,
          fallbackImageUrl: ruleForm.assetId
            ? null
            : ruleForm.previewImageUrl || null,
          isActive: ruleForm.isActive,
        },
        ...authOpts,
      });
      toast.success("บันทึกกฎ Preview แล้ว");
      setRuleForm(emptyPreviewRuleForm());
      await reloadRules();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSavingRule(false);
    }
  }

  if (loadingProject) {
    return <InlineRowsSkeleton rows={4} className="rounded-xl border p-6" />;
  }

  if (!productId) {
    return (
      <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        สร้างหรือเลือก Project ก่อน — ไปที่แท็บ Projects
      </p>
    );
  }

  const ruleImageUrl = ruleForm.previewImageUrl;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <h2 className="font-semibold">Preview Rules</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              กำหนดว่าเมื่อเลือกชุดตัวเลือกนี้ จะแสดงภาพแบบไหน —
              อัปโหลดรูปได้ในกฎนี้เลย
            </p>
          </div>

          <form onSubmit={(e) => void handleSaveRule(e)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_100px]">
              <div>
                <Label>ชื่อกฎ</Label>
                <Input
                  value={ruleForm.name}
                  onChange={(e) =>
                    setRuleForm({ ...ruleForm, name: e.target.value })
                  }
                  placeholder="เช่น Wave + รางมอเตอร์"
                />
              </div>
              <div>
                <Label>ลำดับ</Label>
                <Input
                  type="number"
                  value={ruleForm.priority}
                  onChange={(e) =>
                    setRuleForm({
                      ...ruleForm,
                      priority: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <CustomConditionBuilder
              rows={ruleForm.conditions}
              onChange={(conditions) =>
                setRuleForm({ ...ruleForm, conditions })
              }
              conditionOptions={conditionOptions}
            />

            <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
              <Label>รูป Preview</Label>
              <div className="flex flex-wrap items-start gap-4">
                <div className="relative aspect-[4/3] w-full max-w-xs overflow-hidden rounded-lg border bg-background">
                  {ruleImageUrl ? (
                    <ProductImage src={ruleImageUrl} alt="Preview" fill />
                  ) : (
                    <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
                      <ImageIcon className="size-10 opacity-40" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadingRuleImage}
                    onClick={() => uploadRef.current?.click()}
                  >
                    {uploadingRuleImage ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 size-4" />
                    )}
                    อัปโหลดรูป
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG/PNG/WebP ไม่เกิน 8MB
                  </p>
                  <input
                    ref={uploadRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleUploadRuleImage(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={ruleForm.isActive}
                  onCheckedChange={(v) =>
                    setRuleForm({ ...ruleForm, isActive: !!v })
                  }
                />
                เปิดใช้งานกฎนี้
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={savingRule}>
                {savingRule
                  ? "กำลังบันทึก..."
                  : ruleForm.id
                    ? "อัปเดตกฎ"
                    : "เพิ่มกฎ Preview"}
              </Button>
              {ruleForm.id ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRuleForm(emptyPreviewRuleForm())}
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
          กฎที่บันทึกแล้ว ({previewRules.length})
        </h3>
        {previewRules.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            ยังไม่มีกฎ — เพิ่มกฎแรกด้านบน
          </p>
        ) : (
          previewRules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="flex flex-wrap items-start gap-4 p-4">
                <div className="relative size-28 shrink-0 overflow-hidden rounded-md border">
                  {rule.assetUrl || rule.fallbackImageUrl ? (
                    <ProductImage
                      src={rule.assetUrl ?? rule.fallbackImageUrl}
                      alt={rule.name}
                      fill
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="size-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{rule.name}</p>
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? "เปิด" : "ปิด"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ลำดับ {rule.priority}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(rule.conditions).map(([key, value]) => (
                      <Badge key={`${key}:${value}`} variant="secondary">
                        {CONDITION_LABELS[key as ConditionKey] ?? key}:{" "}
                        {conditionValueLabel(key, value)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setRuleForm({
                        id: rule.id,
                        name: rule.name,
                        priority: rule.priority,
                        conditions: recordToConditionRows(rule.conditions),
                        assetId: rule.assetId ?? "",
                        previewImageUrl:
                          rule.assetUrl ?? rule.fallbackImageUrl ?? "",
                        isActive: rule.isActive,
                      })
                    }
                  >
                    แก้ไข
                  </Button>
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() =>
                      void toggleAdminConfiguratorPreviewRule({
                        data: { id: rule.id, isActive: !rule.isActive },
                        ...authOpts,
                      }).then(() => reloadRules())
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
