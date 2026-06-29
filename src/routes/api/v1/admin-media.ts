import { createFileRoute } from "@tanstack/react-router";

import { logUploadFailure } from "@/lib/upload-validation";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function requireAdminUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const token = authHeader.replace("Bearer ", "");
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return {
      error: Response.json({ error: "Server misconfigured" }, { status: 500 }),
    };
  }

  const { createClient } = await import("@supabase/supabase-js");
  const { SUPABASE_SCHEMA } = await import("@/lib/erp-config");
  const { requireAdmin } = await import("@/lib/server-auth");

  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: SUPABASE_SCHEMA },
  });

  const { data: claims, error: authErr } = await supabase.auth.getClaims(token);
  if (authErr || !claims?.claims?.sub) {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const userId = claims.claims.sub as string;

  try {
    await requireAdmin(userId);
  } catch {
    return { error: Response.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabase, userId };
}

export const Route = createFileRoute("/api/v1/admin-media")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await requireAdminUser(request);
        if ("error" in auth && auth.error) return auth.error;

        const url = new URL(request.url);
        const folder = url.searchParams.get("folder") ?? undefined;

        const { listAdminMediaAssets } =
          await import("@/services/admin-media.service");
        const assets = await listAdminMediaAssets(auth.supabase!, folder);
        return Response.json({ ok: true, assets });
      },

      POST: async ({ request }) => {
        const auth = await requireAdminUser(request);
        if ("error" in auth && auth.error) return auth.error;

        try {
          await enforceRateLimit("admin-media", auth.userId!, {
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

        const folder =
          typeof form.get("folder") === "string"
            ? (form.get("folder") as string).trim() || "general"
            : "general";
        const label =
          typeof form.get("label") === "string"
            ? (form.get("label") as string).trim()
            : file.name;

        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `admin-media/${folder}/${crypto.randomUUID()}.${ext}`;

        try {
          const { error: uploadErr } = await auth
            .supabase!.storage.from("wpall-retail-products")
            .upload(path, file, {
              upsert: false,
              contentType: file.type || undefined,
            });

          if (uploadErr) throw uploadErr;

          const { data: urlData } = auth
            .supabase!.storage.from("wpall-retail-products")
            .getPublicUrl(path);

          const { createAdminMediaAsset } =
            await import("@/services/admin-media.service");
          const asset = await createAdminMediaAsset(auth.supabase!, {
            url: urlData.publicUrl,
            storagePath: path,
            folder,
            label,
          });

          return Response.json({
            ok: true,
            fileUrl: asset.url,
            storagePath: asset.storagePath,
            asset,
          });
        } catch (err) {
          logUploadFailure("admin-media", err);
          return Response.json({ error: "Upload failed" }, { status: 400 });
        }
      },
    },
  },
});
