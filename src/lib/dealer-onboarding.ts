import { siteConfig } from "@/lib/site-config";

export type DealerIntentProduct = {
  name: string;
  sku: string;
  slug: string;
};

/**
 * Opens a chat with the LINE OA with the message pre-filled, so sales knows
 * which product the visitor wanted before they type anything.
 * Format: https://line.me/R/oaMessage/{LINE ID}/?{percent-encoded text}
 */
export function lineOaMessageUrl(text: string): string {
  const lineId = encodeURIComponent(siteConfig.lineId);
  return `https://line.me/R/oaMessage/${lineId}/?${encodeURIComponent(text)}`;
}

export function dealerSignupLineMessage(
  product?: DealerIntentProduct | null,
): string {
  const lines = [
    "สวัสดีครับ/ค่ะ สนใจเปิดบัญชีตัวแทน WP ALL เพื่อสั่งซื้อสินค้า",
  ];
  if (product) {
    lines.push(`สินค้าที่สนใจ: ${product.name} (SKU ${product.sku})`);
  }
  lines.push("ชื่อร้าน/บริษัท: ", "จังหวัด: ", "เบอร์โทร: ");
  return lines.join("\n");
}

export const DEALER_ONBOARDING_STEPS = [
  {
    title: "ทัก LINE หาเซล",
    body: "บอกชื่อร้านกับจังหวัด เซลตอบกลับในเวลาทำการ",
  },
  {
    title: "รับรหัสตัวแทน",
    body: "เซลส่งรหัส WPD และรหัสผ่านชั่วคราวให้ทาง LINE",
  },
  {
    title: "เข้าระบบแล้วสั่งได้เลย",
    body: "ตั้งรหัสผ่านใหม่ครั้งแรก แล้วเห็นราคาตัวแทนทันที",
  },
] as const;
