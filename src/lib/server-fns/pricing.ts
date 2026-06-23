import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveMemberPricesForProducts } from "@/services/pricing.service";

export const fetchMemberProductPrices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        products: z.array(
          z.object({
            id: z.string().uuid(),
            retailPrice: z.number(),
          }),
        ),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) =>
    resolveMemberPricesForProducts(
      context.supabase,
      context.userId,
      data.products,
    ),
  );
