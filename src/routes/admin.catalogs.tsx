import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { CatalogAssetUpload } from "@/components/admin/catalog-asset-upload";
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
  fetchAdminCatalogViewStats,
  fetchAdminMarketingCatalogCategories,
  fetchAdminMarketingCatalogs,
  fetchAdminProducts,
  saveAdminMarketingCatalog,
  saveAdminMarketingCatalogCategory,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type {
  CatalogStatus,
  CatalogViewStatsDto,
  CatalogVisibility,
  MarketingCatalogCategoryDto,
  MarketingCatalogDto,
} from "@/types/api/marketing-catalogs";
import { slugifyCatalogTitle } from "@/lib/catalog-slug";

export const Route = createFileRoute("/admin/catalogs")({
  component: AdminCatalogsPage,
});

type CatalogFormState = {
  id?: string;
  slug: string;
  categoryId: string;
  title: string;
  brand: string;
  description: string;
  coverImageUrl: string;
  pdfUrl: string;
  pdfStoragePath: string;
  externalLink: string;
  tags: string;
  version: string;
  pageCount: number | null;
  fileSize: number | null;
  visibility: CatalogVisibility;
  allowDownload: boolean;
  isFeatured: boolean;
  status: CatalogStatus;
  sortOrder: number;
  productIds: string[];
};

const emptyForm = (): CatalogFormState => ({
  slug: "",
  categoryId: "",
  title: "",
  brand: "",
  description: "",
  coverImageUrl: "",
  pdfUrl: "",
  pdfStoragePath: "",
  externalLink: "",
  tags: "",
  version: "",
  pageCount: null,
  fileSize: null,
  visibility: "public",
  allowDownload: false,
  isFeatured: false,
  status: "published",
  sortOrder: 0,
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
  const [listCategory, setListCategory] = useState<string | "all">("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CatalogFormState>(emptyForm());
  const [viewStats, setViewStats] = useState<
    Record<string, CatalogViewStatsDto>
  >({});

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

    if (items.length) {
      try {
        const stats = await fetchAdminCatalogViewStats({
          data: { catalogIds: items.map((item) => item.id) },
          ...authOpts,
        });
        setViewStats(Object.fromEntries(stats.map((row) => [row.catalogId, row])));
      } catch {
        setViewStats({});
      }
    } else {
      setViewStats({});
    }
  }

  useEffect(() => {
    void reload();
  }, [session]);

  const sortedCatalogs = useMemo(
    () =>
      [...catalogs]
        .filter((item) =>
          listCategory === "all" ? true : item.categoryId === listCategory,
        )
        .sort(
          (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title),
        ),
    [catalogs, listCategory],
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
      slug: catalog.slug,
      categoryId: catalog.categoryId ?? "",
      title: catalog.title,
      brand: catalog.brand ?? "",
      description: catalog.description ?? "",
      coverImageUrl: catalog.coverImageUrl ?? "",
      pdfUrl: catalog.pdfUrl ?? "",
      pdfStoragePath: catalog.pdfStoragePath ?? "",
      externalLink: catalog.externalLink ?? "",
      tags: catalog.tags.join(", "),
      version: catalog.version ?? "",
      pageCount: catalog.pageCount,
      fileSize: catalog.fileSize,
      visibility: catalog.visibility,
      allowDownload: catalog.allowDownload,
      isFeatured: catalog.isFeatured,
      status: catalog.status,
      sortOrder: catalog.sortOrder,
      productIds: catalog.productIds,
    });
    setOpen(true);
  }

  async function handleSaveCatalog(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await saveAdminMarketingCatalog({
        data: {
          id: form.id,
          slug: form.slug || slugifyCatalogTitle(form.title, form.id),
          categoryId: form.categoryId || null,
          title: form.title,
          brand: form.brand || null,
          description: form.description || null,
          coverImageUrl: form.coverImageUrl || null,
          pdfUrl: form.pdfUrl || null,
          pdfStoragePath: form.pdfStoragePath || null,
          externalLink: form.externalLink || null,
          tags: form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          version: form.version || null,
          pageCount: form.pageCount,
          fileSize: form.fileSize,
          visibility: form.visibility,
          allowDownload: form.allowDownload,
          isFeatured: form.isFeatured,
          status: form.status,
          sortOrder: form.sortOrder,
          productIds: form.productIds,
        },
        ...authOpts,
      });
      if (!form.id && result.id) {
        setForm((current) => ({ ...current, id: result.id }));
      }
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

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={listCategory === "all" ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setListCategory("all")}
        >
          ทั้งหมด ({catalogs.length})
        </Button>
        {categories.map((category) => {
          const count = catalogs.filter(
            (item) => item.categoryId === category.id,
          ).length;
          return (
            <Button
              key={category.id}
              type="button"
              size="sm"
              variant={listCategory === category.id ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setListCategory(category.id)}
            >
              {category.name} ({count})
            </Button>
          );
        })}
      </div>

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
                    {catalog.visibility} · {catalog.status} ·{" "}
                    {catalog.pageCount ? `${catalog.pageCount} หน้า · ` : ""}
                    ผูกสินค้า {catalog.productIds.length} รายการ
                    {viewStats[catalog.id] ? (
                      <>
                        {" "}
                        · เปิดดู {viewStats[catalog.id].views7d}/
                        {viewStats[catalog.id].views30d}/
                        {viewStats[catalog.id].viewsAll} (7d/30d/ทั้งหมด)
                      </>
                    ) : null}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {catalog.status === "published" &&
                catalog.visibility === "public" ? (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`/catalogs/${catalog.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4" />
                      ดูออนไลน์
                    </a>
                  </Button>
                ) : null}
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
              <div className="space-y-2 sm:col-span-2">
                <Label>Slug (URL)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, slug: e.target.value }))
                  }
                  placeholder={slugifyCatalogTitle(
                    form.title || "catalog",
                    form.id,
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>เวอร์ชัน</Label>
                <Input
                  value={form.version}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      version: e.target.value,
                    }))
                  }
                  placeholder="2026 / R.01"
                />
              </div>
              <div className="space-y-2">
                <Label>การมองเห็น</Label>
                <Select
                  value={form.visibility}
                  onValueChange={(value: CatalogVisibility) =>
                    setForm((current) => ({ ...current, visibility: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">สาธารณะ</SelectItem>
                    <SelectItem value="dealer">Dealer only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>สถานะ</Label>
                <Select
                  value={form.status}
                  onValueChange={(value: CatalogStatus) =>
                    setForm((current) => ({ ...current, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
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

            <CatalogAssetUpload
              accessToken={session?.access_token}
              catalogId={form.id}
              coverImageUrl={form.coverImageUrl}
              pdfUrl={form.pdfUrl}
              onCoverChange={(url) =>
                setForm((current) => ({ ...current, coverImageUrl: url }))
              }
              onPdfChange={(url, meta) =>
                setForm((current) => ({
                  ...current,
                  pdfUrl: url,
                  pdfStoragePath: meta?.storagePath ?? current.pdfStoragePath,
                  pageCount: meta?.pageCount ?? current.pageCount,
                  fileSize: meta?.fileSize ?? current.fileSize,
                }))
              }
            />

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
                  checked={form.allowDownload}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      allowDownload: checked === true,
                    }))
                  }
                />
                อนุญาตดาวน์โหลด PDF
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.isFeatured}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      isFeatured: checked === true,
                    }))
                  }
                />
                แคตตาล็อกแนะนำ
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
