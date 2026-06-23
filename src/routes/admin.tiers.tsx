import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchAdminMemberTiers,
  saveAdminMemberTier,
  syncAdminTierPrices,
} from "@/lib/api.functions";
import { formatPrice } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { MemberTierDto } from "@/services/tier.service";

export const Route = createFileRoute("/admin/tiers")({
  component: AdminTiersPage,
});

function AdminTiersPage() {
  const { session } = useAuth();
  const [tiers, setTiers] = useState<MemberTierDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  async function load() {
    const data = await fetchAdminMemberTiers(authServerFnOptions(session));
    setTiers(data);
  }

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [session]);

  async function handleSave(tier: MemberTierDto) {
    setSaving(tier.tier);
    try {
      await saveAdminMemberTier({
        data: {
          tier: tier.tier,
          displayName: tier.displayName,
          minLifetimeSpend: tier.minLifetimeSpend,
          discountPct: tier.discountPct,
          sortOrder: tier.sortOrder,
          isActive: tier.isActive,
        },
        ...authServerFnOptions(session),
      });
      toast.success("บันทึกระดับสมาชิกแล้ว");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setSaving(null);
    }
  }

  async function handleSyncPrices(tier: string) {
    setSyncing(tier);
    try {
      const { count } = await syncAdminTierPrices({
        data: { tier },
        ...authServerFnOptions(session),
      });
      toast.success(`อัปเดตราคาขายส่ง ${count} รายการ`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setSyncing(null);
    }
  }

  function patchTier(tierId: string, patch: Partial<MemberTierDto>) {
    setTiers((prev) =>
      prev.map((t) => (t.tier === tierId ? { ...t, ...patch } : t)),
    );
  }

  return (
    <div>
      <PageHeader
        title="ระดับสมาชิก / ส่วนลดขายส่ง"
        description="กำหนดยอดซื้อสะสม ส่วนลด และซิงก์ราคาต่อสินค้า"
      />
      {loading ? (
        <p className="text-muted-foreground">กำลังโหลด...</p>
      ) : (
        <div className="space-y-4">
          {tiers.map((tier) => (
            <Card key={tier.tier}>
              <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_auto]">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>รหัส tier</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{tier.tier}</Badge>
                      <span className="text-sm text-muted-foreground">
                        ลำดับ {tier.sortOrder}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>ชื่อแสดง</Label>
                    <Input
                      value={tier.displayName}
                      onChange={(e) =>
                        patchTier(tier.tier, { displayName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ยอดซื้อสะสมขั้นต่ำ (บาท)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={tier.minLifetimeSpend}
                      onChange={(e) =>
                        patchTier(tier.tier, {
                          minLifetimeSpend: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ส่วนลด (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={tier.discountPct}
                      onChange={(e) =>
                        patchTier(tier.tier, {
                          discountPct: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <Switch
                      checked={tier.isActive}
                      onCheckedChange={(checked) =>
                        patchTier(tier.tier, { isActive: checked })
                      }
                    />
                    <Label>เปิดใช้งาน</Label>
                    <span className="text-sm text-muted-foreground">
                      ยอดขั้นต่ำ {formatPrice(tier.minLifetimeSpend)} · ลด{" "}
                      {tier.discountPct}%
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 lg:items-end">
                  <Button
                    onClick={() => void handleSave(tier)}
                    disabled={saving === tier.tier}
                  >
                    {saving === tier.tier ? "กำลังบันทึก..." : "บันทึก"}
                  </Button>
                  {tier.tier !== "retail" ? (
                    <Button
                      variant="outline"
                      onClick={() => void handleSyncPrices(tier.tier)}
                      disabled={syncing === tier.tier}
                    >
                      {syncing === tier.tier
                        ? "กำลังซิงก์..."
                        : "ซิงก์ราคาขายส่ง"}
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
