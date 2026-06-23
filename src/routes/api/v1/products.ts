import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { listPublicProducts } from "@/services/catalog.service";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  featured: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  sortBy: z.enum(["name", "retail_price", "created_at"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

export const Route = createFileRoute("/api/v1/products")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const parsed = querySchema.safeParse(
          Object.fromEntries(url.searchParams.entries()),
        );
        if (!parsed.success) {
          return Response.json(
            { error: parsed.error.message },
            { status: 400 },
          );
        }

        const { supabaseAdmin } =
          await import("@/integrations/supabase/client.server");
        const result = await listPublicProducts(supabaseAdmin, parsed.data);
        return Response.json(result, {
          headers: { "cache-control": "no-store" },
        });
      },
    },
  },
});
