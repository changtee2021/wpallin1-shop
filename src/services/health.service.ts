import { buildHealthPayload } from "@/domain/health";

export function getHealth() {
  return buildHealthPayload();
}
