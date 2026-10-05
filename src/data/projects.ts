import type { Bi } from "@/lib/bi";

/** Portfolio entries from the WP ALL 2026 presentation. Photos are slide crops for now. */

export type ProjectKind = "showcase" | "dealer";

export type Project = {
  slug: string;
  kind: ProjectKind;
  title: Bi;
  year?: string;
  location?: Bi;
  partner?: Bi;
  summary: Bi;
  story: Bi[];
  cover: string;
  gallery: string[];
  productSlugs: string[];
};

const t = (th: string, en: string): Bi => ({ th, en });

export const PROJECT_KIND_LABELS: Record<ProjectKind, Bi> = {
  showcase: t("งานโครงการ", "Showcase project"),
  dealer: t("ผลงานตัวแทนจำหน่าย", "Dealer installation"),
};

export const PROJECTS: Project[] = [
  {
    slug: "colors-of-buriram-2025",
    kind: "showcase",
    title: same("Colors of Buriram 2025"),
    year: "2025",
    location: t("บุรีรัมย์", "Buriram"),
    summary: t(
      "พิมพ์ลายลงผ้าโปร่งผืนใหญ่ ถอดแบบจากผ้าลายสิริราชพัสตราภรณ์",
      "Large-scale sheer fabric printed with the Siriraj Phastraporn pattern.",
    ),
    story: [
      t(
        "พิมพ์ลายลงผ้าโปร่งที่ถอดแบบมาจาก “ผ้าลายสิริราชพัสตราภรณ์” ผ้าลายพระราชทานล่าสุด ออกแบบโดย สมเด็จพระเจ้าลูกเธอ เจ้าฟ้าสิริวัณณวรี นารีรัตนราชกัญญา",
        "Sheer fabric printing inspired by the “Siriraj Phastraporn” pattern, the latest royal-granted textile pattern designed by HRH Princess Sirivannavari Nariratana Rajakanya.",
      ),
      t(
        "การวางลวดลายบนผ้าม่านผืนใหญ่ออกแบบโดย Director of Exhibition Design ของงาน Colors of Buriram 2025 คุณพักรม นิคมศิริ แห่งอุบลแล็บ และ Saratta Space",
        "The large-scale curtain layout was designed by the Director of Exhibition Design for Colors of Buriram 2025, Khun Pakrom Nikomsiri of Ubon Lab and Saratta Space.",
      ),
    ],
    cover: "/projects/buriram-detail.webp",
    gallery: ["/projects/buriram-curtain.webp", "/projects/buriram-visit.webp"],
    productSlugs: ["print-fabric-noren"],
  },
  {
    slug: "bangkok-design-week-2025",
    kind: "showcase",
    title: same("Bangkok Design Week 2025"),
    year: "2025",
    location: t("กรุงเทพฯ", "Bangkok"),
    summary: t(
      "“หย่อมป่า” Pavilion ป่าสีแดง",
      "“Yom Pa” — the red forest pavilion.",
    ),
    story: [
      t(
        "Bangkok Design Week 2025 หย่อมป่า กับ Pavilion ป่าสีแดง ที่สร้างพลังบวก คิดนอกกรอบด้วยการนำพื้นที่สีเขียวในโครงการมาพัฒนาให้เป็นหย่อมป่า เชื่อมโยงความหลากหลายของสิ่งมีชีวิตเล็กๆ และรักษาระบบนิเวศที่ยั่งยืน",
        "For Bangkok Design Week 2025, the “Yom Pa” red forest pavilion turned a green patch of the project into a pocket forest — a space that links small living things and supports a sustainable ecosystem.",
      ),
    ],
    cover: "/projects/bdw-pavilion.webp",
    gallery: ["/projects/bdw-inside.webp", "/projects/bdw-night.webp"],
    productSlugs: ["print-fabric-noren"],
  },
  {
    slug: "custom-fabric-from-poster",
    kind: "showcase",
    title: t("ผ้าม่านจากภาพโปสเตอร์", "Custom Fabric From Poster"),
    summary: t(
      "จากภาพโปสเตอร์กระดาษใบโปรดของลูกค้า สู่ผ้าม่านผืนเดียวในโลก",
      "From a customer's favourite paper poster to a one-of-a-kind curtain.",
    ),
    story: [
      t(
        "ลูกค้านำโปสเตอร์ใบโปรดมาให้เรา ทีมงานขยายภาพและพิมพ์ลงผ้าม่านเต็มผนัง ให้ภาพเดิมกลายเป็นงานตกแต่งที่ไม่มีใครเหมือน",
        "The customer brought us a favourite poster. We scaled the image and printed it across a full wall of curtains — a one-off piece built from a memory.",
      ),
    ],
    cover: "/projects/poster-fabric.webp",
    gallery: ["/projects/poster-original.webp"],
    productSlugs: ["print-fabric-noren"],
  },
  {
    slug: "merit-and-woranakorn",
    kind: "dealer",
    title: t(
      "ร้านเมริทผ้าม่าน และ บริษัท วรนครอีควิปเม้นท์ จำกัด",
      "Merit Curtain & Woranakorn Equipment Co., Ltd.",
    ),
    partner: t("ตัวแทนจำหน่าย", "Authorised dealers"),
    summary: t(
      "งานติดตั้งรางโค้งและม่านจากตัวแทนจำหน่ายของเรา",
      "Curved tracks and curtains installed by our dealers.",
    ),
    story: [
      t(
        "ตัวอย่างผลงานจากตัวแทนจำหน่าย ทั้งงานรางโค้งรอบเสา ม่านกั้นพื้นที่ในอาคารสาธารณะ และม่านโปร่งรอบศาลาริมทุ่ง",
        "Work by our dealers — curved track around columns, curtains dividing public spaces, and sheer drapes around an open-air pavilion.",
      ),
    ],
    cover: "/projects/woranakorn-canopy.webp",
    gallery: [
      "/projects/merit-drapes.webp",
      "/projects/merit-red.webp",
      "/projects/merit-curve.webp",
    ],
    productSlugs: ["curved-track", "standard-track"],
  },
  {
    slug: "charoensap-phitsanulok",
    kind: "dealer",
    title: t(
      "ร้านเจริญทรัพย์ผ้าม่าน (พิษณุโลก)",
      "Charoen Sap Curtain (Phitsanulok)",
    ),
    partner: t("ตัวแทนจำหน่าย", "Authorised dealer"),
    location: t("พิษณุโลก", "Phitsanulok"),
    summary: t(
      "ม่านเวทีพร้อมมอเตอร์ WP Nano Power",
      "Stage curtain driven by WP Nano Power.",
    ),
    story: [
      t(
        "ร้านเจริญทรัพย์ผ้าม่าน จ.พิษณุโลก ติดตั้งม่านเวทีขนาดใหญ่ ใช้มอเตอร์รุ่น WP Nano Power ทำงานเงียบและควบคุมผ่านมือถือได้",
        "Charoen Sap Curtain in Phitsanulok fitted a large stage curtain with the WP Nano Power motor — quiet, and controlled from a phone.",
      ),
    ],
    cover: "/projects/charoensap-stage.webp",
    gallery: [],
    productSlugs: ["wp-nano-power"],
  },
  {
    slug: "printed-blinds-retail",
    kind: "showcase",
    title: t("ม่านม้วนพิมพ์ลายสำหรับหน้าร้าน", "Printed Blinds for Retail"),
    summary: t(
      "ม่านม้วนพิมพ์ลายสำหรับหน้าร้าน งานแบรนด์ และงานศิลปะไทย",
      "Printed roller blinds for shopfronts, brand campaigns and Thai artwork.",
    ),
    story: [
      t(
        "พิมพ์ภาพแคมเปญและลายศิลปะลงม่านม้วนขนาดใหญ่ ใช้ได้ทั้งเป็นม่านบังแดดและเป็นสื่อหน้าร้านในชิ้นเดียว",
        "Campaign images and artwork printed onto large roller blinds — sun control and shopfront media in one piece.",
      ),
    ],
    cover: "/projects/printed-shopfront.webp",
    gallery: ["/projects/printed-thai-art.webp"],
    productSlugs: ["printed-blinds"],
  },
];

function same(value: string): Bi {
  return { th: value, en: value };
}

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}
