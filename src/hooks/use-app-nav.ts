import { useLocation, useMatchRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  LayoutDashboard,
  MoreHorizontal,
  Package,
  ShoppingBag,
  ShoppingCart,
  Store,
  User,
  Wallet,
  FileText,
  Users,
} from "lucide-react";

export type AppNavZone = "store" | "account" | "dealer" | "admin";

export type AppNavItem = {
  id: string;
  to: string;
  label: string;
  icon: LucideIcon;
  search?: Record<string, unknown>;
  exact?: boolean;
  badge?: number;
  isMore?: boolean;
};

export function useAppNavZone(): AppNavZone {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/dealer")) return "dealer";
  if (pathname.startsWith("/account")) return "account";
  return "store";
}

export function useAppNavItems(cartCount = 0): AppNavItem[] {
  const zone = useAppNavZone();

  if (zone === "account") {
    return [
      {
        id: "dashboard",
        to: "/account",
        label: "แดชบอร์ด",
        icon: LayoutDashboard,
        search: { tab: "dashboard" },
      },
      {
        id: "orders",
        to: "/account/orders",
        label: "ออเดอร์",
        icon: Package,
      },
      {
        id: "settings",
        to: "/account",
        label: "ตั้งค่า",
        icon: User,
        search: { tab: "settings", section: "personal" },
      },
      {
        id: "more",
        to: "#",
        label: "เพิ่มเติม",
        icon: MoreHorizontal,
        isMore: true,
      },
    ];
  }

  if (zone === "dealer") {
    return [
      {
        id: "dash",
        to: "/dealer",
        label: "หน้าหลัก",
        icon: LayoutDashboard,
        exact: true,
      },
      { id: "catalog", to: "/dealer/catalog", label: "แคตตาล็อก", icon: Store },
      {
        id: "quotes",
        to: "/dealer/quotations",
        label: "ใบเสนอ",
        icon: FileText,
      },
      { id: "wallet", to: "/dealer/wallet", label: "กระเป๋า", icon: Wallet },
      {
        id: "more",
        to: "#",
        label: "เพิ่มเติม",
        icon: MoreHorizontal,
        isMore: true,
      },
    ];
  }

  if (zone === "admin") {
    return [
      {
        id: "overview",
        to: "/admin",
        label: "ภาพรวม",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        id: "orders",
        to: "/admin/orders",
        label: "ออเดอร์",
        icon: ShoppingBag,
      },
      { id: "sales", to: "/admin/sales-order", label: "สั่งแทน", icon: Users },
      { id: "products", to: "/admin/products", label: "สินค้า", icon: Package },
      {
        id: "more",
        to: "#",
        label: "เพิ่มเติม",
        icon: MoreHorizontal,
        isMore: true,
      },
    ];
  }

  return [
    { id: "home", to: "/", label: "หน้าแรก", icon: Home, exact: true },
    { id: "shop", to: "/shop", label: "ร้านค้า", icon: Store },
    {
      id: "cart",
      to: "/cart",
      label: "ตะกร้า",
      icon: ShoppingCart,
      badge: cartCount,
    },
    { id: "account", to: "/account", label: "บัญชี", icon: User },
    {
      id: "more",
      to: "#",
      label: "เพิ่มเติม",
      icon: MoreHorizontal,
      isMore: true,
    },
  ];
}

export function useAppNavActive(item: AppNavItem): boolean {
  const matchRoute = useMatchRoute();
  if (item.isMore) return false;
  if (item.exact) return !!matchRoute({ to: item.to, fuzzy: false });
  return !!matchRoute({ to: item.to, fuzzy: true });
}
