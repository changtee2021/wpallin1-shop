import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
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
import { useAuth } from "@/hooks/use-auth";
import type { AdminOptionGroupInput } from "@/domain/product-options";
import {
  createAdminCustomProject,
  fetchAdminConfiguratorRules,
  fetchAdminCustomProjects,
  fetchAdminCustomSettings,
  fetchAdminFabrics,
  fetchCategories,
  saveAdminConfiguratorPreviewRule,
  saveAdminCustomProduct,
  toggleAdminConfiguratorPreviewRule,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type {
  AdminConfiguratorPreviewRule,
  AdminCustomProjectRow,
  AdminFabricRow,
  ColorOption,
  FabricCollectionOption,
} from "@/services/admin-custom.service";
import type { CategoryDto } from "@/types/api/categories";

export const Route = createFileRoute("/admin/custom")({
  component: AdminCustomPage,
});

type ConditionKey =
  | "product_type"
  | "fabric_id"
  | "fabric_collection_id"
  | "color_id"
  | "rail"
  | "installation";

type ConditionRow = { id: string; key: ConditionKey; value: string };

type ProductFormState = {
  name: string;
  slug: string;
  categoryId: string;
  isActive: boolean;
};

type PreviewRuleFormState = {
  id?: string;
  name: string;
  priority: number;
  conditions: ConditionRow[];
  assetId: string;
  previewImageUrl: string;
  isActive: boolean;
};

const CONDITION_LABELS: Record<ConditionKey, string> = {
  product_type: "ประเภทม่าน",
  fabric_id: "ผ้า",
  fabric_collection_id: "คอลเลกชันผ้า",
  color_id: "สี",
  rail: "ราง",
  installation: "ติดตั้ง",
};

const CONDITION_KEYS = Object.keys(CONDITION_LABELS) as ConditionKey[];

const defaultConditions = (): ConditionRow[] => [
  { id: crypto.randomUUID(), key: "product_type", value: "" },
];

const emptyPreviewRuleForm = (): PreviewRuleFormState => ({
  name: "",
  priority: 100,
  conditions: defaultConditions(),
  assetId: "",
  previewImageUrl: "",
  isActive: true,
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ก-๙\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function conditionRowsToRecord(rows: ConditionRow[]): Record<string, string> {
  return Object.fromEntries(
    rows
      .filter((row) => row.key && row.value)
      .map((row) => [row.key, row.value]),
  );
}

function recordToConditionRows(record: Record<string, string>): ConditionRow[] {
  const rows = Object.entries(record)
    .filter(
      ([key, value]) => CONDITION_KEYS.includes(key as ConditionKey) && value,
    )
    .map(([key, value]) => ({
      id: crypto.randomUUID(),
      key: key as ConditionKey,
      value,
    }));
  return rows.length ? rows : defaultConditions();
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function AdminCustomPage() {
  const { session } = useAuth();
  const authOpts = authServerFnOptions(session);
  const uploadRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingRule, setSavingRule] = useState(false);
  const [uploadingRuleImage, setUploadingRuleImage] = useState(false);

  const [productId, setProductId] = useState("");
  const [projects, setProjects] = useState<AdminCustomProjectRow[]>([]);
  const [newProjectForm, setNewProjectForm] = useState<ProductFormState>({
    name: "",
    slug: "",
    categoryId: "",
    isActive: true,
  });
  const [productForm, setProductForm] = useState<ProductFormState>({
    name: "",
    slug: "",
    categoryId: "",
    isActive: true,
  });
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [optionGroups, setOptionGroups] = useState<AdminOptionGroupInput[]>([]);
  const [fabrics, setFabrics] = useState<AdminFabricRow[]>([]);
  const [collections, setCollections] = useState<FabricCollectionOption[]>([]);
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [previewRules, setPreviewRules] = useState<
    AdminConfiguratorPreviewRule[]
  >([]);
  const [ruleForm, setRuleForm] =
    useState<PreviewRuleFormState>(emptyPreviewRuleForm);

  async function loadProject(nextProductId?: string) {
    setLoadingProject(true);
    try {
      const settings = await fetchAdminCustomSettings({
        data: { productId: nextProductId },
        ...authOpts,
      });
      setProductId(settings.productId);
      setProductForm({
        name: settings.productName,
        slug: settings.productSlug,
        categoryId: settings.categoryId ?? "",
        isActive: settings.isActive,
      });
      setOptionGroups(settings.optionGroups);
      const ruleData = await fetchAdminConfiguratorRules({
        data: { productId: settings.productId },
        ...authOpts,
      });
      setPreviewRules(ruleData.previewRules);
      setRuleForm(emptyPreviewRuleForm());
    } finally {
      setLoadingProject(false);
    }
  }

  async function loadAll() {
    const [projectList, fabricData, categoryList] = await Promise.all([
      fetchAdminCustomProjects(authOpts),
      fetchAdminFabrics(authOpts),
      fetchCategories(),
    ]);
    setProjects(projectList);
    setFabrics(fabricData.fabrics);
    setCollections(fabricData.collections);
    setColors(fabricData.colors);
    setCategories(categoryList);
    await loadProject(projectList[0]?.id);
  }

  useEffect(() => {
    void loadAll()
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "โหลดไม่สำเร็จ"),
      )
      .finally(() => setLoading(false));
  }, [session]);

  async function reloadRules() {
    if (!productId) return;
    const ruleData = await fetchAdminConfiguratorRules({
      data: { productId },
      ...authOpts,
    });
    setPreviewRules(ruleData.previewRules);
  }

  async function reloadProjects() {
    const projectList = await fetchAdminCustomProjects(authOpts);
    setProjects(projectList);
  }

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

  const productTypeChoices =
    optionGroups.find((g) => g.groupKey === "product_type")?.choices ?? [];
  const railChoices =
    optionGroups.find((g) => g.groupKey === "rail")?.choices ?? [];
  const installationChoices =
    optionGroups.find((g) => g.groupKey === "installation")?.choices ?? [];

  function conditionOptions(key: ConditionKey) {
    switch (key) {
      case "product_type":
        return productTypeChoices.map((c) => ({
          value: c.key,
          label: c.label,
        }));
      case "fabric_id":
        return fabrics.map((f) => ({
          value: f.id,
          label: `${f.code} — ${f.name}`,
        }));
      case "fabric_collection_id":
        return collections.map((c) => ({ value: c.id, label: c.name }));
      case "color_id":
        return colors.map((c) => ({ value: c.id, label: c.name }));
      case "rail":
        return railChoices.map((c) => ({ value: c.key, label: c.label }));
      case "installation":
        return installationChoices.map((c) => ({
          value: c.key,
          label: c.label,
        }));
      default:
        return [];
    }
  }

  function conditionValueLabel(key: string, value: string) {
    return (
      conditionOptions(key as ConditionKey).find((o) => o.value === value)
        ?.label ?? value
    );
  }

  function renderConditionBuilder(
    rows: ConditionRow[],
    onChange: (rows: ConditionRow[]) => void,
  ) {
    return (
      <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label>เงื่อนไข</Label>
            <p className="text-xs text-muted-foreground">
              เลือกว่าตัวเลือกไหนจับคู่กับตัวเลือกไหน
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange([
                ...rows,
                { id: crypto.randomUUID(), key: "product_type", value: "" },
              ])
            }
          >
            <Plus className="mr-2 size-4" />
            เพิ่มเงื่อนไข
          </Button>
        </div>
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="grid gap-2 rounded-lg border bg-background p-3 md:grid-cols-[140px_1fr_auto]"
          >
            <Select
              value={row.key}
              onValueChange={(value) =>
                onChange(
                  rows.map((r) =>
                    r.id === row.id
                      ? {
                          ...r,
                          key: value as ConditionKey,
                          value: value !== r.key ? "" : r.value,
                        }
                      : r,
                  ),
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {CONDITION_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={row.value || "__none__"}
              onValueChange={(value) =>
                onChange(
                  rows.map((r) =>
                    r.id === row.id
                      ? { ...r, value: value === "__none__" ? "" : value }
                      : r,
                  ),
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกค่า" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— เลือกค่า —</SelectItem>
                {conditionOptions(row.key).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={index === 0}
                onClick={() => onChange(moveItem(rows, index, -1))}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={index === rows.length - 1}
                onClick={() => onChange(moveItem(rows, index, 1))}
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onChange(rows.filter((r) => r.id !== row.id))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (loading) {
    return <p className="text-muted-foreground">กำลังโหลด...</p>;
  }

  const ruleImageUrl = ruleForm.previewImageUrl;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Custom Configurator"
          description="สร้างสินค้า Custom + กำหนดภาพ Preview ตามเงื่อนไข"
        />
        <Button variant="outline" size="sm" asChild>
          <Link to="/configurator" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 size-4" />
            ดู Configurator
          </Link>
        </Button>
      </div>

      <ol className="grid gap-2 text-sm sm:grid-cols-4">
        {[
          "1. สร้าง Project",
          "2. เลือกหมวด",
          "3. กฎ + อัปรูป",
          "4. บันทึก",
        ].map((step) => (
          <li
            key={step}
            className="rounded-lg border bg-muted/30 px-3 py-2 text-center text-xs font-medium sm:text-sm"
          >
            {step}
          </li>
        ))}
      </ol>

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
            className="grid gap-3 rounded-xl border bg-muted/20 p-3 lg:grid-cols-[1fr_1fr_1fr_auto]"
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
        <p className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
          กำลังโหลด Project...
        </p>
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

            {renderConditionBuilder(ruleForm.conditions, (conditions) =>
              setRuleForm({ ...ruleForm, conditions }),
            )}

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
