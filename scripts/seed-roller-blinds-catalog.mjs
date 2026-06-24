#!/usr/bin/env node
/**
 * Seed WP ALL Roller Blinds marketing catalog (PDF + cover) to Supabase.
 * Auto-compresses PDFs larger than 50MB before upload.
 *
 * Usage:
 *   node scripts/seed-roller-blinds-catalog.mjs "C:\path\to\catalog.pdf"
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { compress } from "compress-pdf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const MAX_UPLOAD_MB = 50;

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

const pdfPath = process.argv[2];
if (!pdfPath) {
  console.error(
    'Usage: node scripts/seed-roller-blinds-catalog.mjs "<path-to-pdf>"',
  );
  process.exit(1);
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SCHEMA = process.env.SUPABASE_SCHEMA ?? "wpall_retail";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const absPdf = path.resolve(pdfPath);
if (!fs.existsSync(absPdf)) {
  console.error("PDF not found:", absPdf);
  process.exit(1);
}

const CATEGORY_ID = "b2000001-0000-4000-8000-000000000001";
const BUCKET = "wpall-retail-catalogs";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: SCHEMA },
});

async function preparePdf(filePath) {
  const size = fs.statSync(filePath).size;
  if (size <= MAX_UPLOAD_MB * 1024 * 1024) {
    return { path: filePath, temp: false };
  }

  console.log(
    `PDF is ${(size / 1024 / 1024).toFixed(1)}MB — compressing (ebook preset)…`,
  );
  const buffer = await compress(filePath, { resolution: "ebook" });
  const tmp = path.join(os.tmpdir(), `wpall-catalog-${Date.now()}.pdf`);
  await fs.promises.writeFile(tmp, buffer);
  console.log(`Compressed to ${(buffer.length / 1024 / 1024).toFixed(2)}MB`);
  return { path: tmp, temp: true };
}

async function uploadBuffer(kind, body, ext, contentType) {
  const storagePath = `${kind}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, body, { contentType, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function main() {
  const prepared = await preparePdf(absPdf);
  try {
    console.log("Uploading PDF…");
    const pdfBody = fs.readFileSync(prepared.path);
    const pdfUrl = await uploadBuffer("pdf", pdfBody, "pdf", "application/pdf");

    const payload = {
      category_id: CATEGORY_ID,
      title: "WP ALL Roller Blinds — ม่านม้วน",
      brand: "WP ALL",
      description:
        "แคตตาล็อกม่านม้วนครบทุกประเภท — Blackout, Sunscreen, Zebra, Motorized และอุปกรณ์",
      cover_image_url: null,
      pdf_url: pdfUrl,
      tags: [
        "ม่านม้วน",
        "roller blinds",
        "blackout",
        "sunscreen",
        "motorized",
        "zebra",
      ],
      sort_order: 1,
      is_public: true,
      is_active: true,
    };

    const { data: existing, error: findErr } = await supabase
      .from("marketing_catalogs")
      .select("id")
      .eq("title", payload.title)
      .maybeSingle();
    if (findErr) throw findErr;

    if (existing?.id) {
      const { error } = await supabase
        .from("marketing_catalogs")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) throw error;
      console.log("Updated catalog:", existing.id);
    } else {
      const { data, error } = await supabase
        .from("marketing_catalogs")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      console.log("Created catalog:", data.id);
    }

    console.log("PDF URL:", pdfUrl);
    console.log("View at: /catalogs");
  } finally {
    if (prepared.temp) {
      await fs.promises.unlink(prepared.path).catch(() => undefined);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
