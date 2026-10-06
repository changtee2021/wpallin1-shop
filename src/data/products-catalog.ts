import type { Bi } from "@/lib/bi";

/**
 * Brand-site product catalogue, transcribed from "WP ALL 2026 (Presentation Sort Ver.)".
 * No prices and no certification claims on purpose — enquiries go to LINE OA.
 * Images are crops from the presentation slides until original photography arrives.
 */

export const PRODUCT_CATEGORY_IDS = [
  "blinds",
  "outdoor",
  "partitions",
  "tracks",
  "motorization",
  "rods",
  "custom-print",
] as const;
export type ProductCategoryId = (typeof PRODUCT_CATEGORY_IDS)[number];

export const PRODUCT_SUBCATEGORY_IDS = [
  "venetian",
  "roller",
  "vertical",
  "outdoor-roller",
  "zip",
  "skylight",
  "pvc-folding",
  "home-tracks",
  "project-tracks",
  "curtain-motors",
  "rods",
  "hardware",
  "print-fabric",
  "print-blinds",
] as const;
export type ProductSubcategoryId = (typeof PRODUCT_SUBCATEGORY_IDS)[number];

export const PRODUCT_ROOMS = [
  "living",
  "bedroom",
  "office",
  "kitchen-bath",
  "outdoor",
  "commercial",
  "healthcare",
] as const;
export type ProductRoom = (typeof PRODUCT_ROOMS)[number];

export const PRODUCT_CONTROLS = ["manual", "chain", "motorized"] as const;
export type ProductControl = (typeof PRODUCT_CONTROLS)[number];

export const PRODUCT_MATERIALS = [
  "wood",
  "aluminium",
  "fabric",
  "pvc",
  "metal",
] as const;
export type ProductMaterial = (typeof PRODUCT_MATERIALS)[number];

export type ProductCategory = {
  id: ProductCategoryId;
  index: string;
  name: Bi;
  description: Bi;
  image: string;
};

export type ProductSubcategory = {
  id: ProductSubcategoryId;
  category: ProductCategoryId;
  name: Bi;
};

export type ProductSeries = { name: Bi; description?: Bi };
/** Headline figure for the bento grid — only values already in the spec sheet. */
export type ProductStat = { value: string; label: Bi };
export type ProductStory = { image: string; title: Bi; body: Bi };
export type ProductVideo = {
  title: Bi;
  /** YouTube embed URL or an mp4 path under /public. */
  src: string;
  poster: string;
  kind: "youtube" | "mp4";
};
export type ProductDocumentType =
  "catalogue" | "certificate" | "test-report" | "install-guide";
/** Only list documents the company has the real file for — never a placeholder claim. */
export type ProductDocument = {
  title: Bi;
  type: ProductDocumentType;
  href: string;
  sizeLabel?: string;
  year?: number;
};
export type ProductSpec = { label: Bi; value: Bi };
export type ProductColorSet = {
  label: Bi;
  codes?: { code: string; name: Bi }[];
  note?: Bi;
};

export type CatalogProduct = {
  slug: string;
  category: ProductCategoryId;
  subcategory: ProductSubcategoryId;
  name: Bi;
  /** Secondary name shown under the title (English trade name or model code). */
  code: string;
  tagline: Bi;
  summary: Bi;
  image: string;
  gallery?: string[];
  highlights: Bi[];
  series?: ProductSeries[];
  specs?: ProductSpec[];
  colors?: ProductColorSet[];
  stats?: ProductStat[];
  story?: ProductStory[];
  videos?: ProductVideo[];
  documents?: ProductDocument[];
  /** Slug of the online flipbook under /catalogs/$slug. */
  catalogSlug?: string;
  rooms: ProductRoom[];
  controls: ProductControl[];
  materials: ProductMaterial[];
  featured?: boolean;
};

const t = (th: string, en: string): Bi => ({ th, en });
const same = (value: string): Bi => ({ th: value, en: value });

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: "blinds",
    index: "01",
    name: t("มู่ลี่และม่านภายใน", "Interior Blinds"),
    description: t(
      "มู่ลี่ไม้ มู่ลี่อลูมิเนียม ม่านม้วน และม่านปรับแสง ผลิตตามขนาดหน้างาน",
      "Wood and aluminium blinds, roller and vertical blinds — all made to measure.",
    ),
    image: "/products/wood-blinds.webp",
  },
  {
    id: "outdoor",
    index: "02",
    name: t("ระบบกันแดดภายนอก", "Outdoor Shading"),
    description: t(
      "ม่านม้วนภายนอก ซิปบลาย และสกายไลท์ สำหรับระเบียง เพอร์โกล่า และหลังคากระจก",
      "Exterior rollers, zip blinds and skylight systems for terraces, pergolas and glass roofs.",
    ),
    image: "/products/zip-blinds.webp",
  },
  {
    id: "partitions",
    index: "03",
    name: t("ฉากกั้นห้อง PVC", "PVC Folding Doors"),
    description: t(
      "ฉากกั้นห้องพับได้ 4 สไตล์ Standard, Japanese, USA และ URO สูงได้ถึง 3.60 เมตร",
      "Folding partitions in Standard, Japanese, USA and URO styles, up to 3.60 m high.",
    ),
    image: "/products/pvc-folding-door.webp",
  },
  {
    id: "tracks",
    index: "04",
    name: t("รางม่าน", "Curtain Tracks"),
    description: t(
      "รางเทปลอน รางตะขอ รางม่านพับ รางโค้งดัดมือ และรางโรงพยาบาล",
      "S-curve, hook, roman, hand-bent and hospital tracks.",
    ),
    image: "/products/s-curve-track.webp",
  },
  {
    id: "motorization",
    index: "05",
    name: t("ระบบมอเตอร์", "Motorization"),
    description: t(
      "มอเตอร์ม่านไร้แปรงถ่าน เสียงเงียบ ควบคุมด้วยรีโมท สวิตช์ หรือมือถือ",
      "Quiet brushless curtain motors, run by remote, wall switch or phone.",
    ),
    image: "/products/motorized-track.webp",
  },
  {
    id: "rods",
    index: "06",
    name: t("รางโชว์และอุปกรณ์", "Curtain Rods & Accessories"),
    description: t(
      "รางโชว์หลายสีและหลายผิว พร้อมหัวราง ขาจับ และอุปกรณ์ตกแต่ง",
      "Decorative rods in many finishes, with finials, brackets and hardware.",
    ),
    image: "/products/curtain-rod.webp",
  },
  {
    id: "custom-print",
    index: "07",
    name: t("งานพิมพ์ลายสั่งทำ", "Custom Print"),
    description: t(
      "พิมพ์ลายลงผ้า ม่านญี่ปุ่น และม่านม้วน จากไฟล์งานหรือภาพของลูกค้า",
      "Printed fabric, noren and roller blinds made from your artwork or photo.",
    ),
    image: "/products/print-fabric.webp",
  },
];

