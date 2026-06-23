import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchAdminCoupons,
  fetchAdminPromotions,
  fetchPromptPayId,
  saveAdminCouponFn,
  saveAdminPromotionFn,
  updatePromptPayIdFn,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type {
  CouponAdminDto,
  PromotionAdminDto,
} from "@/services/promotion-admin.service";

export const Route = createFileRoute("/admin/coupons")({
  component: AdminCouponsPage,
});

function AdminCouponsPage() {
  const { session } = useAuth();
  const authOpts = authServerFnOptions(session);
  const [coupons, setCoupons] = useState<CouponAdminDto[]>([]);
  const [promotions, setPromotions] = useState<PromotionAdminDto[]>([]);
  const [promptPayId, setPromptPayId] = useState("");
  const [couponForm, setCouponForm] = useState({
    code: "",
    description: "",
    discountType: "fixed" as "fixed" | "percent",
    discountValue: "100",
    minOrderAmount: "0",
    isActive: true,
  });
  const [promoForm, setPromoForm] = useState({
    slug: "",
    title: "",
    description: "",
    isActive: true,
  });

  async function reload() {
    const [c, p, pp] = await Promise.all([
      fetchAdminCoupons(authOpts),
      fetchAdminPromotions(authOpts),
      fetchPromptPayId(),
    ]);
    setCoupons(c);
    setPromotions(p);
    setPromptPayId(pp.promptPayId ?? "");
  }

  useEffect(() => {
    void reload();
  }, [session]);

  async function saveCoupon() {
    try {
      await saveAdminCouponFn({
        data: {
          code: couponForm.code,
          description: couponForm.description || undefined,
          discountType: couponForm.discountType,
          discountValue: Number(couponForm.discountValue),
          minOrderAmount: Number(couponForm.minOrderAmount),
          isActive: couponForm.isActive,
        },
        ...authOpts,
      });
      toast.success("บันทึกคูปองแล้ว");
      setCouponForm({
        code: "",
        description: "",
        discountType: "fixed",
        discountValue: "100",
        minOrderAmount: "0",
        isActive: true,
      });
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  async function savePromotion() {
    try {
      await saveAdminPromotionFn({
        data: {
          slug: promoForm.slug,
          title: promoForm.title,
          description: promoForm.description || undefined,
          isActive: promoForm.isActive,
        },
        ...authOpts,
      });
      toast.success("บันทึกโปรโมชันแล้ว");
      setPromoForm({ slug: "", title: "", description: "", isActive: true });
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  async function savePromptPay() {
    try {
      await updatePromptPayIdFn({
        data: { promptPayId },
        ...authOpts,
      });
      toast.success("บันทึก PromptPay แล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  return (
    <div>
      <PageHeader
        title="คูปอง / โปรโมชัน"
        description="จัดการส่วนลดและ PromptPay"
      />

      <Tabs defaultValue="coupons">
        <TabsList>
          <TabsTrigger value="coupons">คูปอง</TabsTrigger>
          <TabsTrigger value="promotions">โปรโมชัน</TabsTrigger>
          <TabsTrigger value="promptpay">PromptPay</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="space-y-4">
          <Card>
            <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
              <div>
                <Label>รหัสคูปอง</Label>
                <Input
                  value={couponForm.code}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, code: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>ประเภท</Label>
                <Select
                  value={couponForm.discountType}
                  onValueChange={(v) =>
                    setCouponForm({
                      ...couponForm,
                      discountType: v as "fixed" | "percent",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">จำนวนเงิน (บาท)</SelectItem>
                    <SelectItem value="percent">เปอร์เซ็นต์ (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>มูลค่าส่วนลด</Label>
                <Input
                  type="number"
                  value={couponForm.discountValue}
                  onChange={(e) =>
                    setCouponForm({
                      ...couponForm,
                      discountValue: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>ยอดขั้นต่ำ</Label>
                <Input
                  type="number"
                  value={couponForm.minOrderAmount}
                  onChange={(e) =>
                    setCouponForm({
                      ...couponForm,
                      minOrderAmount: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Switch
                  checked={couponForm.isActive}
                  onCheckedChange={(checked) =>
                    setCouponForm({ ...couponForm, isActive: checked })
                  }
                />
                <Label>เปิดใช้งาน</Label>
              </div>
              <Button onClick={() => void saveCoupon()}>เพิ่มคูปอง</Button>
            </CardContent>
          </Card>
          <div className="space-y-2">
            {coupons.map((c) => (
              <Card key={c.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <div>
                    <p className="font-semibold">{c.code}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.discountType === "percent"
                        ? `${c.discountValue}%`
                        : `${c.discountValue} บาท`}{" "}
                      · ใช้แล้ว {c.usedCount}
                      {c.maxUses ? `/${c.maxUses}` : ""}
                    </p>
                  </div>
                  <Badge variant={c.isActive ? "default" : "secondary"}>
                    {c.isActive ? "active" : "off"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="promotions" className="space-y-4">
          <Card>
            <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
              <div>
                <Label>Slug</Label>
                <Input
                  value={promoForm.slug}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, slug: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>หัวข้อ</Label>
                <Input
                  value={promoForm.title}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, title: e.target.value })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label>รายละเอียด</Label>
                <Input
                  value={promoForm.description}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, description: e.target.value })
                  }
                />
              </div>
              <Button onClick={() => void savePromotion()}>
                เพิ่มโปรโมชัน
              </Button>
            </CardContent>
          </Card>
          <div className="space-y-2">
            {promotions.map((p) => (
              <Card key={p.id}>
                <CardContent className="flex justify-between p-4">
                  <div>
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-sm text-muted-foreground">{p.slug}</p>
                  </div>
                  <Badge variant={p.isActive ? "default" : "secondary"}>
                    {p.isActive ? "active" : "off"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="promptpay">
          <Card>
            <CardContent className="space-y-3 p-4">
              <p className="text-sm text-muted-foreground">
                เบอร์โทร 10 หลัก หรือเลขนิติบุคคล 13 หลัก — ใช้สร้าง QR
                หลังสั่งซื้อ
              </p>
              <div>
                <Label>PromptPay ID</Label>
                <Input
                  value={promptPayId}
                  onChange={(e) => setPromptPayId(e.target.value)}
                />
              </div>
              <Button onClick={() => void savePromptPay()}>บันทึก</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
