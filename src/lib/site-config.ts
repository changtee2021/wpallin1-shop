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
  facebookUrl:
    envUrl("VITE_FACEBOOK_URL") ??
    "https://www.facebook.com/WPtradingintergroup/",
  facebookLabel: "WP Trading Inter Group",
  whatsapp: [
    {
      display: "098 280 6288",
      href: "https://wa.me/66982806288",
    },
    {
      display: "098 992 9889",
      href: "https://wa.me/66989929889",
    },
  ],
  emailTo:
    envUrl("VITE_CONTACT_EMAIL") ?? "wp.trading.intergroup2021@gmail.com",
  phoneTel: envUrl("VITE_PHONE_TEL") ?? "023340235",
  phoneDisplay: envUrl("VITE_PHONE_DISPLAY") ?? "02-334-0235",
  officeLabel: "สำนักงาน",
  officeLabelEn: "Office",
  salesLabel: "ฝ่ายขาย",
  salesLabelEn: "Sales",
  salesPhones: [
    { display: "099-687-0571", tel: "0996870571" },
    { display: "099-687-0570", tel: "0996870570" },
    { display: "099-687-0569", tel: "0996870569" },
    { display: "099-687-0561", tel: "0996870561" },
    { display: "081-934-5624", tel: "0819345624" },
  ],
  websiteUrl: envUrl("VITE_PUBLIC_WEBSITE_URL") ?? "https://www.wpallin1.com",
  websiteDisplay: "www.wpallin1.com",
  lineQrSrc: "/about/line-oa-qr.webp",
  address: {
    line1: "117 ซอยเจริญพัฒนา 11",
    line2: "แขวงบางชัน เขตคลองสามวา",
    city: "กรุงเทพมหานคร 10510",
    country: "Thailand",
  },
  addressEn: {
    line1: "117 Soi Charoen Phatthana 11",
    line2: "Bang Chan, Khlong Sam Wa",
    city: "Bangkok 10510",
    country: "Thailand",
  },
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAPS_QUERY)}`,
  mapsEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent(MAPS_QUERY)}&hl=th&z=16&output=embed`,
  social: [
    { label: "LINE" as const, href: LINE_OA_URL },
    {
      label: "Facebook" as const,
      href:
        envUrl("VITE_FACEBOOK_URL") ??
        "https://www.facebook.com/WPtradingintergroup/",
    },
    {
      label: "WhatsApp" as const,
      href: envUrl("VITE_WHATSAPP_URL") ?? "https://wa.me/66982806288",
    },
    ...(envUrl("VITE_YOUTUBE_URL")
      ? [{ label: "YouTube" as const, href: envUrl("VITE_YOUTUBE_URL")! }]
      : []),
  ],
} as const;
