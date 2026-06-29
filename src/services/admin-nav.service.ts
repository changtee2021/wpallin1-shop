import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminQuickNavPage = {
  type: "page";
  label: string;
  href: string;
  keywords: string;
};

export type AdminQuickNavProduct = {
  type: "product";
  id: string;
  label: string;
  href: string;
  subtitle: string | null;
};

export type AdminQuickNavOrder = {
  type: "order";
  id: string;
  label: string;
  href: string;
  subtitle: string | null;
};

export type AdminQuickNavRoom = {
  type: "room";
  id: string;
  label: string;
  href: string;
  subtitle: string | null;
};

export type AdminQuickNavResult = {
  pages: AdminQuickNavPage[];
  products: AdminQuickNavProduct[];
  orders: AdminQuickNavOrder[];
  rooms: AdminQuickNavRoom[];
};

const STATIC_PAGES: AdminQuickNavPage[] = [
  {
    type: "page",
    label: "ภาพรวม",
    href: "/admin",
    keywords: "dashboard overview",
  },
  {
    type: "page",
    label: "คำสั่งซื้อ",
    href: "/admin/orders",
    keywords: "orders",
  },
  {
    type: "page",
    label: "สั่งซื้อแทน",
    href: "/admin/sales-order",
    keywords: "sales order",
  },
  {
    type: "page",
    label: "ใบเสนอราคา",
    href: "/admin/quotations",
    keywords: "quotations",
  },
  {
    type: "page",
    label: "กระเป๋าเงิน",
    href: "/admin/wallet",
    keywords: "wallet",
  },
  { type: "page", label: "เครดิต", href: "/admin/credit", keywords: "credit" },
  {
    type: "page",
    label: "สมาชิก",
    href: "/admin/members",
    keywords: "members",
  },
  {
    type: "page",
    label: "ระดับ/Tier",
    href: "/admin/tiers",
    keywords: "tiers",
  },
  {
    type: "page",
    label: "ตัวแทน",
    href: "/admin/dealers",
    keywords: "dealers",
  },
  {
    type: "page",
    label: "สินค้า",
    href: "/admin/products",
    keywords: "products catalog",
  },
  {
    type: "page",
    label: "Custom",
    href: "/admin/custom",
    keywords: "configurator custom",
  },
  {
    type: "page",
    label: "หมวดหมู่",
    href: "/admin/categories",
    keywords: "categories",
  },
  {
    type: "page",
    label: "สต็อก",
    href: "/admin/inventory",
    keywords: "inventory stock",
  },
  {
    type: "page",
    label: "แคตตาล็อก PDF",
    href: "/admin/catalogs",
    keywords: "catalogs pdf",
  },
  {
    type: "page",
    label: "แรงบันดาลใจ",
    href: "/admin/inspiration",
    keywords: "inspiration rooms",
  },
  {
    type: "page",
    label: "วัสดุ Inspiration",
    href: "/admin/inspiration/materials",
    keywords: "materials inspiration",
  },
  {
    type: "page",
    label: "คลังรูป",
    href: "/admin/media",
    keywords: "media library images",
  },
  {
    type: "page",
    label: "แบนเนอร์",
    href: "/admin/banners",
    keywords: "banners hero",
  },
  {
    type: "page",
    label: "คูปอง/โปร",
    href: "/admin/coupons",
    keywords: "coupons promo",
  },
  {
    type: "page",
    label: "รายงาน",
    href: "/admin/reports",
    keywords: "reports analytics",
  },
  {
    type: "page",
    label: "แชทลูกค้า",
    href: "/admin/chat",
    keywords: "chat support",
  },
  {
    type: "page",
    label: "ติดต่อ/Feedback",
    href: "/admin/support",
    keywords: "support feedback",
  },
  {
    type: "page",
    label: "ตั้งค่า",
    href: "/admin/settings",
    keywords: "settings",
  },
];

function matchesQuery(text: string, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return text.toLowerCase().includes(normalized);
}

export async function searchAdminQuickNav(
  supabase: SupabaseClient,
  query: string,
): Promise<AdminQuickNavResult> {
  const q = query.trim();
  const pages = STATIC_PAGES.filter(
    (page) =>
      matchesQuery(page.label, q) ||
      matchesQuery(page.keywords, q) ||
      matchesQuery(page.href, q),
  ).slice(0, 8);

  const [productsResult, ordersResult, roomsResult] = await Promise.all([
    q.length >= 2
      ? supabase
          .from("products")
          .select("id, name, slug, sku")
          .or(`name.ilike.%${q}%,slug.ilike.%${q}%,sku.ilike.%${q}%`)
          .order("updated_at", { ascending: false })
          .limit(6)
      : Promise.resolve({ data: [] }),
    q.length >= 2
      ? supabase
          .from("orders")
          .select("id, order_number, customer_name, status")
          .or(`order_number.ilike.%${q}%,customer_name.ilike.%${q}%`)
          .order("created_at", { ascending: false })
          .limit(6)
      : Promise.resolve({ data: [] }),
    q.length >= 2
      ? supabase
          .from("inspiration_rooms")
          .select("id, title, slug, status")
          .or(`title.ilike.%${q}%,slug.ilike.%${q}%`)
          .order("updated_at", { ascending: false })
          .limit(6)
      : Promise.resolve({ data: [] }),
  ]);

  const products: AdminQuickNavProduct[] = (productsResult.data ?? []).map(
    (row) => ({
      type: "product",
      id: row.id as string,
      label: row.name as string,
      href: `/admin/products/${row.id}`,
      subtitle: [row.sku, row.slug].filter(Boolean).join(" · ") || null,
    }),
  );

  const orders: AdminQuickNavOrder[] = (ordersResult.data ?? []).map((row) => ({
    type: "order",
    id: row.id as string,
    label: row.order_number as string,
    href: `/admin/orders/${row.id}`,
    subtitle:
      [row.customer_name, row.status].filter(Boolean).join(" · ") || null,
  }));

  const rooms: AdminQuickNavRoom[] = (roomsResult.data ?? []).map((row) => ({
    type: "room",
    id: row.id as string,
    label: row.title as string,
    href: `/admin/inspiration/rooms/${row.id}`,
    subtitle: [row.slug, row.status].filter(Boolean).join(" · ") || null,
  }));

  return { pages, products, orders, rooms };
}
