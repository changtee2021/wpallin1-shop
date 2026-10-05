#!/usr/bin/env node
/**
 * Seed WP ALL Wooden Blinds marketing catalog (PDF + first-page cover) to Supabase.
 * Auto-compresses PDFs larger than 50MB before upload.
 *
 * Usage:
 *   node scripts/seed-wooden-blinds-catalog.mjs "C:\path\to\catalog.pdf"
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createCanvas } from "@napi-rs/canvas";
import { createClient } from "@supabase/supabase-js";
import { compress } from "compress-pdf";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const MAX_UPLOAD_MB = 50;

const TITLE = "WP ALL Wooden Blinds — มู่ลี่ไม้";
const SLUG = "wp-all-wooden-blinds";
const CATEGORY_ID = "b2000001-0000-4000-8000-000000000003";
const BUCKET = "wpall-retail-catalogs";

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
    'Usage: node scripts/seed-wooden-blinds-catalog.mjs "<path-to-pdf>"',
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

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: SCHEMA },
});

class NodeCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(Math.ceil(width), Math.ceil(height));
    return { canvas, context: canvas.getContext("2d") };
  }
  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = Math.ceil(width);
    canvasAndContext.canvas.height = Math.ceil(height);
  }
  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

async function preparePdf(filePath) {
  const size = fs.statSync(filePath).size;
  if (size <= MAX_UPLOAD_MB * 1024 * 1024) {
    return { path: filePath, temp: false, size };
  }

  console.log(
    `PDF is ${(size / 1024 / 1024).toFixed(1)}MB — compressing (ebook preset)…`,
  );
  const buffer = await compress(filePath, { resolution: "ebook" });
  const tmp = path.join(os.tmpdir(), `wpall-catalog-${Date.now()}.pdf`);
  await fs.promises.writeFile(tmp, buffer);
  console.log(`Compressed to ${(buffer.length / 1024 / 1024).toFixed(2)}MB`);
  return { path: tmp, temp: true, size: buffer.length };
}

async function renderFirstPageCover(pdfFilePath) {
  const workerPath = require.resolve(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  );
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

  const data = new Uint8Array(await fs.promises.readFile(pdfFilePath));
  const canvasFactory = new NodeCanvasFactory();
  const loadingTask = pdfjs.getDocument({
    data,
    isEvalSupported: false,
    canvasFactory,
    verbosity: 0,
  });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.4 });
  const { canvas, context } = canvasFactory.create(
    viewport.width,
    viewport.height,
  );
  await page.render({ canvasContext: context, viewport, canvas }).promise;
  const jpeg = await canvas.encode("jpeg", 86);
  const pageCount = pdf.numPages;
  page.cleanup();
  await loadingTask.destroy().catch(() => undefined);
  return { jpeg, pageCount };
}

async function uploadBuffer(storagePath, body, contentType) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, body, { contentType, upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function resolveCatalogId() {
  const { data: bySlug, error: slugErr } = await supabase
    .from("marketing_catalogs")
    .select("id")
    .eq("slug", SLUG)
    .maybeSingle();
  if (slugErr) throw slugErr;
  if (bySlug?.id) return bySlug.id;

  const { data: byTitle, error: titleErr } = await supabase
    .from("marketing_catalogs")
    .select("id")
    .eq("title", TITLE)
    .maybeSingle();
  if (titleErr) throw titleErr;
  if (byTitle?.id) return byTitle.id;

  const { data: created, error: insertErr } = await supabase
    .from("marketing_catalogs")
    .insert({
      slug: SLUG,
      title: TITLE,
      brand: "WP ALL",
      category_id: CATEGORY_ID,
      visibility: "public",
      status: "draft",
      is_public: false,
      is_active: false,
      sort_order: 2,
    })
    .select("id")
    .single();
  if (insertErr) throw insertErr;
  return created.id;
}

async function main() {
  const prepared = await preparePdf(absPdf);
  try {
    console.log("Rendering cover from page 1…");
    const { jpeg, pageCount } = await renderFirstPageCover(prepared.path);

    const catalogId = await resolveCatalogId();
    const pdfStoragePath = `pdf/${catalogId}.pdf`;
    const coverStoragePath = `cover/${catalogId}.jpg`;

    console.log("Uploading PDF + cover…");
    const pdfBody = await fs.promises.readFile(prepared.path);
    const [pdfUrl, coverUrl] = await Promise.all([
      uploadBuffer(pdfStoragePath, pdfBody, "application/pdf"),
      uploadBuffer(coverStoragePath, jpeg, "image/jpeg"),
    ]);

    const payload = {
      category_id: CATEGORY_ID,
      slug: SLUG,
      title: TITLE,
      brand: "WP ALL",
      description:
        "แคตตาล็อกมู่ลี่ไม้ครบชุด — ไม้จริง ไม้เทียม ขนาดซี่ สี และอุปกรณ์ติดตั้ง",
      cover_image_url: coverUrl,
      pdf_url: pdfUrl,
      pdf_storage_path: pdfStoragePath,
      tags: [
        "มู่ลี่ไม้",
        "wooden blinds",
        "wood blinds",
        "venetian",
        "ไม้จริง",
        "ไม้เทียม",
      ],
      page_count: pageCount,
      file_size: prepared.size,
      visibility: "public",
      status: "published",
      allow_download: true,
      is_featured: false,
      sort_order: 2,
      is_public: true,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("marketing_catalogs")
      .update(payload)
      .eq("id", catalogId);
    if (error) throw error;

    console.log("Saved catalog:", catalogId);
    console.log("Pages:", pageCount);
    console.log("Cover URL:", coverUrl);
    console.log("PDF URL:", pdfUrl);
    console.log("View at: /catalogs/" + SLUG);
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
