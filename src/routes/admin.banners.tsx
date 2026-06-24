import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { HeroBannerManager } from "@/components/admin/hero-banner-manager";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchAdminHeroBanners,
  saveAdminHeroBanners,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { useT } from "@/i18n";
import type { HeroBannerDto } from "@/types/api/hero-banners";

export const Route = createFileRoute("/admin/banners")({
  component: AdminBannersPage,
});

function AdminBannersPage() {
  const { t } = useT();
  const { session } = useAuth();
  const [banners, setBanners] = useState<HeroBannerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchAdminHeroBanners(authServerFnOptions(session))
      .then(setBanners)
      .finally(() => setLoading(false));
  }, [session]);

  async function handleSave() {
    setSaving(true);
    try {
      await saveAdminHeroBanners({
        data: {
          banners: banners.map((banner, index) => ({
            ...banner,
            sortOrder: index,
          })),
        },
        ...authServerFnOptions(session),
      });
      toast.success("บันทึกแบนเนอร์แล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">{t("common.loading")}</p>;
  }

  return (
    <div>
      <PageHeader
        title="แบนเนอร์หน้าแรก"
        description="อัปโหลดภาพแนวนอนสำหรับสไลด์ hero บนหน้าแรก"
      />
      <HeroBannerManager
        accessToken={session?.access_token}
        banners={banners}
        onChange={setBanners}
      />
      <div className="mt-6">
        <Button type="button" disabled={saving} onClick={() => void handleSave()}>
          {saving ? "กำลังบันทึก..." : "บันทึกแบนเนอร์"}
        </Button>
      </div>
    </div>
  );
}
