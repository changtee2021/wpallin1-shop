import { LayoutDashboard, Package, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { fetchAccountProfile } from "@/lib/api.functions";
import { tierLabel } from "@/lib/member-tier";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { useT } from "@/i18n";

export function DealerSidebar() {
  const { t } = useT();
  const { session } = useAuth();
  const [tier, setTier] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    void fetchAccountProfile(authServerFnOptions(session)).then((profile) =>
      setTier(profile.memberTier),
    );
  }, [session]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <p className="text-sm text-muted-foreground">ระดับตัวแทน</p>
        <div className="mt-1 flex items-center gap-2">
          <p className="font-semibold">{tierLabel(tier)}</p>
          <Badge variant="secondary">{t("nav.dealer")}</Badge>
        </div>
      </div>
      <SidebarNav
        title={t("nav.dealer")}
        items={[
          {
            to: "/dealer",
            label: t("dealer.dashboard"),
            icon: LayoutDashboard,
            key: "dealer-home",
          },
          {
            to: "/dealer/catalog",
            label: t("dealer.catalog"),
            icon: Package,
            key: "dealer-catalog",
          },
          {
            to: "/dealer/wallet",
            label: t("dealer.wallet"),
            icon: Wallet,
            key: "dealer-wallet",
          },
        ]}
      />
    </div>
  );
}