export const PRODUCT_SUBCATEGORIES: ProductSubcategory[] = [
  { id: "venetian", category: "blinds", name: t("มู่ลี่", "Venetian blinds") },
  { id: "roller", category: "blinds", name: t("ม่านม้วน", "Roller shades") },
  {
    id: "vertical",
    category: "blinds",
    name: t("ม่านปรับแสง", "Vertical blinds"),
  },
  {
    id: "outdoor-roller",
    category: "outdoor",
    name: t("ม่านม้วนภายนอก", "Outdoor rollers"),
  },
  { id: "zip", category: "outdoor", name: t("ซิปบลาย", "Zip blinds") },
  { id: "skylight", category: "outdoor", name: t("สกายไลท์", "Skylight") },
  {
    id: "pvc-folding",
    category: "partitions",
    name: t("ฉากกั้นห้อง PVC", "PVC folding doors"),
  },
  {
    id: "home-tracks",
    category: "tracks",
    name: t("รางม่านบ้าน", "Residential tracks"),
  },
  {
    id: "project-tracks",
    category: "tracks",
    name: t("รางงานโครงการ", "Project tracks"),
  },
  {
    id: "curtain-motors",
    category: "motorization",
    name: t("มอเตอร์ม่าน", "Curtain motors"),
  },
  { id: "rods", category: "rods", name: t("รางโชว์", "Curtain rods") },
  { id: "hardware", category: "rods", name: t("อุปกรณ์ม่าน", "Hardware") },
  {
    id: "print-fabric",
    category: "custom-print",
    name: t("ผ้าพิมพ์ลาย", "Printed fabric"),
  },
  {
    id: "print-blinds",
    category: "custom-print",
    name: t("ม่านพิมพ์ลาย", "Printed blinds"),
  },
];

export const PRODUCT_ROOM_LABELS: Record<ProductRoom, Bi> = {
  living: t("ห้องนั่งเล่น", "Living room"),
  bedroom: t("ห้องนอน", "Bedroom"),
  office: t("สำนักงาน", "Office"),
  "kitchen-bath": t("ครัวและห้องน้ำ", "Kitchen & bath"),
  outdoor: t("ภายนอกอาคาร", "Outdoor"),
  commercial: t("ร้านค้าและโครงการ", "Retail & projects"),
  healthcare: t("โรงพยาบาลและคลินิก", "Healthcare"),
};

export const PRODUCT_CONTROL_LABELS: Record<ProductControl, Bi> = {
  manual: t("มือดึง / มือหมุน", "Manual"),
  chain: t("ระบบโซ่", "Chain"),
  motorized: t("มอเตอร์ไฟฟ้า", "Motorized"),
};

export const PRODUCT_MATERIAL_LABELS: Record<ProductMaterial, Bi> = {
  wood: t("ไม้", "Wood"),
  aluminium: t("อลูมิเนียม", "Aluminium"),
  fabric: t("ผ้า", "Fabric"),
  pvc: t("PVC", "PVC"),
  metal: t("โลหะ", "Metal"),
};

const PVC_STANDARD_COLORS = [
  { code: "WP01", name: t("สีขาวเรียบ", "Plain white") },
  { code: "WP02", name: t("สีขาวลายไม้", "White woodgrain") },
  { code: "WP03", name: t("สีครีมลายไม้", "Cream woodgrain") },
  { code: "WP04", name: t("สีชาไทยลายไม้", "Thai tea woodgrain") },
  { code: "WP05", name: t("สีสักลายไม้", "Teak woodgrain") },
  { code: "WP06", name: t("สีเทาอ่อนลายไม้", "Light grey woodgrain") },
  { code: "WP07", name: t("สีเทาลายไม้", "Grey woodgrain") },
  { code: "WP08", name: t("สีโอ๊คลายไม้", "Oak woodgrain") },
];

const PVC_PREMIUM_COLORS = [
  { code: "WPD01", name: t("สีขาวลายไม้", "White woodgrain") },
  { code: "WPD02", name: t("สีครีมลายไม้", "Cream woodgrain") },
  { code: "WPD07", name: t("สีสักลายไม้", "Teak woodgrain") },
];

