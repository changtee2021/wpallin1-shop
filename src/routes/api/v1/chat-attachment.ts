import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { logUploadFailure } from "@/lib/upload-validation";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import type { ChatAttachment } from "@/lib/chat.types";

const BUCKET = "wpall-retail-chat";
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;
const MAX_PDF_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const Route = createFileRoute("/api/v1/chat-attachment")({
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
        const conversationId = z
          .string()
          .uuid()
          .parse(String(form.get("conversationId") ?? ""));
        const guestSessionId = form.get("guestSessionId");
        const guestId =
          typeof guestSessionId === "string" && guestSessionId
            ? z.string().uuid().parse(guestSessionId)
            : null;

        if (!(file instanceof File)) {
          return Response.json({ error: "Invalid form data" }, { status: 400 });
        }

        const isPdf = file.type === "application/pdf";
        const isImage = IMAGE_TYPES.has(file.type);
        if (!isPdf && !isImage) {
          return Response.json(
            { error: "Unsupported file type" },
            { status: 415 },
          );
        }

        const maxBytes = isPdf ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
        if (file.size > maxBytes) {
          return Response.json({ error: "File too large" }, { status: 413 });
        }

        const authHeader = request.headers.get("authorization");
        const token = authHeader?.startsWith("Bearer ")
          ? authHeader.replace("Bearer ", "")
          : null;

        const { createClient } = await import("@supabase/supabase-js");
        const { SUPABASE_SCHEMA } = await import("@/lib/erp-config");
        const { getConversationById, assertConversationAccess } =
          await import("@/services/chat.service");

        const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
          auth: { persistSession: false, autoRefreshToken: false },
          db: { schema: SUPABASE_SCHEMA },
        });

        const conversation = await getConversationById(admin, conversationId);
        if (!conversation) {
          return Response.json(
            { error: "Conversation not found" },
            { status: 404 },
          );
        }

        let userId: string | null = null;
        if (token) {
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

        try {
          await assertConversationAccess(admin, conversation, {
            userId,
            guestSessionId: guestId,
          });
        } catch {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        const rateKey = userId ?? guestId ?? conversationId;
        try {
          await enforceRateLimit("chat-attachment", rateKey, {
            requests: 20,
            window: "1 m",
          });
        } catch (err) {
          if (err instanceof RateLimitError) {
            return Response.json({ error: err.message }, { status: 429 });
          }
          throw err;
        }

        const ext = isPdf
          ? "pdf"
          : file.type === "image/png"
            ? "png"
            : file.type === "image/jpeg"
              ? "jpg"
              : "webp";
        const path = `chat/${conversationId}/${crypto.randomUUID()}.${ext}`;

        try {
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

          const attachment: ChatAttachment = {
            url: urlData.publicUrl,
            thumbUrl: isPdf ? null : urlData.publicUrl,
            mime: file.type,
            fileName: file.name,
            sizeBytes: file.size,
          };

          return Response.json({ ok: true, attachment });
        } catch (err) {
          logUploadFailure("chat-attachment", err);
          return Response.json({ error: "Upload failed" }, { status: 400 });
        }
      },
    },
  },
});
