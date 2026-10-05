export type FeedbackCategory = "contact" | "error" | "404" | "403" | "500";

export type ErrorPageKind = "400" | "403" | "404" | "500" | "503" | "generic";

export const ERROR_PAGE_KINDS = [
  "400",
  "403",
  "404",
  "500",
  "503",
  "generic",
] as const satisfies readonly ErrorPageKind[];

export const ERROR_PAGE_COPY: Record<
  ErrorPageKind,
  { code: string; kicker: string; title: string; description: string }
> = {
  "400": {
    code: "400",
    kicker: "Bad request",
    title: "ลิงก์นี้ไม่ถูกต้อง",
    description: "ข้อมูลในลิงก์ไม่ครบหรือผิดรูปแบบ ลองเปิดใหม่จากหน้าแรก",
  },
  "403": {
    code: "403",
    kicker: "Access denied",
    title: "ไม่มีสิทธิ์เข้าถึง",
    description: "บัญชีของคุณไม่สามารถเปิดหน้านี้ได้",
  },
  "404": {
    code: "404",
    kicker: "Page not found",
    title: "ไม่พบหน้านี้",
    description: "หน้าที่คุณค้นหาอาจถูกย้ายหรือไม่มีอยู่แล้ว",
  },
  "500": {
    code: "500",
    kicker: "Server error",
    title: "ระบบขัดข้องชั่วคราว",
    description: "ขออภัย มีบางอย่างผิดพลาด ลองใหม่อีกครั้งในอีกสักครู่",
  },
  "503": {
    code: "503",
    kicker: "Service unavailable",
    title: "ปิดปรับปรุงชั่วคราว",
    description: "เรากำลังปรับปรุงระบบ กลับมาใหม่อีกสักครู่",
  },
  generic: {
    code: "Error",
    kicker: "Something went wrong",
    title: "โหลดหน้าไม่สำเร็จ",
    description: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้งหรือแจ้งทีมงาน",
  },
};

/** Codes where trying again is the useful first action, rather than going home. */
export function isRetryableKind(kind: ErrorPageKind) {
  return kind === "500" || kind === "503" || kind === "generic";
}

export function feedbackCategoryFromKind(
  kind: ErrorPageKind,
): FeedbackCategory {
  if (kind === "404") return "404";
  if (kind === "403") return "403";
  if (kind === "500") return "500";
  return "error";
}

export function defaultFeedbackSubject(kind: ErrorPageKind, path?: string) {
  const copy = ERROR_PAGE_COPY[kind];
  const where = path ? ` — ${path}` : "";
  return `[${copy.code}] รายงานปัญหา${where}`;
}

export function buildContactFeedbackSearch(input: {
  kind?: ErrorPageKind;
  from?: string;
  message?: string;
}) {
  return {
    type: "feedback" as const,
    code: input.kind ?? ("error" as ErrorPageKind),
    from: input.from,
    message: input.message,
  };
}
