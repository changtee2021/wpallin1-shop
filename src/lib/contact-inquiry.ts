import type { Locale } from "@/i18n/types";

export const CONTACT_TOPICS = [
  "project",
  "quote",
  "factory-visit",
  "dealer",
  "profile",
  "other",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const VISIT_SESSIONS = ["morning", "evening"] as const;
export type VisitSession = (typeof VISIT_SESSIONS)[number];

export const VISIT_SITE_IDS = ["blinds", "curtain", "partition"] as const;
export type VisitSiteId = (typeof VISIT_SITE_IDS)[number];

type Copy = { th: string; en: string };

function pick(copy: Copy, locale: Locale): string {
  return locale === "en" ? copy.en : copy.th;
}

const TOPIC_LABELS: Record<ContactTopic, Copy> = {
  project: {
    th: "โปรเจกต์องค์กร / ติดตั้งหลายสาขา",
    en: "Corporate / multi-site project",
  },
  quote: {
    th: "ขอใบเสนอราคา / ราคาส่ง",
    en: "Request a quote / wholesale price",
  },
  "factory-visit": {
    th: "นัดเยี่ยมชมโรงงาน",
    en: "Book a factory visit",
  },
  dealer: {
    th: "สนใจเป็นพาร์ทเนอร์ / ตัวแทน",
    en: "Become a dealer / partner",
  },
  profile: {
    th: "ขอข้อมูลบริษัท / Company Profile",
    en: "Company profile",
  },
  other: {
    th: "อื่นๆ",
    en: "Other",
  },
};

const TOPIC_HINTS: Record<ContactTopic, Copy> = {
  project: {
    th: "โรงแรม ออฟฟิศ คอนโด หรือหลายสาขา",
    en: "Hotels, offices, condos, or multi-branch",
  },
  quote: {
    th: "สินค้า ปริมาณ และช่วงเวลาที่ต้องการ",
    en: "Products, volume, and timing",
  },
  "factory-visit": {
    th: "เลือกวัน รอบ และสายผลิตที่อยากดู",
    en: "Pick a date, session, and production lines",
  },
  dealer: {
    th: "ร้านม่าน / ช่างติดตั้ง / ผู้รับเหมา",
    en: "Curtain shops, installers, contractors",
  },
  profile: {
    th: "แคตตาล็อก เอกสารบริษัท หรือข้อมูลโรงงาน",
    en: "Catalog, company docs, or factory info",
  },
  other: {
    th: "เรื่องธุรกิจอื่นที่อยากคุยกับทีมขาย",
    en: "Any other business inquiry",
  },
};

export const VISIT_SITES: Array<{
  id: VisitSiteId;
  no: string;
  title: Copy;
  desc: Copy;
}> = [
  {
    id: "blinds",
    no: "01",
    title: {
      th: "ม่านม้วน · มู่ลี่ · ม่านปรับแสง",
      en: "Roller, blinds & zebra",
    },
    desc: { th: "สายผลิตม่านม้วนและมู่ลี่", en: "Roller and blinds line" },
  },
  {
    id: "curtain",
    no: "02",
    title: { th: "ผ้าม่าน · ผ้าพิมพ์ลาย", en: "Curtains & print" },
    desc: { th: "ตัดเย็บและพิมพ์ผ้าม่าน", en: "Sewn and printed curtains" },
  },
  {
    id: "partition",
    no: "03",
    title: { th: "รางม่าน · ฉากกั้นห้อง", en: "Tracks & partitions" },
    desc: { th: "รางอลูมิเนียมและฉากกั้น", en: "Aluminum tracks and dividers" },
  },
];

export const VISIT_PURPOSES = [
  {
    id: "showroom",
    label: {
      th: "ดูตัวอย่างสินค้า / โชว์รูมโรงงาน",
      en: "See samples / factory showroom",
    },
  },
  {
    id: "production",
    label: { th: "ดูขั้นตอนการผลิต", en: "See the production process" },
  },
  {
    id: "client",
    label: {
      th: "พาลูกค้า / ผู้บริหารเยี่ยมชมก่อนสั่งผลิต",
      en: "Bring a client or executive before ordering",
    },
  },
  {
    id: "media",
    label: {
      th: "สื่อ / นักศึกษา / หน่วยงานขอเยี่ยมชม",
      en: "Media, students, or an organization visit",
    },
  },
  {
    id: "other",
    label: { th: "อื่นๆ", en: "Other" },
  },
] as const;

export type VisitPurposeId = (typeof VISIT_PURPOSES)[number]["id"];

export function isContactTopic(
  value: string | undefined,
): value is ContactTopic {
  return CONTACT_TOPICS.includes(value as ContactTopic);
}

export function topicLabel(topic: ContactTopic, locale: Locale): string {
  return pick(TOPIC_LABELS[topic], locale);
}

export function topicHint(topic: ContactTopic, locale: Locale): string {
  return pick(TOPIC_HINTS[topic], locale);
}

export function siteTitle(id: VisitSiteId, locale: Locale): string {
  const site = VISIT_SITES.find((item) => item.id === id);
  return site ? pick(site.title, locale) : id;
}

export function purposeLabel(id: string, locale: Locale): string {
  const purpose = VISIT_PURPOSES.find((item) => item.id === id);
  return purpose ? pick(purpose.label, locale) : id;
}

export function sessionLabel(session: VisitSession, locale: Locale): string {
  if (session === "morning") {
    return locale === "en"
      ? "Morning (09:00–12:00)"
      : "รอบเช้า (09:00–12:00 น.)";
  }
  return locale === "en"
    ? "Afternoon (13:00–16:00)"
    : "รอบเย็น (13:00–16:00 น.)";
}

export function todayInputValue(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatVisitSites(
  ids: string[] | null | undefined,
  locale: Locale,
): string {
  const selected = VISIT_SITES.filter((site) => ids?.includes(site.id));
  if (selected.length === 0) return "";
  if (selected.length === VISIT_SITES.length) {
    return locale === "en" ? "All 3 production lines" : "ไปทั้ง 3 สายผลิต";
  }
  return selected
    .map((site) => `${site.no} ${pick(site.title, locale)}`)
    .join(" · ");
}

export type BusinessContactPayload = {
  companyName: string;
  name: string;
  jobTitle?: string;
  email: string;
  phone: string;
  lineId?: string;
  taxId?: string;
  inquiryType: ContactTopic;
  message?: string;
  visitDate?: string;
  visitSession?: VisitSession;
  visitorCount?: number;
  visitSites?: VisitSiteId[];
  purpose?: string;
  productInterest?: string;
};

export function formatBusinessContact(
  input: BusinessContactPayload,
  locale: Locale = "th",
): { subject: string; message: string } {
  const topic = topicLabel(input.inquiryType, locale);
  const subject = `[${topic}] ${input.companyName || input.name}`.slice(0, 200);

  const lines = [
    `เรื่อง: ${topic}`,
    input.companyName ? `บริษัท: ${input.companyName}` : null,
    `ผู้ติดต่อ: ${input.name}`,
    input.jobTitle ? `ตำแหน่ง: ${input.jobTitle}` : null,
    `โทร: ${input.phone}`,
    input.email ? `อีเมล: ${input.email}` : null,
    input.lineId ? `LINE: ${input.lineId}` : null,
    input.taxId ? `เลขนิติบุคคล/บัตร: ${input.taxId}` : null,
  ];

  if (input.inquiryType === "factory-visit") {
    lines.push(
      "",
      "— นัดเยี่ยมชมโรงงาน —",
      input.visitDate ? `วันที่: ${input.visitDate}` : null,
      input.visitSession
        ? `รอบ: ${sessionLabel(input.visitSession, locale)}`
        : null,
      input.visitorCount != null
        ? `จำนวนผู้เข้าชม: ${input.visitorCount} คน`
        : null,
      input.visitSites?.length
        ? `สายผลิต: ${formatVisitSites(input.visitSites, locale)}`
        : null,
      input.purpose
        ? `วัตถุประสงค์: ${purposeLabel(input.purpose, locale)}`
        : null,
      input.productInterest ? `สินค้าที่สนใจ: ${input.productInterest}` : null,
    );
  } else if (input.productInterest) {
    lines.push(`สินค้าที่สนใจ: ${input.productInterest}`);
  }

  if (input.message?.trim()) {
    lines.push("", "รายละเอียด:", input.message.trim());
  }

  return {
    subject,
    message: lines.filter((line) => line != null).join("\n"),
  };
}
