export type FeedbackCategory = "contact" | "error" | "404" | "403" | "500";

export type ErrorPageKind = "404" | "403" | "500" | "generic";

export const ERROR_PAGE_COPY: Record<
  ErrorPageKind,
  { code: string; title: string; description: string }
> = {
  "404": {
    code: "404",
    title: "ไม่พบหน้านี้",
    description: "หน้าที่คุณค้นหาไม่มีอยู่หรือถูกย้ายแล้ว",
  },
  "403": {
    code: "403",
    title: "ไม่มีสิทธิ์เข้าถึง",
    description: "บัญชีของคุณไม่สามารถเปิดหน้านี้ได้",
  },
  "500": {
    code: "500",
    title: "เกิดข้อผิดพลาดของระบบ",
    description: "ขออภัย มีบางอย่างผิดพลาด ทีมงานได้รับแจ้งแล้วหรือส่งรายงานด้านล่าง",
  },
  generic: {
    code: "Error",
    title: "โหลดหน้าไม่สำเร็จ",
    description: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้งหรือแจ้งทีมงาน",
  },
};

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
