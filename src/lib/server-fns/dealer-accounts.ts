import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  enforceRateLimit,
  getClientIp,
  RateLimitError,
  RateLimitUnavailableError,
} from "@/lib/rate-limit";
import { normalizeDealerCode } from "@/lib/dealer-provinces";
import { requireAdmin } from "@/lib/server-auth";
import { getAdminClient } from "@/lib/server-fns/_shared";
import {
  clearMustChangePassword,
  createDealerAccount,
  findDealerLoginEmail,
  getDealerAccount,
  resetDealerPassword,
} from "@/services/dealer-account.service";

const INVALID_LOGIN = "รหัสตัวแทนหรือรหัสผ่านไม่ถูกต้อง";

const provinceCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2,4}$/);

export const createDealerAccountFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        companyName: z.string().trim().min(1).max(200),
        contactName: z.string().trim().min(1).max(120),
        contactPhone: z.string().trim().min(9).max(20),
        contactEmail: z
          .string()
          .trim()
          .email()
          .optional()
          .or(z.literal("").transform(() => undefined)),
        provinceCode: provinceCodeSchema,
        businessType: z.string().trim().max(60).optional(),
        taxId: z
          .string()
          .trim()
          .regex(/^\d{13}$/)
          .optional()
          .or(z.literal("").transform(() => undefined)),
        branch: z.string().trim().max(60).optional(),
        address: z.string().trim().max(500).optional(),
        source: z.enum(["line", "sales"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const admin = await getAdminClient();
    return createDealerAccount(admin, context.userId, data);
  });

export const resetDealerPasswordFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const admin = await getAdminClient();
    return resetDealerPassword(admin, data.userId);
  });

/** Dealers log in with WPD-XXX-0000; the code maps to the auth email server-side so emails are never exposed. */
export const signInWithDealerCode = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        code: z.string().trim().min(6).max(32),
        password: z.string().min(1).max(200),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const ip = getClientIp(getRequest());
    const code = normalizeDealerCode(data.code);
    try {
      await enforceRateLimit("dealer-code-login", `${ip}:${code}`, {
        requests: 8,
        window: "10 m",
      });
      await enforceRateLimit("dealer-code-login-code", code, {
        requests: 20,
        window: "1 h",
      });
    } catch (err) {
      if (err instanceof RateLimitError) {
        throw new Error("ลองหลายครั้งเกินไป กรุณารอ 10 นาทีแล้วลองใหม่");
      }
      if (err instanceof RateLimitUnavailableError) {
        throw new Error("ระบบไม่พร้อมชั่วคราว กรุณาลองใหม่ภายหลัง");
      }
      throw err;
    }

    const admin = await getAdminClient();
    const email = await findDealerLoginEmail(admin, code);
    if (!email) throw new Error(INVALID_LOGIN);

    const url = process.env.SUPABASE_URL;
    const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !publishableKey) throw new Error("ระบบไม่พร้อมชั่วคราว");

    const anon = createClient(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: auth, error } = await anon.auth.signInWithPassword({
      email,
      password: data.password,
    });
    if (error || !auth.session) throw new Error(INVALID_LOGIN);

    return {
      accessToken: auth.session.access_token,
      refreshToken: auth.session.refresh_token,
    };
  });

export const fetchMyDealerAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await getAdminClient();
    return getDealerAccount(admin, context.userId);
  });

export const completeDealerPasswordChange = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ newPassword: z.string().min(8).max(200) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const admin = await getAdminClient();
    const { error } = await admin.auth.admin.updateUserById(context.userId, {
      password: data.newPassword,
    });
    if (error) throw new Error("เปลี่ยนรหัสผ่านไม่สำเร็จ");
    await clearMustChangePassword(admin, context.userId);
    return { ok: true };
  });
