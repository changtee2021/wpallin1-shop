import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getAdminClient } from "@/lib/server-fns/_shared";
import { cartContext } from "@/lib/server-fns/_shared";
import { addToCart, getCart } from "@/services/cart.service";
import { listPublicProducts } from "@/services/catalog.service";
import { getOrderDetail } from "@/services/order.service";
import { resolveProductUnitPrice } from "@/services/pricing-resolver";
import { getTierProgress, listMemberTiers } from "@/services/tier.service";
import { optionalSupabaseAuth } from "@/lib/server-auth";

export const quickOrderBySku = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        sessionId: z.string().uuid().optional(),
        lines: z.array(
          z.object({
            sku: z.string().min(1),
            qty: z.number().positive(),
          }),
        ),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const supabase = await getAdminClient();
    const ctx = cartContext(context.userId ?? null, data.sessionId);
    const results: Array<{ sku: string; ok: boolean; message?: string }> = [];

    for (const line of data.lines) {
      const { data: products } = await supabase
        .from("products")
        .select("id")
        .eq("sku", line.sku.trim())
        .eq("is_active", true)
        .maybeSingle();

      if (!products) {
        results.push({ sku: line.sku, ok: false, message: "ไม่พบ SKU" });
        continue;
      }

      try {
        await addToCart(supabase, ctx, products.id, line.qty);
        results.push({ sku: line.sku, ok: true });
      } catch (err) {
        results.push({
          sku: line.sku,
          ok: false,
          message: err instanceof Error ? err.message : "เพิ่มไม่สำเร็จ",
        });
      }
    }

    const cart = await getCart(supabase, ctx);
    return { results, cart };
  });

export const reorderFromOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        orderId: z.string().uuid(),
        sessionId: z.string().uuid().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const supabase = await getAdminClient();
    const order = await getOrderDetail(supabase, context.userId, data.orderId);
    if (!order) throw new Error("ไม่พบออเดอร์");
    const ctx = cartContext(context.userId, data.sessionId);

    for (const item of order.items) {
      let productId = item.productId;
      if (!productId && item.sku) {
        const { data: product } = await supabase
          .from("products")
          .select("id")
          .eq("sku", item.sku.trim())
          .eq("is_active", true)
          .maybeSingle();
        productId = product?.id ?? null;
      }
      if (!productId) continue;
      try {
        await addToCart(supabase, ctx, productId, item.qty);
      } catch {
        // skip failed lines
      }
    }

    return getCart(supabase, ctx);
  });

export const fetchPriceList = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ pageSize: z.number().int().min(1).max(500).optional() })
      .parse(input ?? {}),
  )
  .handler(async ({ context, data }) => {
    const supabase = await getAdminClient();
    const products = await listPublicProducts(supabase, {
      page: 1,
      pageSize: data.pageSize ?? 200,
    });

    let tierName = "Retail";
    if (context.userId) {
      const progress = await getTierProgress(supabase, context.userId);
      tierName = progress.currentTierName;
    }

    const rows = await Promise.all(
      products.data.map(async (p) => {
        const price = context.userId
          ? await resolveProductUnitPrice(supabase, context.userId, p.id, 1)
          : p.retailPrice;
        return {
          sku: p.sku,
          name: p.name,
          category: p.categoryName,
          moq: p.moq,
          price,
          retailPrice: p.retailPrice,
        };
      }),
    );

    const tiers = await listMemberTiers(supabase);

    return {
      tierName,
      tiers: tiers.filter((t) => t.isActive),
      rows,
      generatedAt: new Date().toISOString(),
    };
  });

export const searchOrderProducts = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        q: z.string().min(1).max(100),
        limit: z.number().int().min(1).max(20).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const supabase = await getAdminClient();
    const q = data.q.trim().replace(/[%_]/g, "");
    const { data: rows } = await supabase
      .from("products")
      .select(
        "id, slug, sku, name, retail_price, min_order_qty, stock_qty, image_url",
      )
      .eq("is_active", true)
      .or(`sku.ilike.%${q}%,name.ilike.%${q}%`)
      .order("sku")
      .limit(data.limit ?? 8);

    if (!rows?.length) return [];

    return Promise.all(
      rows.map(async (row) => {
        const price = context.userId
          ? await resolveProductUnitPrice(supabase, context.userId, row.id, 1)
          : Number(row.retail_price);
        return {
          id: row.id,
          sku: row.sku ?? "",
          name: row.name,
          price,
          moq: Number(row.min_order_qty),
          stock: Number(row.stock_qty),
          imageUrl: row.image_url,
        };
      }),
    );
  });

