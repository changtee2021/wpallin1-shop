import { createFileRoute } from "@tanstack/react-router";

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

        try {
          const fileUrl = await uploadPaymentSlip(
            supabase,
            claims.claims.sub as string,
            paymentId,
            orderId,
            file,
          );
          return Response.json({ ok: true, fileUrl });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Upload failed";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
