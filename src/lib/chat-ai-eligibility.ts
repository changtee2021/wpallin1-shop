import type { SupabaseClient } from "@supabase/supabase-js";

import { isDealerUser } from "@/services/tier.service";

export type ChatAiAccess = {
  canUseLlm: boolean;
  mode: "basic" | "premium";
  reason: "dealer" | "high_spend" | "disabled" | "quota" | "guest" | "retail";
  totalSpent: number;
  minSpendRequired: number;
  dailyQuota: number;
  dailyUsed: number;
};

export type ChatSettings = {
  aiEnabled: boolean;
  minLifetimeSpend: number;
  dailyQuota: number;
  businessHours: {
    timezone: string;
    weekdays: number[];
    open: string;
    close: string;
  };
};

const DEFAULT_SETTINGS: ChatSettings = {
  aiEnabled: true,
  minLifetimeSpend: 100_000,
  dailyQuota: 20,
  businessHours: {
    timezone: "Asia/Bangkok",
    weekdays: [1, 2, 3, 4, 5, 6],
    open: "09:00",
    close: "18:00",
  },
};

export async function getChatSettings(
  supabase: SupabaseClient,
): Promise<ChatSettings> {
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", [
      "chat.ai_enabled",
      "chat.ai_min_lifetime_spend",
      "chat.ai_daily_quota",
      "chat.business_hours",
    ]);

  const map = new Map((data ?? []).map((r) => [r.key, r.value]));
  const bh = map.get("chat.business_hours") as
    | ChatSettings["businessHours"]
    | undefined;

  return {
    aiEnabled: map.get("chat.ai_enabled") !== false,
    minLifetimeSpend: Number(
      map.get("chat.ai_min_lifetime_spend") ??
        DEFAULT_SETTINGS.minLifetimeSpend,
    ),
    dailyQuota: Number(
      map.get("chat.ai_daily_quota") ?? DEFAULT_SETTINGS.dailyQuota,
    ),
    businessHours: bh ?? DEFAULT_SETTINGS.businessHours,
  };
}

export async function getDailyAiUsage(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("chat_ai_usage")
    .select("message_count")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle();

  return Number(data?.message_count ?? 0);
}

export async function incrementDailyAiUsage(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const current = await getDailyAiUsage(supabase, userId);
  const next = current + 1;

  await supabase.from("chat_ai_usage").upsert(
    {
      user_id: userId,
      usage_date: today,
      message_count: next,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,usage_date" },
  );

  return next;
}

export async function resolveChatAiAccess(
  supabase: SupabaseClient,
  userId: string | null | undefined,
): Promise<ChatAiAccess> {
  const settings = await getChatSettings(supabase);

  if (!userId) {
    return {
      canUseLlm: false,
      mode: "basic",
      reason: "guest",
      totalSpent: 0,
      minSpendRequired: settings.minLifetimeSpend,
      dailyQuota: settings.dailyQuota,
      dailyUsed: 0,
    };
  }

  if (!settings.aiEnabled) {
    return {
      canUseLlm: false,
      mode: "basic",
      reason: "disabled",
      totalSpent: 0,
      minSpendRequired: settings.minLifetimeSpend,
      dailyQuota: settings.dailyQuota,
      dailyUsed: 0,
    };
  }

  const [{ data: profile }, dealer, dailyUsed] = await Promise.all([
    supabase
      .from("profiles")
      .select("total_spent")
      .eq("id", userId)
      .maybeSingle(),
    isDealerUser(supabase, userId),
    getDailyAiUsage(supabase, userId),
  ]);

  const totalSpent = Number(profile?.total_spent ?? 0);

  if (dealer) {
    const overQuota = dailyUsed >= settings.dailyQuota;
    return {
      canUseLlm: !overQuota,
      mode: "premium",
      reason: overQuota ? "quota" : "dealer",
      totalSpent,
      minSpendRequired: settings.minLifetimeSpend,
      dailyQuota: settings.dailyQuota,
      dailyUsed,
    };
  }

  if (totalSpent >= settings.minLifetimeSpend) {
    const overQuota = dailyUsed >= settings.dailyQuota;
    return {
      canUseLlm: !overQuota,
      mode: "premium",
      reason: overQuota ? "quota" : "high_spend",
      totalSpent,
      minSpendRequired: settings.minLifetimeSpend,
      dailyQuota: settings.dailyQuota,
      dailyUsed,
    };
  }

  return {
    canUseLlm: false,
    mode: "basic",
    reason: "retail",
    totalSpent,
    minSpendRequired: settings.minLifetimeSpend,
    dailyQuota: settings.dailyQuota,
    dailyUsed,
  };
}

export function isWithinBusinessHours(
  settings: ChatSettings,
  now = new Date(),
): boolean {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: settings.businessHours.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const parts = formatter.formatToParts(now);
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  const weekday = now.toLocaleDateString("en-US", {
    timeZone: settings.businessHours.timezone,
    weekday: "short",
  });
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const dayNum = dayMap[weekday.slice(0, 3)] ?? 0;
  if (!settings.businessHours.weekdays.includes(dayNum)) return false;

  const current = `${hour}:${minute}`;
  return (
    current >= settings.businessHours.open &&
    current <= settings.businessHours.close
  );
}
