import { APP_SLUG, SUPABASE_SCHEMA } from "@/lib/erp-config";
import type { HealthDto } from "@/types/api/health";

export function buildHealthPayload(): HealthDto {
  return {
    ok: true,
    service: APP_SLUG,
    schema: SUPABASE_SCHEMA,
    timestamp: new Date().toISOString(),
  };
}