const productLookupSelect =
  "id, slug, sku, name, retail_price, min_order_qty, stock_qty, image_url";

async function mapProductRow(
  supabase: Awaited<ReturnType<typeof getAdminClient>>,
  context: { userId?: string | null },
  row: {
    id: string;
    slug: string;
    sku: string | null;
    name: string;
    retail_price: number | string;
    min_order_qty: number | string;
    stock_qty: number | string;
    image_url: string | null;
  },
) {
  const price = context.userId
    ? await resolveProductUnitPrice(supabase, context.userId, row.id, 1)
    : Number(row.retail_price);

  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku ?? "",
    name: row.name,
    price,
    retailPrice: Number(row.retail_price),
    moq: Number(row.min_order_qty),
    stock: Number(row.stock_qty),
    imageUrl: row.image_url,
  };
}

export const resolveProductsBySkus = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        lines: z
          .array(
            z.object({
              sku: z.string().min(1),
              qty: z.number().positive().optional(),
            }),
          )
          .max(50),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const supabase = await getAdminClient();
    const uniqueSkus = [
      ...new Set(data.lines.map((l) => l.sku.trim()).filter(Boolean)),
    ];
    if (!uniqueSkus.length) return { results: [] as const };

    const { data: rows } = await supabase
      .from("products")
      .select(productLookupSelect)
      .in("sku", uniqueSkus)
      .eq("is_active", true);

    const bySku = new Map(
      await Promise.all(
        (rows ?? []).map(
          async (row) =>
            [
              row.sku ?? "",
              await mapProductRow(supabase, context, row),
            ] as const,
        ),
      ),
    );

    const results = data.lines.map((line) => ({
      sku: line.sku.trim(),
      qty: line.qty ?? 1,
      product: bySku.get(line.sku.trim()) ?? null,
    }));

    return { results };
  });

export const fetchFrequentOrderSkus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ limit: z.number().int().min(1).max(12).optional() })
      .parse(input ?? {}),
  )
  .handler(async ({ context, data }) => {
    const supabase = await getAdminClient();
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const { data: orders } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", context.userId)
      .gte("created_at", since.toISOString());

    if (!orders?.length) return [];

    const orderIds = orders.map((o) => o.id);
    const { data: items } = await supabase
      .from("order_items")
      .select("sku, qty, product_name")
      .in("order_id", orderIds)
      .not("sku", "is", null);

    const aggregated = new Map<
      string,
      {
        orderCount: number;
        totalQty: number;
        lastQty: number;
        productName: string;
      }
    >();

    for (const item of items ?? []) {
      const sku = (item.sku as string | null)?.trim();
      if (!sku) continue;
      const qty = Number(item.qty);
      const existing = aggregated.get(sku);
      if (existing) {
        existing.orderCount += 1;
        existing.totalQty += qty;
        existing.lastQty = qty;
      } else {
        aggregated.set(sku, {
          orderCount: 1,
          totalQty: qty,
          lastQty: qty,
          productName: item.product_name as string,
        });
      }
    }

    return [...aggregated.entries()]
      .sort(
        (a, b) =>
          b[1].orderCount - a[1].orderCount || b[1].totalQty - a[1].totalQty,
      )
      .slice(0, data.limit ?? 8)
      .map(([sku, stats]) => ({
        sku,
        productName: stats.productName,
        lastQty: stats.lastQty,
        orderCount: stats.orderCount,
      }));
  });

export const lookupProductBySku = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ sku: z.string().min(1) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const supabase = await getAdminClient();
    const { data: row } = await supabase
      .from("products")
      .select(productLookupSelect)
      .eq("sku", data.sku.trim())
      .eq("is_active", true)
      .maybeSingle();

    if (!row) return null;

    return mapProductRow(supabase, context, row);
  });
