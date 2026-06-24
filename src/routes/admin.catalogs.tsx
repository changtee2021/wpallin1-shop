import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useAuth } from "@/hooks/use-auth";
import {
  deleteAdminMarketingCatalog,
  deleteAdminMarketingCatalogCategory,
  fetchAdminMarketingCatalogCategories,
  fetchAdminMarketingCatalogs,
  fetchAdminProducts,
  saveAdminMarketingCatalog,
  saveAdminMarketingCatalogCategory,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type {
  MarketingCatalogCategoryDto,
  MarketingCatalogDto,
} from "@/types/api/marketing-catalogs";

export const Route = createFileRoute("/admin/catalogs")({
  component: AdminCatalogsPage,
});

type CatalogFormState = {
  id?: string;
  categoryId: string;
  title: string;
  brand: string;
  description: string;
  coverImageUrl: string;
  pdfUrl: string;
  externalLink: string;
  tags: string;
  sortOrder: number;
  isPublic: boolean;
  isActive: boolean;
  productIds: string[];
};

const emptyForm = (): CatalogFormState => ({
  categoryId: "",
  title: "",
  brand: "",
  description: "",
  coverImageUrl: "",
  pdfUrl: "",
  externalLink: "",
  tags: "",
  sortOrder: 0,
  isPublic: true,
  isActive: true,
  productIds: [],
});

function AdminCatalogsPage() {
  const { session } = useAuth();
  const authOpts = authServerFnOptions(session);
  const [categories, setCategories] = useState<MarketingCatalogCategoryDto[]>(
    [],
  );
  const [catalogs, setCatalogs] = useState<MarketingCatalogDto[]>([]);
  const [products, setProducts] = useState<
    Array<{ id: string; name: string; sku: string | null }>
  >([]);
  const [categoryName, setCategoryName] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CatalogFormState>(emptyForm());
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  async function reload() {
    const [cats, items, productRows] = await Promise.all([
      fetchAdminMarketingCatalogCategories(authOpts),
      fetchAdminMarketingCatalogs(authOpts),
      fetchAdminProducts(authOpts),
    ]);
    setCategories(cats);
    setCatalogs(items);
    setProducts(
      productRows.map((row) => ({
        id: row.id,
        name: row.name,
        sku: row.sku,
      })),
    );
  }

  useEffect(() => {
    void reload();
  }, [session]);

  const sortedCatalogs = useMemo(
    () =>
      [...catalogs].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title),
      ),
    [catalogs],
  );

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    try {
      await saveAdminMarketingCatalogCategory({
        data: { name: categoryName },
        ...authOpts,
      });
      toast.success("เพิ่มหมวดแคตตาล็อกแล้ว");
      setCategoryName("");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  function openCreate() {
    setForm(emptyForm());
    setOpen(true);
  }

  function openEdit(catalog: MarketingCatalogDto) {
    setForm({
      id: catalog.id,
      categoryId: catalog.categoryId ?? "",
      title: catalog.title,
      brand: catalog.brand ?? "",
      description: catalog.description ?? "",
      coverImageUrl: catalog.coverImageUrl ?? "",
      pdfUrl: catalog.pdfUrl ?? "",
      externalLink: catalog.externalLink ?? "",
      tags: catalog.tags.join(", "),
      sortOrder: catalog.sortOrder,
      isPublic: catalog.isPublic,
      isActive: catalog.isActive,
      productIds: catalog.productIds,
    });
    setOpen(true);
  }

  async function uploadAsset(
    file: File,
    kind: "cover" | "pdf",
  ): Promise<string | null> {
    if (!session?.access_token) {
      toast.error("กรุณาเข้าสู่ระบบ");
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);

    const res = await fetch("/api/v1/catalog-asset", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: formData,
    });

    const json = (await res.json()) as { fileUrl?: string; error?: string };
    if (!res.ok) {
      throw new Error(json.error ?? "อัปโหลดไม่สำเร็จ");
    }

    return json.fileUrl ?? null;
  }

  async function handleUpload(kind: "cover" | "pdf", file: File | undefined) {
    if (!file) return;
    try {
      if (kind === "cover") setUploadingCover(true);
      else setUploadingPdf(true);

      const url = await uploadAsset(file, kind);
      if (!url) return;

      setForm((current) => ({
        ...current,
        coverImageUrl: kind === "cover" ? url : current.coverImageUrl,
        pdfUrl: kind === "pdf" ? url : current.pdfUrl,
      }));
      toast.success("อัปโหลดไฟล์แล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploadingCover(false);
      setUploadingPdf(false);
    }
  }

  async function handleSaveCatalog(e: React.FormEvent) {
    e.preventDefault();
    try {
      await saveAdminMarketingCatalog({
        data: {
          id: form.id,
          categoryId: form.categoryId || null,
          title: form.title,
          brand: form.brand || null,
          description: form.description || null,
          coverImageUrl: form.coverImageUrl || null,
          pdfUrl: form.pdfUrl || null,
          externalLink: form.externalLink || null,
          tags: form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          sortOrder: form.sortOrder,
          isPublic: form.isPublic,
          isActive: form.isActive,
          productIds: form.productIds,
        },
        ...authOpts,
      });
      toast.success("บันทึกแคตตาล็อกแล้ว");
      setOpen(false);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  async function handleDeleteCatalog(id: string) {
    if (!confirm("ลบแคตตาล็อกนี้?")) return;
    try {
      await deleteAdminMarketingCatalog({ data: { id }, ...authOpts });
      toast.success("ลบแล้ว");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("ลบหมวดนี้?")) return;
    try {
      await deleteAdminMarketingCatalogCategory({ data: { id }, ...authOpts });
      toast.success("ลบหมวดแล้ว");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  function toggleProduct(productId: string, checked: boolean) {
    setForm((current) => ({
      ...current,
      productIds: checked
        ? [...current.productIds, productId]
        : current.productIds.filter((id) => id !== productId),
    }));
  }

  return (
    <div>
      <PageHeader
        title="แคตตาล็อก PDF"
        description="อัปโหลดและจัดการแคตตาล็อกสำหรับลูกค้าดูออนไลน์"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            เพิ่มแคตตาล็อก
          </Button>
        }
      />

      <Card className="mb-6">
        <CardContent className="space-y-4 p-4">
          <h2 className="font-semibold">หมวดแคตตาล็อก</h2>
          <form
            onSubmit={handleSaveCategory}
            className="flex flex-wrap items-end gap-2"
          >
            <div className="min-w-[220px] flex-1 space-y-2">
              <Label>ชื่อหมวด</Label>
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="เช่น ผ้าม่าน / มู่ลี่"
                required
              />
            </div>
            <Button type="submit">เพิ่มหมวด</Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
              >
                <span>{category.name}</span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-7 text-destructive"
                  onClick={() => void handleDeleteCategory(category.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {sortedCatalogs.map((catalog) => (
          <Card key={catalog.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="size-16 overflow-hidden rounded-lg bg-muted">
                  {catalog.coverImageUrl ? (
                    <img
                      src={catalog.coverImageUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <BookOpen className="size-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold">{catalog.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {catalog.categoryName ?? "ไม่มีหมวด"}
                    {catalog.brand ? ` · ${catalog.brand}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {catalog.isPublic ? "สาธารณะ" : "ซ่อน"} ·{" "}
                    {catalog.isActive ? "เปิดใช้งาน" : "ปิด"} · ผูกสินค้า{" "}
                    {catalog.productIds.length} รายการ
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(catalog)}
                >
                  <Pencil className="size-4" />
                  แก้ไข
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => void handleDeleteCatalog(catalog.id)}
                >
                  <Trash2 className="size-4" />
                  ลบ
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {form.id ? "แก้ไขแคตตาล็อก" : "เพิ่มแคตตาล็อก"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCatalog} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>ชื่อแคตตาล็อก</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      title: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>หมวด</Label>
                <Select
                  value={form.categoryId || "none"}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      categoryId: value === "none" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่ระบุหมวด</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>แบรนด์</Label>
                <Input
                  value={form.brand}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      brand: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>คำอธิบาย</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>แท็ก (คั่นด้วย ,)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      tags: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>ลำดับ</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      sortOrder: Number(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>รูปปก</Label>
                <Input
                  value={form.coverImageUrl}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      coverImageUrl: e.target.value,
                    }))
                  }
                  placeholder="URL หรืออัปโหลด"
                />
                <label className="inline-flex">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) =>
                      void handleUpload("cover", e.target.files?.[0])
                    }
                  />
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="size-4" />
                      {uploadingCover ? "กำลังอัปโหลด..." : "อัปโหลดรูป"}
                    </span>
                  </Button>
                </label>
              </div>
              <div className="space-y-2">
                <Label>ไฟล์ PDF</Label>
                <Input
                  value={form.pdfUrl}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      pdfUrl: e.target.value,
                    }))
                  }
                  placeholder="URL หรืออัปโหลด"
                />
                <label className="inline-flex">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) =>
                      void handleUpload("pdf", e.target.files?.[0])
                    }
                  />
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="size-4" />
                      {uploadingPdf ? "กำลังอัปโหลด..." : "อัปโหลด PDF"}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>ลิงก์ภายนอก (ถ้ามี)</Label>
              <Input
                value={form.externalLink}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    externalLink: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.isPublic}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      isPublic: checked === true,
                    }))
                  }
                />
                แสดงสาธารณะ
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      isActive: checked === true,
                    }))
                  }
                />
                เปิดใช้งาน
              </label>
            </div>

            <div className="space-y-2">
              <Label>ผูกกับสินค้า (แสดงปุ่มในหน้าสินค้า)</Label>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3">
                {products.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={form.productIds.includes(product.id)}
                      onCheckedChange={(checked) =>
                        toggleProduct(product.id, checked === true)
                      }
                    />
                    <span>
                      {product.name}
                      {product.sku ? ` (${product.sku})` : ""}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">บันทึก</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
