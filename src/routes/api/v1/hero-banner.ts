import { createFileRoute } from "@tanstack/react-router";

import { logUploadFailure } from "@/lib/upload-validation";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const Route = createFileRoute("/api/v1/hero-banner")({
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
          await enforceRateLimit("hero-banner", userId, {
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
        if (!(file instanceof File)) {
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
        const path = `banners/${crypto.randomUUID()}.${ext}`;

        try {
          const { error: uploadErr } = await supabase.storage
            .from("wpall-retail-products")
            .upload(path, file, {
              upsert: false,
              contentType: file.type || undefined,
            });

          if (uploadErr) throw uploadErr;

          const { data: urlData } = supabase.storage
            .from("wpall-retail-products")
            .getPublicUrl(path);

          return Response.json({
            ok: true,
            fileUrl: urlData.publicUrl,
            storagePath: path,
          });
        } catch (err) {
          logUploadFailure("hero-banner", err);
          return Response.json({ error: "Upload failed" }, { status: 400 });
        }
      },
    },
  },
});
