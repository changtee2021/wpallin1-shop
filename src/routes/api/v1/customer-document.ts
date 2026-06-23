import { createFileRoute } from "@tanstack/react-router";

import { logUploadFailure, validateUploadFile } from "@/lib/upload-validation";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";

export const Route = createFileRoute("/api/v1/customer-document")({
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
          await enforceRateLimit("customer-document", userId, {
            requests: 10,
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
        const docType = form.get("docType");

        if (!(file instanceof File) || typeof docType !== "string") {
          return Response.json({ error: "Invalid form data" }, { status: 400 });
        }

        const uploadError = validateUploadFile(file);
        if (uploadError) {
          return Response.json(
            { error: uploadError.message },
            { status: uploadError.status },
          );
        }

        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${userId}/${docType}/${Date.now()}.${ext}`;

        try {
          const { error: uploadErr } = await supabase.storage
            .from("wpall-retail-customer-docs")
            .upload(path, file, { upsert: false });

          if (uploadErr) throw uploadErr;

          const { data: urlData } = supabase.storage
            .from("wpall-retail-customer-docs")
            .getPublicUrl(path);

          return Response.json({
            ok: true,
            fileUrl: urlData.publicUrl,
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
          });
        } catch (err) {
          logUploadFailure("customer-document", err);
          return Response.json({ error: "Upload failed" }, { status: 400 });
        }
      },
    },
  },
});
