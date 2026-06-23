import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/server-auth";
import { getAdminClient } from "@/lib/server-fns/_shared";
import {
  listCustomerDocuments,
  reviewCustomerDocument,
  saveCustomerDocument,
  type KycDocType,
} from "@/services/documents.service";

const docTypeSchema = z.enum([
  "id_card",
  "house_registration",
  "company_certificate",
  "vat_pp20",
  "tax_id_card",
  "bank_book",
  "other",
]);

export const fetchCustomerDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await getAdminClient();
    return listCustomerDocuments(supabase, context.userId);
  });

export const fetchAdminCustomerDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return listCustomerDocuments(supabase, data.userId);
  });

export const saveCustomerDocumentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        docType: docTypeSchema,
        fileUrl: z.string().min(1),
        fileName: z.string().optional(),
        mimeType: z.string().optional(),
        fileSize: z.number().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const supabase = await getAdminClient();
    return saveCustomerDocument(supabase, context.userId, {
      docType: data.docType as KycDocType,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
    });
  });

export const adminReviewCustomerDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        docId: z.string().uuid(),
        status: z.enum(["approved", "rejected"]),
        reviewNote: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await reviewCustomerDocument(
      supabase,
      data.docId,
      context.userId,
      data.status,
      data.reviewNote,
    );
    return { ok: true };
  });
