import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getAdminClient } from "@/lib/server-fns/_shared";
import { requireAdmin } from "@/lib/server-auth";
import { searchAdminQuickNav } from "@/services/admin-nav.service";

export const searchAdminQuickNavFn = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) =>
    z.object({ query: z.string().max(120).default("") }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return searchAdminQuickNav(supabase, data.query);
  });
