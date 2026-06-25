import { createFileRoute } from "@tanstack/react-router";

import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import { logUploadFailure } from "@/lib/upload-validation";

const BUCKET = "wpall-retail-configurator";
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const Route = createFileRoute("/api/v1/configurator-asset")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.replace("Bearer ", "");
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
          return Response.json(
            { error: "Server misconfigured" },
            { status: 500 },
          );
        }

        const { createClient } = await import("@supabase/supabase-js");
        const { SUPABASE_SCHEMA } = await import("@/lib/erp-config");
        const { requireAdmin } = await import("@/lib/server-auth");

        const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
          db: { schema: SUPABASE_SCHEMA },
        });

        const { data: claims, error: authErr } =
          await supabase.auth.getClaims(token);
        if (authErr || !claims?.claims?.sub) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = claims.claims.sub as string;
        try {
          await requireAdmin(userId);
        } catch {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        try {
          await enforceRateLimit("configurator-asset", userId, {
            requests: 30,
            window: "1 m",
          });
        } catch (err) {
          if (err instanceof RateLimitError) {
            return Response.json({ error: err.message }, { status: 429 });
          }
          throw err;
        }

        const form = await request.formData();
        const file = form.get("file");
        const productId = String(form.get("productId") ?? "");
        const requestedAssetType = String(form.get("assetType") ?? "preview");
        const assetType = ["preview", "swatch", "base", "overlay"].includes(
          requestedAssetType,
        )
          ? requestedAssetType
          : "preview";
        const fallbackName = file instanceof File ? file.name : "";
        const name = String(form.get("name") ?? fallbackName);
        const altText = String(form.get("altText") ?? "");

        if (!(file instanceof File) || !productId) {
          return Response.json({ error: "Invalid form data" }, { status: 400 });
        }
        if (file.size > MAX_BYTES) {
          return Response.json(
            { error: "File exceeds 8MB limit" },
            { status: 413 },
          );
        }
        if (!ALLOWED_TYPES.has(file.type)) {
          return Response.json(
            { error: "Unsupported file type" },
            { status: 415 },
          );
        }

        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${productId}/${assetType}/${crypto.randomUUID()}.${ext}`;

        try {
          const { error: uploadErr } = await supabase.storage
            .from(BUCKET)
            .upload(path, file, {
              upsert: false,
              contentType: file.type || undefined,
            });
          if (uploadErr) throw uploadErr;

          const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(path);

          const { data: asset, error: insertErr } = await supabase
            .from("configurator_assets")
            .insert({
              product_id: productId,
              asset_type: assetType,
              name: name.trim() || file.name,
              storage_bucket: BUCKET,
              storage_path: path,
              public_url: urlData.publicUrl,
              alt_text: altText.trim() || null,
            })
            .select(
              "id, product_id, asset_type, name, public_url, storage_path, alt_text",
            )
            .single();
          if (insertErr) throw insertErr;

          return Response.json({
            ok: true,
            asset: {
              id: asset.id,
              productId: asset.product_id,
              assetType: asset.asset_type,
              name: asset.name,
              publicUrl: asset.public_url,
              storagePath: asset.storage_path,
              altText: asset.alt_text,
            },
          });
        } catch (err) {
          logUploadFailure("configurator-asset", err);
          return Response.json({ error: "Upload failed" }, { status: 400 });
        }
      },
    },
  },
});
