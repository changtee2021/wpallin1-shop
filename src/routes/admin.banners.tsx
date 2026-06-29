import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageLoading } from "@/components/loading";
import { HeroBannerManager } from "@/components/admin/hero-banner-manager";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchAdminHeroBanners,
  fetchAdminShopHeroBanners,
  saveAdminHeroBanners,
  saveAdminShopHeroBanners,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { HeroBannerDto } from "@/types/api/hero-banners";

export const Route = createFileRoute("/admin/banners")({
  component: AdminBannersPage,
});

function AdminBannersPage() {
  const { session } = useAuth();
  const [homeBanners, setHomeBanners] = useState<HeroBannerDto[]>([]);
  const [shopBanners, setShopBanners] = useState<HeroBannerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingHome, setSavingHome] = useState(false);
  const [savingShop, setSavingShop] = useState(false);

  useEffect(() => {
    const opts = authServerFnOptions(session);
    void Promise.all([
      fetchAdminHeroBanners(opts),
      fetchAdminShopHeroBanners(opts),
    ])
      .then(([home, shop]) => {
        setHomeBanners(home);
        setShopBanners(shop);
      })
      .finally(() => setLoading(false));
  }, [session]);

  async function handleSaveHome() {
    setSavingHome(true);
    try {
      await saveAdminHeroBanners({
        data: {
          banners: homeBanners.map((banner, index) => ({
            ...banner,
            sortOrder: index,
          })),
        },
        ...authServerFnOptions(session),
      });
      toast.success("บันทึกแบนเนอร์หน้าแรกแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSavingHome(false);
    }
  }

  async function handleSaveShop() {
    setSavingShop(true);
    try {
      await saveAdminShopHeroBanners({
        data: {
          banners: shopBanners.map((banner, index) => ({
            ...banner,
            sortOrder: index,
          })),
        },
        ...authServerFnOptions(session),
      });
      toast.success("บันทึกแบนเนอร์หน้าร้านแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSavingShop(false);
    }
  }

  if (loading) {
    return <PageLoading variant="form" />;
  }

  return (
    <div>
      <PageHeader
        title="แบนเนอร์"
        description="จัดการสไลด์แบนเนอร์แยกระหว่างหน้าแรกกับหน้าสินค้ารวม"
      />

      <Tabs defaultValue="home" className="mt-2">
        <TabsList>
          <TabsTrigger value="home">หน้าแรก</TabsTrigger>
          <TabsTrigger value="shop">หน้าสินค้ารวม</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="mt-6 space-y-6">
          <p className="text-sm text-muted-foreground">
            แบนเนอร์มุมมน แสดงในคอนเทนต์หน้าแรก
          </p>
          <HeroBannerManager
            accessToken={session?.access_token}
            banners={homeBanners}
            onChange={setHomeBanners}
            activeLabel="แสดงบนหน้าแรก"
          />
          <Button
            type="button"
            disabled={savingHome}
            onClick={() => void handleSaveHome()}
          >
            {savingHome ? "กำลังบันทึก..." : "บันทึกแบนเนอร์หน้าแรก"}
          </Button>
        </TabsContent>

        <TabsContent value="shop" className="mt-6 space-y-6">
          <p className="text-sm text-muted-foreground">
            แบนเนอร์เต็มความกว้าง ไม่มีมุมมน แสดงบนสุดหน้าสินค้ารวม
          </p>
          <HeroBannerManager
            accessToken={session?.access_token}
            banners={shopBanners}
            onChange={setShopBanners}
            activeLabel="แสดงบนหน้าสินค้ารวม"
          />
          <Button
            type="button"
            disabled={savingShop}
            onClick={() => void handleSaveShop()}
          >
            {savingShop ? "กำลังบันทึก..." : "บันทึกแบนเนอร์หน้าร้าน"}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
