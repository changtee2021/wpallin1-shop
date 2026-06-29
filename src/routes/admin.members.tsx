import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchAdminMemberTiers,
  fetchAdminMembers,
  setAdminMemberTier,
} from "@/lib/api.functions";
import { formatPrice } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { tierLabel } from "@/lib/member-tier";
import type { MemberTierDto, AdminMemberDto } from "@/services/tier.service";

export const Route = createFileRoute("/admin/members")({
  component: AdminMembersPage,
});

function AdminMembersPage() {
  const { session } = useAuth();
  const [members, setMembers] = useState<AdminMemberDto[]>([]);
  const [tiers, setTiers] = useState<MemberTierDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    const [memberList, tierList] = await Promise.all([
      fetchAdminMembers(authServerFnOptions(session)),
      fetchAdminMemberTiers(authServerFnOptions(session)),
    ]);
    setMembers(memberList);
    setTiers(tierList);
  }

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [session]);

  async function handleTierChange(userId: string, tier: string) {
    setSaving(userId);
    try {
      await setAdminMemberTier({
        data: { userId, tier },
        ...authServerFnOptions(session),
      });
      toast.success("อัปเดตระดับสมาชิกแล้ว");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="สมาชิก / ลูกค้า"
        description="ดูยอดซื้อสะสม กระเป๋าเงิน และกำหนด tier"
      />
      {loading ? (
        <PageLoading variant="table" />
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <Card key={m.userId}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">{m.fullName ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">{m.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline">
                      ยอดสะสม {formatPrice(m.totalSpent)}
                    </Badge>
                    <Badge variant="outline">{m.orderCount} ออเดอร์</Badge>
                    <Badge variant="outline">
                      กระเป๋า {formatPrice(m.walletBalance)}
                    </Badge>
                    {m.roles.map((r) => (
                      <Badge key={r}>{r}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={m.memberTier}
                    onValueChange={(tier) =>
                      void handleTierChange(m.userId, tier)
                    }
                    disabled={saving === m.userId}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tiers.map((t) => (
                        <SelectItem key={t.tier} value={t.tier}>
                          {t.displayName || tierLabel(t.tier)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      to="/admin/members/$userId"
                      params={{ userId: m.userId }}
                    >
                      ดูรายละเอียด
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      to="/admin/sales-order"
                      search={{ customerId: m.userId }}
                    >
                      สั่งแทน
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
