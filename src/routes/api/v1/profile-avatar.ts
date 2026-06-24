import { createFileRoute } from "@tanstack/react-router";

import { logUploadFailure, validateUploadFile } from "@/lib/upload-validation";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";

const AVATAR_MIME = ["image/jpeg", "image/png", "image/webp"] as const;

export const Route = createFileRoute("/api/v1/profile-avatar")({
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
        const { updateProfileAvatarPath } =
          await import("@/services/profile.service");

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
          await enforceRateLimit("profile-avatar", userId, {
            requests: 5,
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

        if (!AVATAR_MIME.includes(file.type as (typeof AVATAR_MIME)[number])) {
          return Response.json(
            { error: "Only JPG, PNG, or WebP images are allowed" },
            { status: 415 },
          );
        }

        const uploadError = validateUploadFile(file);
        if (uploadError) {
          return Response.json(
            { error: uploadError.message },
            { status: uploadError.status },
          );
        }

        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${userId}/avatar/${Date.now()}.${ext}`;

        try {
          const { error: uploadErr } = await supabase.storage
            .from("wpall-retail-customer-docs")
            .upload(path, file, { upsert: true });

          if (uploadErr) throw uploadErr;

          await updateProfileAvatarPath(supabase, userId, path);

          const { data: signed } = await supabase.storage
            .from("wpall-retail-customer-docs")
            .createSignedUrl(path, 60 * 60 * 24);

          return Response.json({
            ok: true,
            avatarUrl: signed?.signedUrl ?? path,
          });
        } catch (err) {
          logUploadFailure("profile-avatar", err);
          return Response.json({ error: "Upload failed" }, { status: 400 });
        }
      },
    },
  },
});
