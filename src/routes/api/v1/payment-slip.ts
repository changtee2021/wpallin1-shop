import { createFileRoute } from "@tanstack/react-router";

import { logUploadFailure, validateUploadFile } from "@/lib/upload-validation";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";

export const Route = createFileRoute("/api/v1/payment-slip")({
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
        const { uploadPaymentSlip } =
          await import("@/services/payment.service");

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
          await enforceRateLimit("payment-slip", userId, {
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
        const paymentId = form.get("paymentId");
        const orderId = form.get("orderId");

        if (
          !(file instanceof File) ||
          typeof paymentId !== "string" ||
          typeof orderId !== "string"
        ) {
          return Response.json({ error: "Invalid form data" }, { status: 400 });
        }

        const uploadError = validateUploadFile(file);
        if (uploadError) {
          return Response.json(
            { error: uploadError.message },
            { status: uploadError.status },
          );
        }

        try {
          const fileUrl = await uploadPaymentSlip(
            supabase,
            userId,
            paymentId,
            orderId,
            file,
          );
          return Response.json({ ok: true, fileUrl });
        } catch (err) {
          logUploadFailure("payment-slip", err);
          return Response.json({ error: "Upload failed" }, { status: 400 });
        }
      },
    },
  },
});