const MOTOR_CONTROLS: Bi[] = [
  t(
    "รีโมท 1, 2 และ 6 ช่อง (ถ่าน AAA x 2, IP40)",
    "Remote with 1, 2 or 6 channels (2 × AAA, IP40)",
  ),
  t("สวิตช์ติดผนัง 1 และ 2 ช่อง", "Wall switch, 1 or 2 channels"),
  t("ควบคุมผ่านมือถือ", "Mobile app control"),
];

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    slug: "wood-blinds",
    category: "blinds",
    subcategory: "venetian",
    stats: [
      { value: "50 mm", label: t("ความกว้างใบมู่ลี่", "Slat width") },
      { value: "48", label: t("สีให้เลือก", "Colours") },
      { value: "300 cm", label: t("กว้างสูงสุด", "Max width") },
      { value: "1:5.8", label: t("อัตราทดหัวเกียร์", "Clutch ratio") },
    ],
    story: [
      {
        image: "/products/wood-bedroom.webp",
        title: t(
          "วัสดุธรรมชาติ ดีไซน์ร่วมสมัย",
          "Natural material, modern form",
        ),
        body: t(
          "ใส่ใจตั้งแต่เฉดสี ลายไม้ ไปจนถึงสัดส่วนใบมู่ลี่ เลือกได้ทั้งไม้ Basswood แท้ที่ให้ผิวธรรมชาติ และ Fauxwood ที่ทนความชื้นสำหรับครัวและห้องน้ำ",
          "Tone, grain and slat proportion are all considered. Choose real basswood for a natural finish, or humidity-resistant fauxwood for kitchens and bathrooms.",
        ),
      },
    ],
    name: t("มู่ลี่ไม้", "Wooden Blinds"),
    code: "Wooden Venetian Blinds",
    tagline: t(
      "ไม่ใช่เพียงแค่บังแสง แต่คือองค์ประกอบของงานออกแบบ",
      "More than shade — part of the interior design.",
    ),
    summary: t(
      "มู่ลี่ไม้ที่ผสานเสน่ห์ของวัสดุธรรมชาติเข้ากับดีไซน์ร่วมสมัย คัดสรรไม้คุณภาพและใส่ใจรายละเอียดตั้งแต่เฉดสี ลายไม้ ไปจนถึงสัดส่วนใบมู่ลี่ ใช้ได้ทั้งบ้าน โรงแรม ร้านอาหาร และสำนักงาน",
      "Wooden blinds that pair natural material with a contemporary look. Selected timber and careful detailing — tone, grain and slat proportion — for homes, hotels, restaurants and offices.",
    ),
    image: "/products/wood-blinds.webp",
    gallery: ["/products/wood-bedroom.webp"],
    highlights: [
      t(
        "ใบมู่ลี่กว้าง 50 มม. เลือกไม้แท้หรือไม้คอมโพสิต",
        "50 mm slats in real basswood or faux wood",
      ),
      t(
        "รางบน 2 แบบ Modern (สอดใบบนราง) และ Classic (มีบังราง)",
        "Two headrail styles: Modern (slats in rail) and Classic (with valance)",
      ),
      t(
        "เทปบันไดลิง 50 มม. และเชือกบันไดลิงหลายสี",
        "50 mm ladder tape and ladder string in a range of colours",
      ),
      t("ระบบโซ่วนหรือมอเตอร์ไฟฟ้า", "Chain drive or motorized"),
    ],
    series: [
      {
        name: t("Basswood ไม้แท้", "Basswood (real wood)"),
        description: t(
          "ไม้เนื้ออ่อนน้ำหนักเบา เนื้อละเอียด สีครีมอ่อนถึงเหลืองนวล งานดูเป็นธรรมชาติ",
          "Light, fine-grained softwood in pale cream to warm yellow — a natural finish.",
        ),
      },
      {
        name: t("Fauxwood ไม้คอมโพสิต", "Fauxwood (composite)"),
        description: t(
          "วัสดุสังเคราะห์จากผงไม้และพลาสติก ทนความชื้นและความร้อนได้ดีกว่าไม้จริง เหมาะกับครัวและห้องน้ำ",
          "Wood powder and polymer composite that handles humidity and heat better than timber — suited to kitchens and bathrooms.",
        ),
      },
    ],
    specs: [
      { label: t("ความกว้างใบ", "Slat width"), value: same("50 mm") },
      {
        label: t("ความหนาใบ", "Slat thickness"),
        value: t(
          "Basswood 2.8 มม. / Fauxwood 3.0 มม.",
          "Basswood 2.8 mm / Fauxwood 3.0 mm",
        ),
      },
      {
        label: t("น้ำหนักต่อตร.ม.", "Weight per m²"),
        value: t(
          "Basswood 1.86 กก. / Fauxwood 2.19 กก.",
          "Basswood 1.86 kg / Fauxwood 2.19 kg",
        ),
      },
      { label: t("กว้างสูงสุด", "Max width"), value: same("300 cm") },
      {
        label: t("ขนาดสูงสุด", "Max size"),
        value: t(
          "Basswood 150×400 ซม. / Fauxwood 150×350 ซม.",
          "Basswood 150×400 cm / Fauxwood 150×350 cm",
        ),
      },
      {
        label: t("หัวเกียร์โซ่วน", "Chain clutch"),
        value: t("อัตราทด 1:5.8 รับน้ำหนัก 10 กก.", "Ratio 1:5.8, 10 kg load"),
      },
    ],
    colors: [
      { label: t("Fauxwood", "Fauxwood"), note: t("32 สี", "32 colours") },
      { label: t("Basswood", "Basswood"), note: t("16 สี", "16 colours") },
    ],
    rooms: ["living", "bedroom", "office", "kitchen-bath", "commercial"],
    controls: ["chain", "motorized"],
    materials: ["wood"],
    featured: true,
  },
  {
    slug: "aluminium-blinds",
    category: "blinds",
    subcategory: "venetian",
    stats: [
      { value: "25 / 50 mm", label: t("ความกว้างใบ", "Slat widths") },
      { value: "66", label: t("สีให้เลือก", "Colours") },
      { value: "0.7 kg", label: t("น้ำหนักต่อตร.ม.", "Weight per m²") },
      { value: "270 cm", label: t("กว้างสูงสุด", "Max width") },
    ],
    name: t("มู่ลี่อลูมิเนียม", "Aluminium Blinds"),
    code: "Aluminium Venetian Blinds",
    tagline: t(
      "บาง เบา ปรับแสงได้ละเอียด",
      "Slim, light and precise light control.",
    ),
    summary: t(
      "มู่ลี่อลูมิเนียมใบ 25 มม. และ 50 มม. รูร้อยเชือกเล็ก ใบหักมุมรูปตัว L ให้การปิดแสงที่สนิทขึ้น เหมาะกับสำนักงาน ห้องน้ำ และพื้นที่ที่ต้องการทำความสะอาดง่าย",
      "Aluminium blinds with 25 mm or 50 mm slats, small cord holes and an L-shaped slat profile for tighter closure. Easy to clean — ideal for offices and bathrooms.",
    ),
    image: "/products/aluminium-blinds.webp",
    highlights: [
      t("ใบ 25 มม. และ 50 มม.", "25 mm and 50 mm slats"),
      t("ซีรีส์ L Shape และ C Shape", "L Shape and C Shape series"),
      t("รองรับมอเตอร์พร้อมรีโมท", "Motorized option with remote"),
    ],
    series: [
      {
        name: same("L Shape Series"),
        description: t(
          "ใบหักมุมรูปตัว L รูร้อยเชือกเล็กนิดเดียว ปิดแสงได้แนบ",
          "L-angled slats with tiny cord holes for a tight close.",
        ),
      },
      {
        name: same("C Shape Series"),
        description: t(
          "ใบโค้งแบบดั้งเดิม ใช้งานทั่วไป",
          "Classic curved slat for everyday use.",
        ),
      },
    ],
    specs: [
      {
        label: t("หัวเกียร์โซ่วน", "Chain clutch"),
        value: t(
          "อัตราทด 1:4 รับน้ำหนักไม่เกิน 10 กก.",
          "Ratio 1:4, up to 10 kg",
        ),
      },
      {
        label: t("น้ำหนักเฉลี่ยต่อตร.ม.", "Average weight per m²"),
        value: t("0.7 กก.", "0.7 kg"),
      },
      {
        label: t("พื้นที่สูงสุด", "Max area"),
        value: t("14.29 ตร.ม.", "14.29 m²"),
      },
      {
        label: t("ขนาดสูงสุด", "Max size"),
        value: t("150×450 ซม.", "150×450 cm"),
      },
      { label: t("กว้างสูงสุด", "Max width"), value: same("270 cm") },
    ],
    colors: [
      { label: t("ใบ 25 มม.", "25 mm slat"), note: t("38 สี", "38 colours") },
      { label: t("ใบ 50 มม.", "50 mm slat"), note: t("28 สี", "28 colours") },
    ],
    rooms: ["office", "kitchen-bath", "bedroom", "commercial"],
    controls: ["chain", "motorized"],
    materials: ["aluminium"],
  },
  {
    slug: "roller-blinds",
    category: "blinds",
    subcategory: "roller",
    stats: [
      { value: "5", label: t("คอลเลกชันผ้า", "Fabric collections") },
      { value: "5", label: t("รูปแบบม่าน", "Blind types") },
      { value: "8 kg", label: t("หัวเกียร์รับน้ำหนัก", "Clutch load") },
      { value: "38 mm", label: t("มอเตอร์ในราง", "Headrail motor") },
    ],
    name: t("ม่านม้วน", "Roller Blinds"),
    code: "Roller Blinds",
    tagline: t(
      "เรียบ สะอาดตา เลือกผ้าได้ตามการใช้งาน",
      "Clean lines, with a fabric for every room.",
    ),
    summary: t(
      "ม่านม้วนพร้อมผ้าหลายคอลเลกชัน ตั้งแต่ผ้าทึบแสง ผ้ากรองแสง ไปจนถึงผ้าโปร่งแสงและผ้าทอธรรมชาติ มีทั้งม่านม้วนธรรมดา Zebra, Panel, Double Roll และ Roman Shade",
      "Roller blinds in fabric collections from blackout and sunscreen to translucent and natural woven, in standard, Zebra, Panel, Double Roll and Roman Shade types.",
    ),
    image: "/products/roller-blinds.webp",
    highlights: [
      t(
        "ผ้า Blackout, Fiberglass, Sunscreen (5% / 3% / 1%), Translucent, Nature Woven",
        "Blackout, Fiberglass, Sunscreen (5% / 3% / 1%), Translucent and Nature Woven fabrics",
      ),
      t(
        "เลือกรางข้างกันแสงและแบบขาจับได้",
        "Optional light-blocking side channels and bracket styles",
      ),
      t("มอเตอร์ 38 มม. แบบรางบน", "38 mm motor in the headrail"),
    ],
    series: [
      {
        name: same("Zebra Blinds"),
        description: t(
          "ผ้าสองชั้นสลับทึบและโปร่ง ปรับแสงได้โดยไม่ต้องม้วนขึ้น",
          "Alternating sheer and solid bands — adjust light without raising the blind.",
        ),
      },
      {
        name: same("Panel Blinds"),
        description: t(
          "แผงผ้าเลื่อนข้าง เหมาะกับหน้าต่างบานใหญ่และประตูกระจก",
          "Sliding fabric panels for wide windows and glass doors.",
        ),
      },
      {
        name: same("Double Roll Blinds"),
        description: t(
          "ม่านม้วนสองชั้นในชุดเดียว ใช้ผ้าโปร่งคู่กับผ้าทึบ",
          "Two rollers in one set — sheer and blackout together.",
        ),
      },
      {
        name: same("Roman Shade"),
        description: t(
          "ม่านพับเป็นชั้น ให้ความนุ่มนวลแบบผ้าม่าน",
          "Soft folded shade with a curtain-like feel.",
        ),
      },
    ],
    specs: [
      {
        label: t("หัวเกียร์", "Clutch"),
        value: t(
          "38 มม. อัตราทด 1:1.65 รับน้ำหนัก 8 กก.",
          "38 mm, ratio 1:1.65, 8 kg load",
        ),
      },
      {
        label: t("ระบบควบคุม", "Control"),
        value: t("โซ่ หรือมอเตอร์", "Chain or motor"),
      },
    ],
    rooms: ["living", "bedroom", "office", "commercial"],
    controls: ["chain", "motorized"],
    materials: ["fabric"],
    featured: true,
  },
  {
    slug: "vertical-blinds",
    category: "blinds",
    subcategory: "vertical",
    name: t("ม่านปรับแสง", "Vertical Blinds"),
    code: "Vertical Blinds",
    tagline: t(
      "สั่งตัดและออกแบบรูปทรงใบม่านได้ตามใจ",
      "Vanes cut and shaped to your design.",
    ),
    summary: t(
      "ม่านปรับแสงแนวตั้ง ตัดผ้าด้วย Ultra Sonic ขอบเรียบ ปิดแสงได้ดีกว่าการเย็บทั่วไป ใช้กับรางตรง รางตัดโค้ง และรางสโลป",
      "Vertical blinds with ultrasonic-cut vanes for clean edges and better light blocking than standard stitching. Works on straight, curved and sloped tracks.",
    ),
    image: "/products/vertical-blinds.webp",
    highlights: [
      t(
        "ผ้า Blackout, Fiberglass, Sunscreen 1% / 3% / 5% และ Translucent",
        "Blackout, Fiberglass, Sunscreen 1% / 3% / 5% and Translucent fabrics",
      ),
      t("รางตรง รางตัดโค้ง และรางสโลป", "Straight, curved and sloped tracks"),
      t(
        "ชุดอะไหล่ 2 เกรด Plastic Standard และ Stainless Premium",
        "Two part grades: Plastic Standard and Stainless Premium",
      ),
    ],
    specs: [
      {
        label: t("รางบน", "Headrail"),
        value: t("อลูมิเนียม", "Aluminium track"),
      },
      { label: t("การตัดผ้า", "Fabric cutting"), value: same("Ultra Sonic") },
      { label: t("ระบบควบคุม", "Control"), value: t("โซ่", "Chain") },
    ],
    rooms: ["living", "office", "commercial"],
    controls: ["chain"],
    materials: ["fabric", "aluminium"],
  },
  {
    slug: "outdoor-roller",
    category: "outdoor",
    subcategory: "outdoor-roller",
    name: t("ม่านม้วนภายนอก", "Outdoor Roller Blinds"),
    code: "Outdoor Roller Blinds",
    tagline: t(
      "บังแดดและฝนสำหรับระเบียงและพื้นที่นั่งเล่นภายนอก",
      "Sun and rain shade for terraces and outdoor living.",
    ),
    summary: t(
      "ม่านม้วนสำหรับติดตั้งภายนอกอาคาร ระบบมือหมุน และเปลี่ยนใส่มอเตอร์ได้ภายหลัง",
      "Roller blinds for exterior installation. Hand-crank operation, upgradeable to a motor later.",
    ),
    image: "/products/outdoor-roller.webp",
    highlights: [
      t("ระบบมือหมุน", "Hand-crank operation"),
      t("อัปเกรดเป็นมอเตอร์ได้", "Motor upgrade available"),
    ],
    rooms: ["outdoor", "commercial"],
    controls: ["manual", "motorized"],
    materials: ["fabric", "aluminium"],
  },
  {
    slug: "zip-blinds",
    category: "outdoor",
    subcategory: "zip",
    name: t("ม่านซิปบลาย", "Zip Blinds"),
    code: "Zip Blinds",
    tagline: t(
      "ผ้าล็อกในรางข้าง ตึงเรียบแม้มีลม",
      "Fabric locked into side channels — stays taut in wind.",
    ),
    summary: t(
      "ม่านม้วนภายนอกที่ขอบผ้าวิ่งในรางข้างตลอดแนว ระบบมอเตอร์ มีโปรไฟล์ 50 มม. 63 มม. และ 63 มม. สำหรับขนาดใหญ่พิเศษ",
      "Exterior roller blinds with fabric edges running in full-height side channels. Motorized, with 50 mm, 63 mm and extra-large 63 mm profiles.",
    ),
    image: "/products/zip-blinds.webp",
    highlights: [
      t("โปรไฟล์ 50 มม. และ 63 มม.", "50 mm and 63 mm profiles"),
      t(
        "รุ่น 63 มม. สำหรับหน้างานขนาดใหญ่พิเศษ",
        "63 mm option for extra-large openings",
      ),
      t("ระบบมอเตอร์", "Motorized"),
    ],
    rooms: ["outdoor", "commercial"],
    controls: ["motorized"],
    materials: ["fabric", "aluminium"],
    featured: true,
  },
  {
    slug: "skylight",
    category: "outdoor",
    subcategory: "skylight",
    name: t("ม่านม้วนสกายไลท์", "Skylight Blinds"),
    code: "Skylight Blinds",
    tagline: t(
      "กันแดดสำหรับหลังคากระจกและช่องแสง",
      "Shade for glass roofs and skylights.",
    ),
    summary: t(
      "ม่านม้วนสำหรับหลังคากระจก เพอร์โกล่า และช่องแสงด้านบน มี 3 ระบบ FSS, FTS และ FCS ทำงานด้วยมอเตอร์",
      "Motorized roller systems for glass roofs, pergolas and skylights, in three systems: FSS, FTS and FCS.",
    ),
    image: "/products/skylight.webp",
    highlights: [
      t("ระบบ FSS, FTS และ FCS", "FSS, FTS and FCS systems"),
      t("ระบบมอเตอร์", "Motorized"),
    ],
    rooms: ["outdoor", "commercial", "living"],
    controls: ["motorized"],
    materials: ["fabric", "aluminium"],
  },
  {
    slug: "pvc-folding-door",
    category: "partitions",
    subcategory: "pvc-folding",
    stats: [
      { value: "3.60 m", label: t("ความสูงสูงสุด", "Max height") },
      { value: "4", label: t("สไตล์ใบฉาก", "Panel styles") },
      { value: "11", label: t("สีลายไม้และสีเรียบ", "Colours") },
      {
        value: "6063",
        label: t("รางอะลูมิเนียมอัลลอย", "Aluminium alloy track"),
      },
    ],
    name: t("ฉากกั้นห้อง PVC", "PVC Folding Door"),
    code: "PVC Folding Door",
    tagline: t(
      "แบ่งพื้นที่ได้ทันที พับเก็บได้แนบสนิท",
      "Divide a room instantly, fold away flush.",
    ),
    summary: t(
      "ฉากกั้นห้องพับได้ โครงสร้าง PVC เกรด A บนรางอะลูมิเนียมอัลลอย 6063 ผิว Anodize เคลือบ Powder Coating ดัดโค้งได้ ปิดแน่นด้วยแม่เหล็กเทปเต็มความสูงใบฉาก",
      "Folding partitions in grade-A PVC on an anodised, powder-coated 6063 aluminium track that can be bent to curves. A full-height magnetic strip closes the door tight.",
    ),
    image: "/products/pvc-folding-door.webp",
    highlights: [
      t(
        "4 สไตล์ Standard, Japanese, USA และ URO",
        "Four styles: Standard, Japanese, USA and URO",
      ),
      t("ผลิตสูงได้สูงสุด 3.60 เมตร", "Made up to 3.60 m high"),
      t(
        "ลูกล้อยึดด้วยกาว ไม่มีรอยหมุดย้ำ",
        "Glued rollers — no visible rivets",
      ),
      t("เลือกตัวล็อกได้หลายแบบ", "Several lock options"),
      t(
        "ใช้ร่วมกับรางโค้งดัดมือและรางโรงพยาบาลได้",
        "Works with hand-bent and hospital tracks",
      ),
    ],
    series: [
      {
        name: t("Standard Style แบบทึบ", "Standard Style (solid)"),
        description: t(
          "ใบฉากทึบ เรียบ ใช้ได้ทุกห้อง",
          "Solid panels for any room.",
        ),
      },
      {
        name: t("Japanese Style แบบญี่ปุ่น", "Japanese Style"),
        description: t(
          "ใบฉากมีช่องแผ่นลาย 7 ลาย เมเปิ้ล ต้นไผ่ รวงผึ้ง ไม้เลื้อย ก้อนเมฆ ซากุระ ดาวกระจาย หรือแผ่นใส",
          "Panels with inserts in 7 patterns — maple, bamboo, honeycomb, vine, cloud, sakura, starburst — or clear.",
        ),
      },
      {
        name: t("USA Style", "USA Style"),
        description: t(
          "มี 2 แบบ แบบประกอบ และแบบเจาะ",
          "Available assembled or perforated.",
        ),
      },
      {
        name: t("URO Style แบบยูโร", "URO Style"),
        description: t(
          "ใบฉากช่องกระจกใสหรือกระจกขุ่น",
          "Panels with clear or frosted glass.",
        ),
      },
    ],
    specs: [
      {
        label: t("รางฉาก", "Track"),
        value: t(
          "อะลูมิเนียมอัลลอย 6063 กว้าง 26 มม. สูง 20 มม. หนา 1 มม.",
          "6063 aluminium alloy, 26 × 20 mm, 1 mm wall",
        ),
      },
      {
        label: t("ใบฉากหลัก", "Main panel"),
        value: t("กว้าง 100 มม. หนา 6 มม.", "100 mm wide, 6 mm thick"),
      },
      {
        label: t("ใบฉากเล็ก", "Small panel"),
        value: t("กว้าง 45 มม. หนา 6 มม.", "45 mm wide, 6 mm thick"),
      },
      {
        label: t("ใบมือจับ", "Handle panel"),
        value: t("กว้าง 50 มม. หนา 16 มม.", "50 mm wide, 16 mm thick"),
      },
      {
        label: t("เทปฉาก", "Hinge tape"),
        value: t("Soft PVC หนา 1.2 มม.", "Soft PVC, 1.2 mm"),
      },
      {
        label: t("ความสูงสูงสุด", "Max height"),
        value: t("3.60 ม.", "3.60 m"),
      },
    ],
    colors: [
      {
        label: t(
          "Standard / Japanese / USA (8 สี)",
          "Standard / Japanese / USA (8 colours)",
        ),
        codes: PVC_STANDARD_COLORS,
      },
      { label: t("USA / URO", "USA / URO"), codes: PVC_PREMIUM_COLORS },
    ],
    rooms: ["living", "bedroom", "office", "commercial", "healthcare"],
    controls: ["manual"],
    materials: ["pvc", "aluminium"],
    featured: true,
  },
  {
    slug: "s-curve-track",
    category: "tracks",
    subcategory: "home-tracks",
    name: t("รางเทปลอน", "S-Curve Track"),
    code: "S-Curve Track",
    tagline: t(
      "ม่านลอนเรียบเป็นจังหวะเท่ากันทั้งผืน",
      "Even, flowing waves across the whole curtain.",
    ),
    summary: t(
      "รางสำหรับม่านลอน (Wave) ใช้เทปกำหนดระยะลอนให้สม่ำเสมอ มี 2 ซีรีส์ L - Luxury และ S - Speed",
      "Track for wave curtains, with spacing tape that keeps every fold even. Two series: L – Luxury and S – Speed.",
    ),
    image: "/products/s-curve-track.webp",
    highlights: [
      t(
        "2 ซีรีส์ L - Luxury และ S - Speed",
        "Two series: L – Luxury and S – Speed",
      ),
      t("ใช้กับมอเตอร์ม่านลอนได้", "Works with wave-curtain motors"),
    ],
    series: [
      { name: same("L – Luxury Series") },
      { name: same("S – Speed Series") },
    ],
    rooms: ["living", "bedroom", "office", "commercial"],
    controls: ["manual", "motorized"],
    materials: ["aluminium"],
  },
  {
    slug: "standard-track",
    category: "tracks",
    subcategory: "home-tracks",
    name: t("รางม่านตะขอ", "Standard Track"),
    code: "Standard Track",
    tagline: t(
      "รางม่านจีบมาตรฐาน 4 ซีรีส์",
      "Pleated-curtain track in four series.",
    ),
    summary: t(
      "รางสำหรับม่านจีบแบบตะขอ เลือกได้ 4 ซีรีส์ Large, Strong, Lock และ Save",
      "Hook track for pleated curtains, in four series: Large, Strong, Lock and Save.",
    ),
    image: "/products/standard-track.webp",
    highlights: [
      t(
        "4 ซีรีส์ Large, Strong, Lock, Save",
        "Four series: Large, Strong, Lock, Save",
      ),
      t("ใช้กับม่านจีบ", "For pleated curtains"),
    ],
    series: [
      { name: same("Large Series") },
      { name: same("Strong Series") },
      { name: same("Lock Series") },
      { name: same("Save Series") },
    ],
    rooms: ["living", "bedroom", "office", "commercial"],
    controls: ["manual"],
    materials: ["aluminium"],
  },
  {
    slug: "roman-track",
    category: "tracks",
    subcategory: "home-tracks",
    name: t("รางม่านพับ", "Roman Blind Track"),
    code: "Roman Track",
    tagline: t("รางสำหรับม่านพับแบบโรมัน", "Track for roman shades."),
    summary: t(
      "รางม่านพับจากอลูมิเนียมเกรด 6063 T5 ชุดหัวเกียร์รับน้ำหนักได้ถึง 10 กก. มี 2 สี ขาว และดำ",
      "Roman shade track in 6063 T5 aluminium with a gear set rated to 10 kg, in white or black.",
    ),
    image: "/products/roman-track.webp",
    highlights: [
      t("อลูมิเนียมเกรด 6063 T5", "6063 T5 aluminium"),
      t("หัวเกียร์รับน้ำหนักได้ถึง 10 กก.", "Gear set rated to 10 kg"),
      t("สีขาว / ดำ", "White / black"),
    ],
    specs: [
      {
        label: t("วัสดุ", "Material"),
        value: t("อลูมิเนียม 6063 T5", "6063 T5 aluminium"),
      },
      {
        label: t("รับน้ำหนัก", "Load"),
        value: t("สูงสุด 10 กก.", "Up to 10 kg"),
      },
      { label: t("สี", "Colours"), value: t("ขาว / ดำ", "White / black") },
      { label: t("ขนาดขั้นต่ำ", "Minimum width"), value: t("90 ซม.", "90 cm") },
    ],
    rooms: ["living", "bedroom", "office"],
    controls: ["chain"],
    materials: ["aluminium"],
  },
  {
    slug: "hospital-track",
    category: "tracks",
    subcategory: "project-tracks",
    name: t("รางโรงพยาบาล", "Hospital Track"),
    code: "Hospital Curtain Track",
    tagline: t(
      "รางกั้นเตียงสำหรับโรงพยาบาลและคลินิก",
      "Cubicle track for hospitals and clinics.",
    ),
    summary: t(
      "รางม่านติดเพดานสำหรับกั้นเตียงผู้ป่วยและห้องตรวจ ดัดโค้งตามผังห้องได้ ใช้ร่วมกับฉากกั้นห้อง PVC ได้",
      "Ceiling-mounted track for patient bays and exam rooms. Bends to the room layout and pairs with PVC folding doors.",
    ),
    image: "/products/hospital-track.webp",
    highlights: [
      t(
        "ติดเพดาน ดัดโค้งตามผังห้อง",
        "Ceiling mounted, bent to the floor plan",
      ),
      t("ใช้กับฉากกั้นห้อง PVC ได้", "Compatible with PVC folding doors"),
    ],
    rooms: ["healthcare", "commercial"],
    controls: ["manual"],
    materials: ["aluminium"],
  },
  {
    slug: "curved-track",
    category: "tracks",
    subcategory: "project-tracks",
    name: t("รางโค้งดัดมือ", "Hand-bent Curved Track"),
    code: "Curved Curtain Track",
    tagline: t(
      "ดัดตามรูปทรงหน้างานจริง",
      "Bent by hand to the real shape on site.",
    ),
    summary: t(
      "รางม่านที่ดัดโค้งด้วยมือให้พอดีกับมุมห้อง หน้าต่าง Bay และพื้นที่ทรงกลม ใช้ได้ทั้งม่านทั่วไปและงานโครงการ",
      "Curtain track bent by hand to fit corners, bay windows and round spaces — for homes and project work alike.",
    ),
    image: "/products/curved-track.webp",
    gallery: ["/projects/woranakorn-canopy.webp", "/projects/merit-curve.webp"],
    highlights: [
      t("ดัดโค้งตามแบบหน้างาน", "Bent to your site drawing"),
      t(
        "ใช้ได้กับม่านและฉากกั้นห้อง PVC",
        "For curtains and PVC folding doors",
      ),
    ],
    rooms: ["living", "commercial", "healthcare", "outdoor"],
    controls: ["manual", "motorized"],
    materials: ["aluminium"],
  },
  {
    slug: "wp-nano-power",
    category: "motorization",
    subcategory: "curtain-motors",
    stats: [
      { value: "20 dB", label: t("เสียงรบกวนต่ำสุด", "As quiet as") },
      { value: "120 kg", label: t("รับน้ำหนักผ้า", "Curtain load") },
      { value: "6 m", label: t("รางตรงยาวสุด", "Straight track") },
      { value: "2 N·m", label: t("แรงบิด", "Torque") },
    ],
    story: [
      {
        image: "/projects/charoensap-stage.webp",
        title: t("เงียบ จนลืมว่ามีมอเตอร์", "So quiet you forget it's there"),
        body: t(
          "มอเตอร์ไร้แปรงถ่านขนาด 47 × 65 × 80 มม. ซ่อนหลังรางได้สวย แรงดึงเสถียร จำตำแหน่งหยุดอัตโนมัติ และสั่งงานได้ทั้งรีโมท สวิตช์ติดผนัง และมือถือ",
          "A 47 × 65 × 80 mm brushless motor that hides behind the track, with steady pull, automatic memory trip, and remote, wall-switch or phone control.",
        ),
      },
    ],
    name: t("รางมอเตอร์ WP Nano Power", "WP Nano Power Motor"),
    code: "Brushless curtain motor",
    tagline: t(
      "เงียบระดับห้องสมุด ขนาดเล็กพิเศษ",
      "Library-quiet and extra compact.",
    ),
    summary: t(
      "มอเตอร์ม่านไร้แปรงถ่าน ขนาดเล็กพิเศษซ่อนหลังรางได้สวย เสียงรบกวนต่ำสุด 20 dB รับน้ำหนักผ้าได้ถึง 120 กก. บนรางตรงยาว 6 เมตร ใช้ได้ทั้งม่านจีบและม่านลอน",
      "Brushless curtain motor small enough to hide behind the track. As low as 20 dB, carrying up to 120 kg on a 6 m straight track, for pleated and wave curtains.",
    ),
    image: "/products/nano-power.webp",
    gallery: [
      "/products/motorized-track.webp",
      "/projects/charoensap-stage.webp",
    ],
    highlights: [
      t(
        "มอเตอร์ไร้แปรงถ่าน แรงดึงเสถียร อายุการใช้งานยาว",
        "Brushless motor — steady pull and long service life",
      ),
      t("เสียงรบกวนต่ำสุด 20 dB", "As low as 20 dB"),
      t(
        "รับน้ำหนักถึง 120 กก. บนรางตรง 6 ม.",
        "Up to 120 kg on a 6 m straight track",
      ),
      t("จำตำแหน่งหยุดอัตโนมัติ", "Automatic memory trip"),
      ...MOTOR_CONTROLS,
    ],
    specs: [
      { label: same("Torque"), value: same("2 N·m") },
      { label: t("กำลังไฟ", "Power"), value: same("40 W") },
      { label: t("ความเร็วรอบ", "Rated speed"), value: same("88 rpm") },
      { label: t("ขนาดมอเตอร์", "Motor size"), value: same("47 × 65 × 80 mm") },
      { label: t("แรงดันไฟ", "Input voltage"), value: same("AC 100–240 V") },
      { label: t("น้ำหนัก", "Weight"), value: t("0.26 กก.", "0.26 kg") },
    ],
    rooms: ["living", "bedroom", "office", "commercial"],
    controls: ["motorized"],
    materials: ["aluminium"],
    featured: true,
  },
  {
    slug: "wp-n23",
    category: "motorization",
    subcategory: "curtain-motors",
    stats: [
      { value: "2", label: t("มอเตอร์สำหรับม่านคู่", "Motors, one per layer") },
      { value: "20 dB", label: t("เสียงรบกวนต่ำสุด", "As quiet as") },
      { value: "60 kg", label: t("รับน้ำหนักผ้า", "Curtain load") },
      { value: "6 m", label: t("รางตรงยาวสุด", "Straight track") },
    ],
    name: t("รางมอเตอร์ WP N23", "WP N23 Smart Curtain System"),
    code: "Dual-layer curtain motor",
    tagline: t(
      "มอเตอร์ม่าน 2 ชั้น ปลั๊กพร้อมใช้",
      "Two-layer curtain motor, plug-and-play.",
    ),
    summary: t(
      "ระบบมอเตอร์ม่านคู่ มีมอเตอร์หลักและมอเตอร์รองสำหรับม่านสองชั้น หัวปลั๊กพร้อมใช้งาน เสียงรบกวนต่ำสุด 20 dB รับน้ำหนักได้ถึง 60 กก. บนรางตรง 6 เมตร",
      "Dual curtain system with a main and secondary motor for two-layer curtains. Plug-in ready, as low as 20 dB, carrying up to 60 kg on a 6 m straight track.",
    ),
    image: "/products/n23.webp",
    gallery: ["/products/motorized-track.webp"],
    highlights: [
      t(
        "มอเตอร์หลัก + มอเตอร์รอง สำหรับม่านคู่",
        "Main + secondary motor for double curtains",
      ),
      t("หัวปลั๊กพร้อมใช้งาน", "Plug-in ready"),
      t("เสียงรบกวนต่ำสุด 20 dB", "As low as 20 dB"),
      t(
        "รับน้ำหนักถึง 60 กก. บนรางตรง 6 ม.",
        "Up to 60 kg on a 6 m straight track",
      ),
      ...MOTOR_CONTROLS,
    ],
    specs: [
      { label: same("Torque"), value: same("1.2 N·m") },
      { label: t("กำลังไฟ", "Power"), value: same("36 W") },
      { label: t("ความเร็วรอบ", "Rated speed"), value: same("90 rpm") },
      { label: t("ความยาวมอเตอร์", "Motor length"), value: same("193 mm") },
      { label: t("แรงดันไฟ", "Input voltage"), value: same("AC 100–240 V") },
      {
        label: t("น้ำหนัก", "Weight"),
        value: t(
          "0.5 กก. (หลัก) / 0.4 กก. (รอง)",
          "0.5 kg (main) / 0.4 kg (secondary)",
        ),
      },
    ],
    rooms: ["living", "bedroom", "office"],
    controls: ["motorized"],
    materials: ["aluminium"],
  },
  {
    slug: "curtain-rod",
    category: "rods",
    subcategory: "rods",
    name: t("รางโชว์", "Curtain Rod"),
    code: "Curtain Rod",
    tagline: t(
      "รางที่เป็นส่วนหนึ่งของการตกแต่ง",
      "A rod that finishes the room.",
    ),
    summary: t(
      "รางโชว์ WP ALL มีหลายผิวและหลายสี ทั้งขาว ดำ ลายไม้ โครเมียม และทอง เข้ากับหัวรางและขาจับหลายแบบ",
      "WP ALL decorative rods come in white, black, woodgrain, chrome and gold, matched with a range of finials and brackets.",
    ),
    image: "/products/curtain-rod.webp",
    gallery: ["/products/curtain-rod-colors.webp", "/brand/factory-3.webp"],
    highlights: [
      t("หลายสีและหลายผิว", "Many colours and finishes"),
      t("ตัดตามขนาดที่สั่ง", "Cut to the size you order"),
      t("เข้าชุดกับหัวรางและขาจับ", "Matching finials and brackets"),
    ],
    rooms: ["living", "bedroom", "commercial"],
    controls: ["manual"],
    materials: ["metal", "wood"],
  },
  {
    slug: "accessories",
    category: "rods",
    subcategory: "hardware",
    name: t("อุปกรณ์ม่าน", "Accessories"),
    code: "Curtain Accessories",
    tagline: t(
      "รายละเอียดเล็กๆ ที่ทำให้งานเสร็จสมบูรณ์",
      "The small parts that complete the job.",
    ),
    summary: t(
      "หัวราง ขาจับ และอุปกรณ์ประกอบรางโชว์และรางม่าน สำหรับร้านม่านและงานติดตั้ง",
      "Finials, brackets and fittings for curtain rods and tracks — stocked for curtain shops and installers.",
    ),
    image: "/products/accessories.webp",
    highlights: [
      t("หัวรางหลายแบบ", "Range of finials"),
      t("ขาจับและอุปกรณ์ประกอบ", "Brackets and fittings"),
    ],
    rooms: ["living", "bedroom", "commercial"],
    controls: ["manual"],
    materials: ["metal"],
  },
  {
    slug: "print-fabric-noren",
    category: "custom-print",
    subcategory: "print-fabric",
    name: t("ผ้าพิมพ์ / ม่านญี่ปุ่น", "Print Fabric / Noren"),
    code: "Print Fabric & Noren",
    tagline: t(
      "จากไฟล์งานของคุณ สู่ผ้าผืนจริง",
      "From your artwork to real fabric.",
    ),
    summary: t(
      "พิมพ์ลายลงผ้าด้วยเครื่อง HP Stitch S-Series รุ่น S500 ทำม่านญี่ปุ่น (โนเร็น) ป้ายผ้าหน้าร้าน และผ้าม่านลายเฉพาะ จากภาพหรือไฟล์ของลูกค้า",
      "Fabric printed on an HP Stitch S-Series S500 — noren, shopfront fabric and one-off curtains from your photo or file.",
    ),
    image: "/products/print-fabric.webp",
    gallery: ["/products/hp-printer.webp", "/projects/poster-fabric.webp"],
    highlights: [
      t("เครื่องพิมพ์ HP Stitch S500", "HP Stitch S500 printer"),
      t(
        "ม่านญี่ปุ่น ป้ายผ้า และผ้าม่านลายเฉพาะ",
        "Noren, banners and bespoke curtains",
      ),
      t("พิมพ์จากภาพหรือไฟล์ของลูกค้า", "Printed from your own image or file"),
    ],
    rooms: ["commercial", "living", "bedroom"],
    controls: ["manual"],
    materials: ["fabric"],
  },
  {
    slug: "printed-blinds",
    category: "custom-print",
    subcategory: "print-blinds",
    name: t("มู่ลี่และม่านม้วนพิมพ์ลาย", "Printed Blinds"),
    code: "Printed Roller Blinds",
    tagline: t(
      "หน้าต่างที่เล่าเรื่องแบรนด์ของคุณ",
      "Windows that tell your brand story.",
    ),
    summary: t(
      "พิมพ์ลายลงม่านม้วนและมู่ลี่ด้วยเครื่อง UV Print Roll to Roll i3200 สำหรับหน้าร้าน งานแบรนด์ และงานศิลปะบนหน้าต่าง",
      "Roller blinds and blinds printed on a UV roll-to-roll i3200 — for shopfronts, brand work and window artwork.",
    ),
    image: "/products/printed-blinds.webp",
    gallery: [
      "/projects/printed-shopfront.webp",
      "/projects/printed-thai-art.webp",
    ],
    highlights: [
      t("เครื่องพิมพ์ UV Roll to Roll i3200", "UV roll-to-roll i3200 printer"),
      t("งานหน้าร้านและงานแบรนด์", "Shopfronts and brand work"),
      t("ลายศิลปะตามสั่ง", "Custom artwork"),
    ],
    rooms: ["commercial", "office", "living"],
    controls: ["chain", "motorized"],
    materials: ["fabric"],
    featured: true,
  },
];

export function getCatalogProduct(slug: string): CatalogProduct | undefined {
  return CATALOG_PRODUCTS.find((product) => product.slug === slug);
}

export function getProductCategory(id: ProductCategoryId): ProductCategory {
  return (
    PRODUCT_CATEGORIES.find((category) => category.id === id) ??
    PRODUCT_CATEGORIES[0]
  );
}

export function productsInCategory(id: ProductCategoryId): CatalogProduct[] {
  return CATALOG_PRODUCTS.filter((product) => product.category === id);
}

export function subcategoriesOf(id: ProductCategoryId): ProductSubcategory[] {
  return PRODUCT_SUBCATEGORIES.filter((sub) => sub.category === id);
}

export function getProductSubcategory(
  id: ProductSubcategoryId,
): ProductSubcategory {
  return (
    PRODUCT_SUBCATEGORIES.find((sub) => sub.id === id) ??
    PRODUCT_SUBCATEGORIES[0]
  );
}

export const FEATURED_PRODUCTS = CATALOG_PRODUCTS.filter(
  (product) => product.featured,
);
