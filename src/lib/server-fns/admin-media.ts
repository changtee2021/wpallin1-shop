import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getAdminClient } from "@/lib/server-fns/_shared";
import { requireAdmin } from "@/lib/server-auth";
import { listAdminMediaAssets } from "@/services/admin-media.service";

export const fetchAdminMediaAssets = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) =>
    z.object({ folder: z.string().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return listAdminMediaAssets(supabase, data.folder);
  });
