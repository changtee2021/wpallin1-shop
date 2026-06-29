#!/usr/bin/env node
/**
 * Seed wpall_retail.inspiration_materials from room hotspots (aggregate).
 * Usage: node scripts/seed-inspiration-materials.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnvFile() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SCHEMA =
  process.env.SUPABASE_SCHEMA ??
  process.env.VITE_SUPABASE_SCHEMA ??
  "wpall_retail";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  db: { schema: SCHEMA },
  auth: { persistSession: false, autoRefreshToken: false },
});

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function detectMaterialType(hotspot) {
  const slug = (hotspot.productSlug ?? "").toLowerCase();
  const label = (hotspot.label ?? "").toLowerCase();
  if (slug.includes("rail") || label.includes("ราง")) return "rail";
  if (
    slug.includes("roller") ||
    slug.includes("motorized") ||
    slug.includes("zebra") ||
    label.includes("มู่ลี่") ||
    label.includes("zebra")
  ) {
    return "blind";
  }
  const type = hotspot.configuratorProductType ?? "";
  if (
    type === "wave" ||
    type === "eyelet" ||
    type === "pleated" ||
    label.includes("wave") ||
    label.includes("eyelet") ||
    label.includes("จีบ")
  ) {
    return "style";
  }
  if (hotspot.fabricId || hotspot.fabricName) return "fabric";
  return "style";
}

function materialGroupKey(hotspot) {
  if (hotspot.fabricId) return `fabric:${hotspot.fabricId}`;
  if (hotspot.productSlug) return `product:${hotspot.productSlug}`;
  const label = (hotspot.label ?? "").trim().toLowerCase();
  if (label) return `label:${label}`;
  return `hotspot:${hotspot.id}`;
}

function materialSlug(hotspot) {
  if (hotspot.fabricId) return `fabric-${hotspot.fabricId}`;
  if (hotspot.productSlug) return `product-${slugify(hotspot.productSlug)}`;
  const label = (hotspot.label ?? hotspot.fabricName ?? "").trim();
  if (label) return `label-${slugify(label)}`;
  return `hotspot-${hotspot.id.slice(0, 8)}`;
}

function swatchForHotspot(hotspot) {
  const label =
    hotspot.label || hotspot.fabricName || hotspot.productName || "Material";
  return {
    imageUrl:
      hotspot.productImageUrl ??
      "/inspiration/details/detail-fabric-linen-beige.png",
    label,
    caption: null,
  };
}

function buildAggregateMaterials(rooms) {
  const map = new Map();
  for (const room of rooms) {
    for (const hotspot of room.hotspots) {
      const key = materialGroupKey(hotspot);
      const swatch = swatchForHotspot(hotspot);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          slug: materialSlug(hotspot),
          title: swatch.label,
          description: swatch.caption,
          heroImageUrl: swatch.imageUrl,
          materialType: detectMaterialType(hotspot),
          fabricId: hotspot.fabricId,
          productId: hotspot.productId,
          roomIds: new Set([room.id]),
          roomCount: 1,
        });
        continue;
      }
      existing.roomIds.add(room.id);
      existing.roomCount = existing.roomIds.size;
      if (!existing.fabricId && hotspot.fabricId)
        existing.fabricId = hotspot.fabricId;
      if (!existing.productId && hotspot.productId)
        existing.productId = hotspot.productId;
    }
  }
  return [...map.values()];
}

async function loadRooms() {
  const { data: rows, error } = await supabase
    .from("inspiration_rooms")
    .select("id, slug")
    .order("sort_order");
  if (error) throw new Error(error.message);
  if (!rows?.length) return [];

  const roomIds = rows.map((r) => r.id);
  const { data: hotspots, error: hErr } = await supabase
    .from("inspiration_hotspots")
    .select(
      "id, room_id, label, product_id, fabric_id, configurator_product_type",
    )
    .in("room_id", roomIds);
  if (hErr) throw new Error(hErr.message);

  const productIds = [
    ...new Set((hotspots ?? []).map((h) => h.product_id).filter(Boolean)),
  ];
  const fabricIds = [
    ...new Set((hotspots ?? []).map((h) => h.fabric_id).filter(Boolean)),
  ];

  const [{ data: products }, { data: fabrics }] = await Promise.all([
    productIds.length
      ? supabase
          .from("products_public")
          .select("id, slug, name, image_url")
          .in("id", productIds)
      : { data: [] },
    fabricIds.length
      ? supabase.from("fabrics").select("id, name").in("id", fabricIds)
      : { data: [] },
  ]);

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));
  const fabricMap = new Map((fabrics ?? []).map((f) => [f.id, f.name]));

  const byRoom = new Map();
  for (const h of hotspots ?? []) {
    const product = h.product_id ? productMap.get(h.product_id) : null;
    const dto = {
      id: h.id,
      label: h.label,
      productId: h.product_id,
      productSlug: product?.slug ?? null,
      productName: product?.name ?? null,
      productImageUrl: product?.image_url ?? null,
      fabricId: h.fabric_id,
      fabricName: h.fabric_id ? (fabricMap.get(h.fabric_id) ?? null) : null,
      configuratorProductType: h.configurator_product_type,
    };
    const list = byRoom.get(h.room_id) ?? [];
    list.push(dto);
    byRoom.set(h.room_id, list);
  }

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    hotspots: byRoom.get(row.id) ?? [],
  }));
}

async function main() {
  const rooms = await loadRooms();
  console.log(`Rooms: ${rooms.length}`);
  const aggregate = buildAggregateMaterials(rooms);
  console.log(`Aggregate materials: ${aggregate.length}`);

  const { data: existing } = await supabase
    .from("inspiration_materials")
    .select("slug");
  const existingSlugs = new Set((existing ?? []).map((r) => r.slug));

  let created = 0;
  for (const material of aggregate) {
    if (existingSlugs.has(material.slug)) continue;

    const { data: inserted, error } = await supabase
      .from("inspiration_materials")
      .insert({
        slug: material.slug,
        title: material.title,
        description: material.description,
        material_type: material.materialType,
        fabric_id: material.fabricId,
        product_id: material.productId,
        hero_image_url: material.heroImageUrl,
        gallery_urls: [],
        profile_overrides: {},
        sort_order: material.roomCount,
        is_featured: false,
        status: "published",
      })
      .select("id")
      .single();

    if (error) {
      console.error(`Failed ${material.slug}:`, error.message);
      continue;
    }

    const roomLinks = [...material.roomIds].map((roomId) => ({
      material_id: inserted.id,
      room_id: roomId,
      hotspot_id: null,
    }));

    if (roomLinks.length) {
      const { error: linkErr } = await supabase
        .from("inspiration_material_rooms")
        .insert(roomLinks);
      if (linkErr) {
        console.error(`Links failed ${material.slug}:`, linkErr.message);
      }
    }

    created += 1;
    existingSlugs.add(material.slug);
    console.log(`+ ${material.slug}`);
  }

  console.log(`Done. Created ${created} materials.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
