import {
  FileText,
  Image,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Users,
  Wallet,
  Award,
  UserCircle,
  Tag,
  BarChart3,
  Boxes,
  CreditCard,
  SlidersHorizontal,
} from "lucide-react";

import {
  SidebarNav,
  type SidebarNavGroup,
} from "@/components/layout/sidebar-nav";
import { useT } from "@/i18n";

export function AdminSidebar() {
  const { t } = useT();

  const groups: SidebarNavGroup[] = [
    {
      label: "ภาพรวม",
      items: [
        { to: "/admin", label: t("admin.overview"), icon: LayoutDashboard },
      ],
    },
    {
      label: "การขาย",
      items: [
        { to: "/admin/orders", label: "คำสั่งซื้อ", icon: ShoppingBag },
        { to: "/admin/sales-order", label: "สั่งซื้อแทน", icon: Users },
        { to: "/admin/quotations", label: "ใบเสนอราคา", icon: FileText },
      ],
    },
    {
      label: "การเงิน",
      items: [
        { to: "/admin/wallet", label: "กระเป๋าเงิน", icon: Wallet },
        { to: "/admin/credit", label: "เครดิต", icon: CreditCard },
      ],
    },
    {
      label: "สมาชิก & ตัวแทน",
      items: [
        { to: "/admin/members", label: "สมาชิก", icon: UserCircle },
        { to: "/admin/tiers", label: "ระดับ/Tier", icon: Award },
        { to: "/admin/dealers", label: "ตัวแทน", icon: Users },
      ],
    },
    {
      label: "สินค้า & สต็อก",
      items: [
        { to: "/admin/products", label: t("admin.products"), icon: Package },
        { to: "/admin/custom", label: "Custom", icon: SlidersHorizontal },
        { to: "/admin/categories", label: "หมวดหมู่", icon: Package },
        { to: "/admin/inventory", label: "สต็อก", icon: Boxes },
        { to: "/admin/catalogs", label: "แคตตาล็อก PDF", icon: FileText },
        { to: "/admin/inspiration", label: "แรงบันดาลใจ", icon: Image },
        { to: "/admin/media", label: "คลังรูป", icon: Image },
        { to: "/admin/banners", label: "แบนเนอร์", icon: Image },
      ],
    },
    {
      label: "โปรโมชั่น",
      items: [{ to: "/admin/coupons", label: "คูปอง/โปร", icon: Tag }],
    },
    {
      label: "รายงาน & บริการ",
      items: [
        { to: "/admin/reports", label: "รายงาน", icon: BarChart3 },
        { to: "/admin/chat", label: "แชทลูกค้า", icon: MessageSquare },
        { to: "/admin/support", label: "ติดต่อ/Feedback", icon: LifeBuoy },
      ],
    },
    {
      label: "ตั้งค่า",
      items: [
        { to: "/admin/settings", label: t("admin.settings"), icon: Settings },
      ],
    },
  ];

  return <SidebarNav title={t("nav.admin")} groups={groups} />;
}
