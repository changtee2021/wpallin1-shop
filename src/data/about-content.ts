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
    "ศูนย์กลางผ้าม่าน ครบในที่เดียว",
    "The centre of curtains, all in one place",
  ),
  body: t(
    "WP ALL คือแบรนด์ผ้าม่าน มู่ลี่ และระบบมอเตอร์ ทั้งภายในและภายนอก ยึดมาตรฐานมืออาชีพและงานเฉพาะทาง เพื่อส่งมอบโซลูชันที่ออกแบบตามพื้นที่จริง ทั้งลูกค้าบ้านและงานโครงการ",
    "WP ALL is a brand of curtains, blinds and motorised systems for indoor and outdoor spaces. Driven by professional standards and specialist expertise, we deliver tailor-made solutions for homes and commercial projects.",
  ),
};

export const ABOUT_VALUES: { title: Bi; body: Bi }[] = [
  {
    title: t("คนที่ไว้ใจได้", "Trusted people"),
    body: t(
      "ทีมขาย ทีมผลิต และช่างคุยจากโจทย์เดียวกัน",
      "Sales, production and installers work from the same brief.",
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
      "ร้านคู่ค้าและงานโครงการเติบโตไปพร้อมกับเรา",
      "Dealers and projects grow with us.",
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
      "ทำงานด้วยมาตรฐานมืออาชีพ ตรวจคุณภาพทุกชิ้นก่อนส่ง",
      "Professional standards, with every piece checked before shipping",
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

/**
 * W-P-A-L-L: the five core values behind the WP ALL name (WP Trading Intergroup, 2026 HR review).
 * "promise" restates each value as a commitment to a customer; "evidence" points to what already
 * happens on the production line (steps are 1-based indexes into ABOUT_PROCESS). No figures or
 * certifications are claimed on purpose.
 */
export type WpallValue = {
  letter: "W" | "P" | "A" | "L";
  name: string;
  tagline: Bi;
  promise: Bi;
  evidence: Bi;
  steps: number[];
};

export const WPALL_VALUES: WpallValue[] = [
  {
    letter: "W",
    name: "Working Together",
    tagline: t("รวมมือ รวมใจ ก้าวไปด้วยกัน", "Together We Achieve More"),
    promise: t(
      "ทีมขาย ทีมผลิต และช่างทำงานจากโจทย์เดียวกัน เพื่อให้งานของคุณไม่ตกหล่นระหว่างทาง",
      "Sales, production and installers work from one brief, so nothing is lost along the way.",
    ),
    evidence: t(
      "ทุกออเดอร์เริ่มจากใบสั่งผลิตเดียว ตั้งแต่เตรียมวัสดุจนส่งมอบ",
      "Every order starts from a single work order, from material prep to delivery.",
    ),
    steps: [1],
  },
  {
    letter: "P",
    name: "Professionalism",
    tagline: t("มืออาชีพในทุกการกระทำ", "Excellence in Every Action"),
    promise: t(
      "ทำงานอย่างมีวินัยและโปร่งใส และตรวจคุณภาพทุกชิ้นก่อนส่ง",
      "Disciplined, transparent work, with every piece checked before it ships.",
    ),
    evidence: t(
      "ตรวจการทำงานและความเรียบร้อยก่อนแพ็กส่งทุกชิ้น",
      "A function-and-finish check on every piece before it is packed.",
    ),
    steps: [6],
  },
  {
    letter: "A",
    name: "Accountability",
    tagline: t("รับผิดชอบ ทำให้สำเร็จ", "Own It, Deliver It"),
    promise: t(
      "ส่งมอบตามขนาดที่สั่งและตรงตามเวลา หากผิดพลาดเรายอมรับและแก้ไข",
      "We deliver to the size you ordered, on time. If something is wrong, we own it and fix it.",
    ),
    evidence: t(
      "ตัดและเจาะตามขนาดที่สั่ง และเก็บวัสดุแยกตามรหัสสี เพื่อหยิบใช้ได้ถูกต้อง",
      "Cut and drilled to the ordered size, with materials stored by colour code so the right one is picked.",
    ),
    steps: [2, 3, 5],
  },
  {
    letter: "L",
    name: "Longevity",
    tagline: t(
      "ความสำเร็จที่ยั่งยืนสู่อนาคต",
      "Sustaining Success for the Future",
    ),
    promise: t(
      "วางแผนระยะยาว ให้ร้านพาร์ทเนอร์และงานโครงการเติบโตไปพร้อมกับเรา",
      "We plan for the long term, so partners and projects grow with us.",
    ),
    evidence: t(
      "ทุกออเดอร์ผ่านขั้นตอนเดียวกันด้วยมาตรฐานเดียวกัน ทำซ้ำได้ทุกครั้ง",
      "Every order follows the same steps to the same standard, every time.",
    ),
    steps: [4],
  },
  {
    letter: "L",
    name: "Loyalty",
    tagline: t("ภักดีด้วยใจ มั่นคงด้วยศรัทธา", "Committed with Heart"),
    promise: t(
      "ซื่อสัตย์ โปร่งใส และรักษาคำมั่นกับพาร์ทเนอร์ ด้วยทีมขายที่ดูแลประจำ",
      "Honest, transparent and true to our word, backed by a dedicated sales contact.",
    ),
    evidence: t(
      "พาร์ทเนอร์ทุกร้านมีเจ้าหน้าที่ขายดูแลบัญชีโดยเฉพาะตลอดการทำงาน",
      "Every partner has a dedicated sales representative throughout.",
    ),
    steps: [],
  },
];

/**
 * Company-profile facts. `confirmed: false` items render only in `npm run dev` (with a DRAFT tag)
 * so an unverified figure can never reach production; flip to `true` once management signs off.
 */
export type AboutStat = { value: string; label: Bi; confirmed: boolean };

export const ABOUT_STATS: AboutStat[] = [
  {
    value: "20+",
    label: t(
      "ปี รากฐานจากธุรกิจผ้าม่านของครอบครัว",
      "Years of family roots in curtains",
    ),
    confirmed: true,
  },
  {
    value: "10+",
    label: t("ปีประสบการณ์ของทีมงาน", "Years of hands-on experience"),
    confirmed: true,
  },
  {
    value: "100+",
    label: t("ร้านค้าและดีลเลอร์", "Dealers and shops"),
    confirmed: true,
  },
  {
    value: "10,000+",
    label: t("รายการสินค้า (SKU)", "Products (SKUs)"),
    confirmed: true,
  },
  {
    value: "10,000+",
    label: t("ตร.ม. โรงงานและคลังสินค้า", "m² of factory & warehouse"),
    confirmed: true,
  },
  {
    value: "TH + Export",
    label: t(
      "ส่งสินค้าทั้งในประเทศและต่างประเทศ",
      "Shipping in Thailand and abroad",
    ),
    confirmed: true,
  },
];

export type AboutMilestone = {
  year: string;
  title: Bi;
  body: Bi;
  /** Revealed when the card is hovered. */
  image?: string;
  /** Logos sit on white and are not cropped. */
  imageFit?: "cover" | "contain";
  confirmed: boolean;
};

export const ABOUT_MILESTONES: AboutMilestone[] = [
  {
    year: "2020",
    title: t("ก่อตั้งบริษัท", "Company founded"),
    body: t(
      "ก่อตั้ง บริษัท ดับบลิวพี เทรดดิ้ง อินเตอร์กรุ๊ป จำกัด ต่อยอดจากธุรกิจผ้าม่านของครอบครัวที่ทำมากว่า 20 ปี",
      "WP Trading Intergroup Co., Ltd. is founded, building on a family curtain business of more than 20 years.",
    ),
    image: "/brand/factory-1.webp",
    confirmed: true,
  },
  {
    year: "2025",
    title: t("Colors of Buriram 2025", "Colors of Buriram 2025"),
    body: t(
      "พิมพ์ลายผ้าลายสิริราชพัสตราภรณ์ลงผ้าโปร่งผืนใหญ่",
      "Large sheer fabric printed with the Siriraj Phastraporn pattern.",
    ),
    image: "/projects/buriram-curtain.webp",
    confirmed: true,
  },
  {
    year: "2025",
    title: t("Bangkok Design Week 2025", "Bangkok Design Week 2025"),
    body: t(
      "ม่านพิมพ์ลายใน Pavilion ป่าสีแดง “หย่อมป่า”",
      "Printed curtains for the “Yom Pa” red forest pavilion.",
    ),
    image: "/projects/bdw-pavilion.webp",
    confirmed: true,
  },
  {
    year: "2026",
    title: t("WP ALL x HD Expo 2026", "WP ALL x HD Expo 2026"),
    body: t(
      "ร่วมออกงานกับกรมส่งเสริมการค้าระหว่างประเทศ (DITP) นำสินค้าม่านที่ผลิตในไทยสู่เวทีนานาชาติ",
      "With the Department of International Trade Promotion (DITP), taking Thai-made curtain products to an international stage.",
    ),
    image: "/about/ditp-logo.webp",
    imageFit: "contain",
    confirmed: true,
  },
  {
    year: "2026",
    title: t("แคตตาล็อกชุดใหม่", "New catalogue collection"),
    body: t(
      "แคตตาล็อกเล่มจริงแยกตามหมวด มู่ลี่ไม้ ม่านม้วน ฉากกั้นห้อง ราง และรางโชว์",
      "Printed books for wood blinds, rollers, partitions, tracks and rods.",
    ),
    image: "/catalogues/wood-blinds.webp",
    confirmed: true,
  },
];

export type AboutFact = { label: Bi; value: Bi; confirmed: boolean };

export const ABOUT_COMPANY_EXTRA_FACTS: AboutFact[] = [
  {
    label: t("ปีที่ก่อตั้ง", "Founded"),
    value: t("พ.ศ. 2563 (ค.ศ. 2020)", "2020"),
    confirmed: true,
  },
  {
    label: t("เลขประจำตัวผู้เสียภาษี", "Tax ID"),
    value: t("0105564055496", "0105564055496"),
    confirmed: true,
  },
  {
    label: t("การรับประกัน", "Warranty"),
    value: t(
      "ตามประเภทสินค้า เช่น มอเตอร์รางม่าน รับประกัน 6 ปี",
      "Varies by product — e.g. 6 years on curtain track motors",
    ),
    confirmed: true,
  },
];

export const WPALL_TAGLINE: Bi = t(
  "บ้านของคุณ เรื่องของเรา...ตลอดชีวิต",
  "Your home, our lifelong care",
);
