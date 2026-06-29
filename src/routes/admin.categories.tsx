import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminImageUploader } from "@/components/admin/shared/admin-image-uploader";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { PRODUCT_IMAGE_ENDPOINT } from "@/lib/admin-image-upload";
import { fetchAdminCategories, saveAdminCategory } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { CategoryDto } from "@/services/category.service";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const { session } = useAuth();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const authOpts = authServerFnOptions(session);

  async function load() {
    setCategories(await fetchAdminCategories(authOpts));
  }

  useEffect(() => {
    void load();
  }, [session]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const nextSort =
        categories.reduce((max, cat) => Math.max(max, cat.sortOrder), -1) + 1;
      await saveAdminCategory({
        data: {
          name,
          slug,
          imageUrl: imageUrl || null,
          sortOrder: nextSort,
        },
        ...authOpts,
      });
      toast.success("บันทึกหมวดหมู่แล้ว");
      setName("");
      setSlug("");
      setImageUrl("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  async function saveCategoryRow(
    cat: CategoryDto,
    patch: Partial<Pick<CategoryDto, "isActive" | "imageUrl" | "sortOrder">>,
  ) {
    await saveAdminCategory({
      data: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        imageUrl: patch.imageUrl !== undefined ? patch.imageUrl : cat.imageUrl,
        sortOrder: patch.sortOrder ?? cat.sortOrder,
        isActive: patch.isActive ?? cat.isActive,
      },
      ...authOpts,
    });
    await load();
  }

  async function toggleActive(cat: CategoryDto) {
    await saveCategoryRow(cat, { isActive: !cat.isActive });
  }

  async function moveCategory(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const current = categories[index];
    const neighbor = categories[target];
    await Promise.all([
      saveAdminCategory({
        data: {
          id: current.id,
          name: current.name,
          slug: current.slug,
          imageUrl: current.imageUrl,
          sortOrder: neighbor.sortOrder,
          isActive: current.isActive,
        },
        ...authOpts,
      }),
      saveAdminCategory({
        data: {
          id: neighbor.id,
          name: neighbor.name,
          slug: neighbor.slug,
          imageUrl: neighbor.imageUrl,
          sortOrder: current.sortOrder,
          isActive: neighbor.isActive,
        },
        ...authOpts,
      }),
    ]);
    await load();
  }

  return (
    <div>
      <PageHeader title="หมวดหมู่สินค้า" description="จัดการหมวดในร้านค้า" />
      <Card className="mb-6">
        <CardContent className="space-y-4 p-4">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>ชื่อหมวด</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>
            </div>
            <AdminImageUploader
              accessToken={session?.access_token}
              imageUrl={imageUrl}
              onImageUrlChange={setImageUrl}
              uploadEndpoint={PRODUCT_IMAGE_ENDPOINT}
              label="รูปหมวด (ไม่บังคับ)"
              previewClassName="aspect-[16/9] w-full max-w-xs rounded-lg border object-cover"
            />
            <Button type="submit" className="sm:w-fit">
              เพิ่มหมวด
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {categories.map((cat, index) => (
          <Card key={cat.id}>
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt=""
                  className="size-16 rounded-lg border object-cover"
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-lg border bg-muted text-xs text-muted-foreground">
                  ไม่มีรูป
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium">{cat.name}</p>
                <p className="text-sm text-muted-foreground">{cat.slug}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === 0}
                  onClick={() => void moveCategory(index, -1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === categories.length - 1}
                  onClick={() => void moveCategory(index, 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
              </div>
              <div className="w-full sm:max-w-xs">
                <AdminImageUploader
                  accessToken={session?.access_token}
                  imageUrl={cat.imageUrl ?? ""}
                  onImageUrlChange={(url) =>
                    void saveCategoryRow(cat, { imageUrl: url || null }).catch(
                      (err) =>
                        toast.error(
                          err instanceof Error ? err.message : "ไม่สำเร็จ",
                        ),
                    )
                  }
                  uploadEndpoint={PRODUCT_IMAGE_ENDPOINT}
                  label="รูปหมวด"
                  previewClassName="aspect-[16/9] w-full rounded-lg border object-cover"
                />
              </div>
              <Switch
                checked={cat.isActive}
                onCheckedChange={() => void toggleActive(cat)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
