import { createFileRoute } from "@tanstack/react-router";

import { logUploadFailure } from "@/lib/upload-validation";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";

const CATALOG_MAX_BYTES = 25 * 1024 * 1024;
const CATALOG_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function validateCatalogFile(file: File) {
  if (file.size > CATALOG_MAX_BYTES) {
    return { status: 413, message: "File exceeds 25MB limit" };
  }
  if (!CATALOG_ALLOWED_TYPES.has(file.type)) {
    return { status: 415, message: "Unsupported file type" };
  }
  return null;
}

export const Route = createFileRoute("/api/v1/catalog-asset")({
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
          await enforceRateLimit("catalog-asset", userId, {
            requests: 20,
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
        const kind = form.get("kind");

        if (!(file instanceof File) || (kind !== "cover" && kind !== "pdf")) {
          return Response.json({ error: "Invalid form data" }, { status: 400 });
        }

        const uploadError = validateCatalogFile(file);
        if (uploadError) {
          return Response.json(
            { error: uploadError.message },
            { status: uploadError.status },
          );
        }

        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${kind}/${crypto.randomUUID()}.${ext}`;

        try {
          const { error: uploadErr } = await supabase.storage
            .from("wpall-retail-catalogs")
            .upload(path, file, {
              upsert: false,
              contentType: file.type || undefined,
            });

          if (uploadErr) throw uploadErr;

          const { data: urlData } = supabase.storage
            .from("wpall-retail-catalogs")
            .getPublicUrl(path);

          return Response.json({
            ok: true,
            fileUrl: urlData.publicUrl,
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
          });
        } catch (err) {
          logUploadFailure("catalog-asset", err);
          return Response.json({ error: "Upload failed" }, { status: 400 });
        }
      },
    },
  },
});
