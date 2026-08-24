import { LINE_OA_URL } from "@/lib/catalog-config";

const MAPS_QUERY =
  "117 ซอยเจริญพัฒนา 11 แขวงบางชัน เขตคลองสามวา กรุงเทพมหานคร 10510";

function envUrl(name: string): string | undefined {
  const value = import.meta.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export const siteConfig = {
  name: "WP ALL",
  legalName: "บริษัท ดับบลิวพี เทรดดิ้ง อินเตอร์กรุ๊ป จำกัด",
  legalNameEn: "WP Trading Intergroup Co., Ltd.",
  slogan: "CENTER OF CURTAIN",
  sloganSub: "WP all in one – Home Decoration",
  lineId: "@wpfordealer",
  lineUrl: LINE_OA_URL,
  emailTo:
    envUrl("VITE_CONTACT_EMAIL") ?? "wp.trading.intergroup2021@gmail.com",
  phoneTel: envUrl("VITE_PHONE_TEL") ?? "023340235",
  phoneDisplay: envUrl("VITE_PHONE_DISPLAY") ?? "02-334-0235",
  officeLabel: "สำนักงาน",
  officeLabelEn: "Office",
  address: {
    line1: "117 ซอยเจริญพัฒนา 11",
    line2: "แขวงบางชัน เขตคลองสามวา",
    city: "กรุงเทพมหานคร 10510",
  },
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAPS_QUERY)}`,
  mapsEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent(MAPS_QUERY)}&hl=th&z=16&output=embed`,
  social: [
    { label: "LINE" as const, href: LINE_OA_URL },
    ...(envUrl("VITE_FACEBOOK_URL")
      ? [{ label: "Facebook" as const, href: envUrl("VITE_FACEBOOK_URL")! }]
      : []),
    ...(envUrl("VITE_YOUTUBE_URL")
      ? [{ label: "YouTube" as const, href: envUrl("VITE_YOUTUBE_URL")! }]
      : []),
  ],
} as const;
