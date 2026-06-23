import {
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Package,
  Settings,
  ShoppingBag,
  Users,
  Wallet,
  Award,
  UserCircle,
} from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { useT } from "@/i18n";

export function AdminSidebar() {
  const { t } = useT();

  return (
    <SidebarNav
      title={t("nav.admin")}
      items={[
        { to: "/admin", label: t("admin.overview"), icon: LayoutDashboard },
        { to: "/admin/orders", label: "คำสั่งซื้อ", icon: ShoppingBag },
        { to: "/admin/sales-order", label: "สั่งซื้อแทน", icon: Users },
        { to: "/admin/quotations", label: "ใบเสนอราคา", icon: FileText },
        { to: "/admin/wallet", label: "กระเป๋าเงิน", icon: Wallet },
        { to: "/admin/members", label: "สมาชิก", icon: UserCircle },
        { to: "/admin/tiers", label: "ระดับ/Tier", icon: Award },
        { to: "/admin/dealers", label: "ตัวแทน", icon: Users },
        { to: "/admin/support", label: "ติดต่อ/Feedback", icon: LifeBuoy },
        { to: "/admin/products", label: t("admin.products"), icon: Package },
        { to: "/admin/categories", label: "หมวดหมู่", icon: Package },
        { to: "/admin/settings", label: t("admin.settings"), icon: Settings },
      ]}
    />
  );
}
