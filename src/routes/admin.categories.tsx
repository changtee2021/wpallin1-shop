import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
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
      await saveAdminCategory({
        data: { name, slug },
        ...authOpts,
      });
      toast.success("บันทึกหมวดหมู่แล้ว");
      setName("");
      setSlug("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  async function toggleActive(cat: CategoryDto) {
    await saveAdminCategory({
      data: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        isActive: !cat.isActive,
      },
      ...authOpts,
    });
    await load();
  }

  return (
    <div>
      <PageHeader title="หมวดหมู่สินค้า" description="จัดการหมวดในร้านค้า" />
      <Card className="mb-6">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
          <form onSubmit={handleSave} className="contents">
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
            <Button type="submit" className="sm:col-span-2 sm:w-fit">
              เพิ่มหมวด
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{cat.name}</p>
                <p className="text-sm text-muted-foreground">{cat.slug}</p>
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
