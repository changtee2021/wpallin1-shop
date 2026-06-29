import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { ProductOptionsEditor } from "@/components/admin/product-options-editor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchAdminProduct,
  fetchCategories,
  saveAdminProduct,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { AdminOptionGroupInput } from "@/domain/product-options";
import type { CategoryDto } from "@/types/api/categories";

export const Route = createFileRoute("/admin/products/$id")({
  component: AdminProductEditPage,
});

function AdminProductEditPage() {
  const { id } = Route.useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    sku: "",
    categoryId: "",
    description: "",
    retailPrice: 0,
    stockQty: 0,
    imageUrl: "",
    isFeatured: false,
    isActive: true,
  });
  const [optionGroups, setOptionGroups] = useState<AdminOptionGroupInput[]>([]);

  useEffect(() => {
    void Promise.all([
      fetchCategories(),
      fetchAdminProduct({ data: { id }, ...authServerFnOptions(session) }),
    ]).then(([cats, product]) => {
      setCategories(cats);
      if (product) {
        setForm({
          name: product.name,
          slug: product.slug,
          sku: product.sku ?? "",
          categoryId: product.categoryId ?? "",
          description: product.description ?? "",
          retailPrice: product.retailPrice,
          stockQty: product.stockQty ?? 0,
          imageUrl: product.imageUrl ?? "",
          isFeatured: product.isFeatured ?? false,
          isActive: product.isActive ?? true,
        });
        setOptionGroups(product.optionGroups ?? []);
      }
      setLoading(false);
    });
  }, [id, session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveAdminProduct({
        data: {
          id,
          ...form,
          categoryId: form.categoryId || null,
          retailPrice: Number(form.retailPrice),
          stockQty: Number(form.stockQty),
          optionGroups,
        },
        ...authServerFnOptions(session),
      });
      toast.success("อัปเดตสินค้าแล้ว");
      void navigate({ to: "/admin/products" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoading variant="form" />;

  return (
    <div className="max-w-2xl">
      <PageHeader title="แก้ไขสินค้า" description={form.name} />
      <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
        <div>
          <Label>ชื่อสินค้า</Label>
          <Input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <Label>Slug</Label>
          <Input
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>SKU</Label>
            <Input
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
          </div>
          <div>
            <Label>หมวดหมู่</Label>
            <Select
              value={form.categoryId}
              onValueChange={(v) => setForm({ ...form, categoryId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกหมวด" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>รายละเอียด</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>ราคาปลีก (บาท)</Label>
            <Input
              type="number"
              min={0}
              required
              value={form.retailPrice}
              onChange={(e) =>
                setForm({ ...form, retailPrice: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <Label>สต็อก</Label>
            <Input
              type="number"
              min={0}
              value={form.stockQty}
              onChange={(e) =>
                setForm({ ...form, stockQty: Number(e.target.value) })
              }
            />
          </div>
        </div>
        <div>
          <Label>URL รูปภาพ</Label>
          <Input
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
        </div>
        <ProductOptionsEditor
          groups={optionGroups}
          onChange={setOptionGroups}
        />
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isFeatured}
              onCheckedChange={(v) => setForm({ ...form, isFeatured: !!v })}
            />
            สินค้าแนะนำ
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isActive}
              onCheckedChange={(v) => setForm({ ...form, isActive: !!v })}
            />
            เปิดขาย
          </label>
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={saving} className="bg-primary">
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/admin/products">กลับ</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
