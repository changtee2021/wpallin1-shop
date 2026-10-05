import type { Bi } from "@/lib/bi";

/** About-page copy from the WP ALL 2026 presentation. */

const t = (th: string, en: string): Bi => ({ th, en });

export const ABOUT_PARTNER_CHIPS = [
  { value: "retail", th: "ร้านค้าปลีก", en: "Retail" },
  { value: "wholesale", th: "ขายส่ง", en: "Wholesale" },
  { value: "project", th: "งานโครงการ", en: "Project" },
  { value: "hybrid", th: "ไฮบริด", en: "Hybrid" },
  { value: "service", th: "งานบริการ", en: "Service" },
  { value: "contractor", th: "EPC / Turnkey", en: "EPC / Turnkey Contractor" },
  { value: "interior_designer", th: "นักออกแบบภายใน", en: "Interior Designer" },
  { value: "architect", th: "สถาปนิก", en: "Architecture" },
  { value: "online", th: "ร้านออนไลน์", en: "Online Store" },
  { value: "modern_trade", th: "โมเดิร์นเทรด", en: "Modern Trade" },
  { value: "seamstress", th: "ช่างเย็บม่าน", en: "Curtain Seamstress" },
  {
    value: "freelance_technician",
    th: "ช่างอิสระ",
    en: "Freelance Technician",
  },
] as const;

export const ABOUT_IMAGES = {
  hero: "/about/hero-sheer-thai.webp",
  philosophy: "/about/philosophy-drapes.webp",
  print: "/about/print-fabric-machine.webp",
  motor: "/about/motor-hardware.webp",
  factory: [
    "/brand/factory-1.webp",
    "/brand/factory-2.webp",
    "/brand/factory-3.webp",
    "/brand/factory-4.webp",
  ],
} as const;

export const ABOUT_INTRO = {
  kicker: t("เกี่ยวกับเรา", "About us"),
  title: t(
    "ศูนย์กลางผ้าม่าน ครบในโรงงานเดียว",
    "The centre of curtains, all from one factory",
  ),
  body: t(
    "WP ALL เป็นผู้ผลิตและจัดจำหน่ายผ้าม่าน มู่ลี่ และระบบมอเตอร์ ทั้งภายในและภายนอก ยึดมาตรฐานมืออาชีพและงานเฉพาะทาง เพื่อส่งมอบโซลูชันที่ออกแบบตามพื้นที่จริง ทั้งลูกค้าบ้านและงานโครงการ",
    "WP ALL is a manufacturer and distributor of curtains, blinds and motorised systems for indoor and outdoor spaces. Driven by professional standards and specialist expertise, we deliver tailor-made solutions for homes and commercial projects.",
  ),
};

export const ABOUT_VALUES: { title: Bi; body: Bi }[] = [
  {
    title: t("คนที่ไว้ใจได้", "Trusted people"),
    body: t(
      "ทีมขาย โรงงาน และช่างคุยจากโจทย์เดียวกัน",
      "Sales, factory and installers work from the same brief.",
    ),
  },
  {
    title: t("กระบวนการที่ไว้ใจได้", "Trusted processes"),
    body: t(
      "วัด ผลิต ตรวจ และส่งมอบ ตามขั้นตอนที่ชัดเจน",
      "Measure, make, inspect and deliver in a clear sequence.",
    ),
  },
  {
    title: t("เติบโตไปด้วยกัน", "Growing together"),
    body: t(
      "ร้านคู่ค้าและงานโครงการเติบโตไปพร้อมโรงงาน",
      "Dealers and projects grow with the factory.",
    ),
  },
];

export const ABOUT_CPC: { letter: string; title: string; body: Bi }[] = [
  {
    letter: "C",
    title: "Complete Solutions",
    body: t(
      "สินค้าครบทั้งม่าน มู่ลี่ ราง มอเตอร์ และงานพิมพ์",
      "Curtains, blinds, tracks, motors and printing in one range",
    ),
  },
  {
    letter: "P",
    title: "Professional Standards",
    body: t(
      "ผลิตด้วยวินัยโรงงาน มีขั้นตอนตรวจคุณภาพก่อนส่ง",
      "Factory discipline, with a quality check before shipping",
    ),
  },
  {
    letter: "C",
    title: "Custom Made Flexibility",
    body: t(
      "สั่งทำตามขนาด สี และระบบควบคุมที่ต้องการ",
      "Made to your size, colour and control",
    ),
  },
];

export const ABOUT_PROCESS: { title: Bi; body: Bi }[] = [
  {
    title: t("เตรียมวัสดุ", "Preparation"),
    body: t(
      "ตรวจรับและเตรียมวัสดุตามใบสั่งผลิต",
      "Materials checked and staged against each work order.",
    ),
  },
  {
    title: t("ตัด", "Cutting"),
    body: t(
      "ตัดใบ ราง และผ้าตามขนาดที่สั่ง",
      "Slats, tracks and fabric cut to the ordered size.",
    ),
  },
  {
    title: t("เจาะ", "Drilling"),
    body: t(
      "เจาะรูสำหรับเชือกและอุปกรณ์ตามรุ่น",
      "Holes drilled for cords and fittings per model.",
    ),
  },
  {
    title: t("ประกอบ", "Assembly"),
    body: t(
      "ประกอบชุดกลไกและตัวสินค้าในสายผลิต",
      "Mechanisms and products assembled on the line.",
    ),
  },
  {
    title: t("คลังสี", "Colour storage"),
    body: t(
      "จัดเก็บวัสดุแยกตามรหัสสี หยิบใช้ได้ถูกต้อง",
      "Materials stored by colour code so the right one is picked.",
    ),
  },
  {
    title: t("ตรวจคุณภาพ", "Quality check"),
    body: t(
      "ตรวจการทำงานและความเรียบร้อยก่อนแพ็กส่ง",
      "Function and finish checked before packing.",
    ),
  },
];
