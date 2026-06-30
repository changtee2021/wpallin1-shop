import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { logUploadFailure } from "@/lib/upload-validation";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";

const BUCKET = "wpall-retail-room-advisor";
const MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const Route = createFileRoute("/api/v1/room-advisor-photo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
          return Response.json(
            { error: "Server misconfigured" },
            { status: 500 },
          );
        }

        const form = await request.formData();
        const file = form.get("file");
        const guestSessionId = z
          .string()
          .uuid()
          .parse(String(form.get("guestSessionId") ?? ""));

        if (!(file instanceof File)) {
          return Response.json({ error: "Invalid form data" }, { status: 400 });
        }

        if (!IMAGE_TYPES.has(file.type)) {
          return Response.json(
            { error: "Unsupported file type" },
            { status: 415 },
          );
        }

        if (file.size > MAX_BYTES) {
          return Response.json({ error: "File too large" }, { status: 413 });
        }

        const authHeader = request.headers.get("authorization");
        const token = authHeader?.startsWith("Bearer ")
          ? authHeader.replace("Bearer ", "")
          : null;

        let userId: string | null = null;
        if (token) {
          const { createClient } = await import("@supabase/supabase-js");
          const { SUPABASE_SCHEMA } = await import("@/lib/erp-config");
          const userClient = createClient(
            SUPABASE_URL,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            {
              global: { headers: { Authorization: `Bearer ${token}` } },
              auth: { persistSession: false, autoRefreshToken: false },
              db: { schema: SUPABASE_SCHEMA },
            },
          );
          const { data: claims, error: authErr } =
            await userClient.auth.getClaims(token);
          if (authErr || !claims?.claims?.sub) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }
          userId = claims.claims.sub as string;
        }

        const rateKey = userId ?? guestSessionId;
        try {
          await enforceRateLimit("room-advisor-photo", rateKey, {
            requests: 15,
            window: "1 m",
          });
        } catch (err) {
          if (err instanceof RateLimitError) {
            return Response.json({ error: err.message }, { status: 429 });
          }
          throw err;
        }

        const ext =
          file.type === "image/png"
            ? "png"
            : file.type === "image/jpeg"
              ? "jpg"
              : "webp";
        const owner = userId ?? guestSessionId;
        const path = `sessions/${owner}/${crypto.randomUUID()}.${ext}`;

        try {
          const { createClient } = await import("@supabase/supabase-js");
          const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
          });

          const { error: uploadErr } = await admin.storage
            .from(BUCKET)
            .upload(path, file, {
              upsert: false,
              contentType: file.type || undefined,
            });

          if (uploadErr) throw uploadErr;

          const { data: urlData } = admin.storage
            .from(BUCKET)
            .getPublicUrl(path);

          return Response.json({
            ok: true,
            publicUrl: urlData.publicUrl,
            storagePath: path,
          });
        } catch (err) {
          logUploadFailure("room-advisor-photo", err);
          return Response.json({ error: "Upload failed" }, { status: 400 });
        }
      },
    },
  },
});
