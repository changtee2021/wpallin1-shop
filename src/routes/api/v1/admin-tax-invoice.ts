import { createFileRoute } from "@tanstack/react-router";

import { logUploadFailure, validateUploadFile } from "@/lib/upload-validation";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";

export const Route = createFileRoute("/api/v1/admin-tax-invoice")({
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
        const { getAdminClient } = await import("@/lib/server-fns/_shared");
        const { issueOrderTaxInvoice } =
          await import("@/services/tax-invoice.service");

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
          await enforceRateLimit("admin-tax-invoice", userId, {
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
        const orderId = form.get("orderId");
        const invoiceNumber = form.get("invoiceNumber");
        const invoiceDate = form.get("invoiceDate");

        if (
          !(file instanceof File) ||
          typeof orderId !== "string" ||
          typeof invoiceNumber !== "string" ||
          !invoiceNumber.trim()
        ) {
          return Response.json({ error: "Invalid form data" }, { status: 400 });
        }

        if (file.type && file.type !== "application/pdf") {
          return Response.json(
            { error: "รองรับเฉพาะไฟล์ PDF" },
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

        try {
          const adminClient = await getAdminClient();
          const invoice = await issueOrderTaxInvoice(adminClient, userId, {
            orderId,
            invoiceNumber: invoiceNumber.trim(),
            invoiceDate:
              typeof invoiceDate === "string" && invoiceDate
                ? invoiceDate
                : undefined,
            file,
          });
          return Response.json({ ok: true, invoice });
        } catch (err) {
          logUploadFailure("admin-tax-invoice", err);
          return Response.json(
            {
              error:
                err instanceof Error ? err.message : "อัปโหลดใบกำกับไม่สำเร็จ",
            },
            { status: 400 },
          );
        }
      },
    },
  },
});
