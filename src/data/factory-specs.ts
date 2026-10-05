export type FactorySpecRow = {
  label: string;
  value: string;
};

export type FactoryCollection = {
  id: string;
  name: string;
  sku?: string;
  match?: RegExp;
  rows: FactorySpecRow[];
};

export type FactoryCategorySpecs = {
  categorySlug: string;
  title: string;
  intro: string;
  notes: string[];
  collections: FactoryCollection[];
};

const rollerCert = [
  { label: "กันแบคทีเรีย", value: "Anti-bacteria" },
  { label: "กันเชื้อรา", value: "Anti-fungal" },
];

export const FACTORY_SPECS: FactoryCategorySpecs[] = [
  {
    categorySlug: "roller-blinds",
    title: "สเปคม่านม้วนโรงงาน",
    intro:
      "ผ้าม่านม้วนผลิตเอง หน้ากว้างมาตรฐาน 300 ซม. — สั่งขั้นต่ำ 1.5 ตร.หลา ผลิตประมาณ 3–4 วัน",
    notes: [
      "อุปกรณ์บังรางมีสีขาว / สีดำ (แกน 44 มม. บังรางเรียบมีแค่สีดำ)",
      "รางไกด์ข้างมีรุ่น S และรุ่น L",
      "รับทำรางเอียง (Slope) และพิมพ์ลาย UV ตามแบบ",
    ],
    collections: [
      {
        id: "sunscreen-1",
        name: "Sunscreen 1%",
        sku: "WPR 1001-07",
        match: /sunscreen\s*1|1%\s*sunscreen/i,
        rows: [
          { label: "ส่วนผสม", value: "22% Polyester / 78% PVC" },
          { label: "น้ำหนักผ้า", value: "700 g/m² ±5%" },
          { label: "กันยูวี", value: "99%" },
          { label: "หน้ากว้าง", value: "300 ซม." },
          { label: "ความหนา", value: "0.95 มม. ±5%" },
          { label: "ช่องแสง (Openness)", value: "1%" },
          { label: "ความคงทนต่อแสง", value: "ISO 105 B02 Grade 8" },
          ...rollerCert,
        ],
      },
      {
        id: "sunscreen-3",
        name: "Sunscreen 3%",
        sku: "WPR 3001-16",
        match: /sunscreen\s*3|3%\s*sunscreen/i,
        rows: [
          { label: "ส่วนผสม", value: "30% Polyester / 70% PVC" },
          { label: "น้ำหนักผ้า", value: "360 g/m² ±5%" },
          { label: "กันยูวี", value: "97%" },
          { label: "หน้ากว้าง", value: "300 ซม." },
          { label: "ความหนา", value: "0.50–0.70 มม. ±5%" },
          { label: "ช่องแสง (Openness)", value: "3%" },
          { label: "ความคงทนต่อแสง", value: "ISO 105 B02 Grade 8" },
          ...rollerCert,
        ],
      },
      {
        id: "sunscreen-5",
        name: "Sunscreen 5%",
        sku: "WPR 5001-09",
        match: /sunscreen\s*5|5%\s*sunscreen/i,
        rows: [
          { label: "ส่วนผสม", value: "30% Polyester / 70% PVC" },
          { label: "น้ำหนักผ้า", value: "360 g/m² ±5%" },
          { label: "กันยูวี", value: "95%" },
          { label: "หน้ากว้าง", value: "300 ซม." },
          { label: "ความหนา", value: "0.50–0.70 มม. ±5%" },
          { label: "ช่องแสง (Openness)", value: "5%" },
          { label: "ความคงทนต่อแสง", value: "ISO 105 B02 Grade 8" },
          ...rollerCert,
        ],
      },
      {
        id: "blackout-fg",
        name: "Blackout Fiberglass",
        sku: "WPRB 1001-10",
        match: /fiberglass|ไฟเบอร์กลาส/i,
        rows: [
          { label: "ส่วนผสม", value: "40% Fiberglass / 60% PVC" },
          { label: "น้ำหนักผ้า", value: "530 g/m² ±5%" },
          { label: "กันยูวี", value: "99%" },
          { label: "หน้ากว้าง", value: "250 และ 300 ซม." },
          { label: "ความหนา", value: "0.45 มม. ±5%" },
          { label: "ช่องแสง (Openness)", value: "0%" },
          { label: "กันลามไฟ", value: "NFPA 701-2004 · Class 5" },
          ...rollerCert,
        ],
      },
      {
        id: "blackout",
        name: "Blackout 100%",
        sku: "WPRB 2001-12",
        match: /blackout|ทึบ|กันแสง/i,
        rows: [
          { label: "ส่วนผสม", value: "100% Polyester" },
          { label: "น้ำหนักผ้า", value: "340 g/m² ±5%" },
          { label: "กันยูวี", value: "99%" },
          { label: "หน้ากว้าง", value: "300 ซม." },
          { label: "ความหนา", value: "0.35 มม. ±5%" },
          { label: "ช่องแสง (Openness)", value: "0%" },
          { label: "กันลามไฟ", value: "NFPA 701-2004 · Class 4.5" },
          ...rollerCert,
        ],
      },
      {
        id: "dimout",
        name: "Dim Out",
        sku: "WPRD 1001-06",
        match: /dim\s*out|ดิม/i,
        rows: [
          { label: "ส่วนผสม", value: "100% Polyester" },
          { label: "น้ำหนักผ้า", value: "100 g/m² ±5%" },
          { label: "กันยูวี", value: "30%" },
          { label: "หน้ากว้าง", value: "230–300 ซม." },
          { label: "ความหนา", value: "0.25 มม. ±5%" },
          { label: "ช่องแสง (Openness)", value: "70%" },
          { label: "ความคงทนต่อแสง", value: "Class 4.5" },
          ...rollerCert,
        ],
      },
      {
        id: "zebra",
        name: "Magic Screen (Zebra)",
        sku: "WPRZ 1001-07",
        match: /zebra|magic\s*screen|ม่านปรับแสง/i,
        rows: [
          { label: "ส่วนผสม", value: "100% Polyester" },
          { label: "น้ำหนักผ้า", value: "170 g/m² ±5%" },
          { label: "กันยูวี", value: "30–70%" },
          { label: "หน้ากว้าง", value: "315 ซม." },
          { label: "ความหนา", value: "0.10–0.30 มม. ±5%" },
          { label: "ช่องแสง (Openness)", value: "30–70%" },
          { label: "ความคงทนต่อแสง", value: "Class 4.5" },
          ...rollerCert,
        ],
      },
    ],
  },
  {
    categorySlug: "wood-blinds",
    title: "สเปคมู่ลี่ไม้โรงงาน",
    intro: "มู่ลี่ไม้ใบกว้าง 50 มม. สั่งขั้นต่ำ 1.5 ตร.หลา ผลิตประมาณ 3–5 วัน",
    notes: ["มีทั้งไม้ธรรมชาติ (Basswood) และไม้เทียมที่ทนความชื้น (Fauxwood)"],
    collections: [
      {
        id: "basswood",
        name: "Basswood — ไม้ธรรมชาติ",
        sku: "WPB",
        rows: [
          { label: "ชนิดไม้", value: "Basswood (ไม้ธรรมชาติ)" },
          { label: "ขนาดใบ", value: "50 มม." },
          { label: "หน่วยสั่ง", value: "ตร.หลา" },
          { label: "ขั้นต่ำ", value: "1.5 ตร.หลา" },
        ],
      },
      {
        id: "fauxwood",
        name: "Fauxwood — ไม้เทียม",
        sku: "WPF",
        rows: [
          { label: "ชนิดไม้", value: "Fauxwood (ใช้ในที่ชื้นได้)" },
          { label: "ขนาดใบ", value: "50 มม." },
          { label: "หน่วยสั่ง", value: "ตร.หลา" },
          { label: "ขั้นต่ำ", value: "1.5 ตร.หลา" },
        ],
      },
    ],
  },
  {
    categorySlug: "aluminum-blinds",
    title: "สเปคมู่ลี่อลูมิเนียมโรงงาน",
    intro:
      "ใบอลูมิเนียมหนา 0.21 มม. ระบบโซ่วน คลัตช์ 1:4 — กว้างขั้นต่ำที่ผลิตได้ 35 ซม.",
    notes: [
      "สั่งขั้นต่ำ 1.5 ตร.หลา ผลิตประมาณ 3–5 วัน",
      "คลัตช์รับน้ำหนักสูงสุด 10 กก. อายุการใช้งานประมาณ 10,000 ครั้ง",
    ],
    collections: [
      {
        id: "l25",
        name: "L Shape 25 มม.",
        rows: [
          { label: "วัสดุ", value: "อลูมิเนียม" },
          { label: "สี", value: "38 สี" },
          { label: "ความหนา", value: "0.21 มม. ±0.1%" },
          { label: "ขนาดสูงสุด", value: "150 × 450 ซม." },
          { label: "กว้างสูงสุด", value: "270 ซม." },
          { label: "น้ำหนักเฉลี่ย", value: "0.7 กก./ตร.ม." },
          { label: "รางบน", value: "3.5 × 4.0 ซม. หนา 1 มม." },
          { label: "รางล่าง", value: "2.5 × 1.2 ซม. หนา 1 มม." },
          { label: "ระบบดึง", value: "โซ่วน · Drive ratio 1:4" },
        ],
      },
      {
        id: "l50",
        name: "L Shape 50 มม.",
        rows: [
          { label: "วัสดุ", value: "อลูมิเนียม" },
          { label: "สี", value: "28 สี" },
          { label: "ความหนา", value: "0.21 มม. ±0.1%" },
          { label: "กว้างสูงสุด", value: "270 ซม." },
        ],
      },
      {
        id: "c50",
        name: "C Shape 50 มม.",
        rows: [
          { label: "วัสดุ", value: "อลูมิเนียม" },
          { label: "สี", value: "28 สี" },
          { label: "ความหนา", value: "0.21 มม. ±0.1%" },
          { label: "กว้างสูงสุด", value: "270 ซม." },
        ],
      },
    ],
  },
  {
    categorySlug: "pvc-folding-doors",
    title: "สเปคฉากกั้นห้อง PVC",
    intro:
      "ฉากพับ PVC เกรด A รางอะลูมิเนียมอัลลอย 6063 สูงสุด 3.60 ม. — มีรุ่นทึบและเจาะกระจก",
    notes: [
      "สีโครง WPD01–08 (ขาวลายไม้ ครีม โอ๊ค เทา ขาวเรียบ ชาไทย สัก เทาอ่อน)",
      "ลายกระจก S01–S07 และใส (Clear)",
      "มาตรฐาน ISO 9001:2015 และ มอก. เคลือบ UV กันลามไฟ ทนแอลกอฮอล์ 95%",
    ],
    collections: [
      {
        id: "pd-100",
        name: "WP-PD 100 มม.",
        rows: [
          { label: "ใบฉากหลัก", value: "กว้าง 100 มม. × หนา 6 มม." },
          { label: "ใบฉากเล็ก", value: "กว้าง 45 มม. × หนา 6 มม." },
          { label: "ใบมือจับ", value: "26 × 20 มม. หนา 1 มม. ร่อง 9 มม." },
          { label: "เสา U", value: "50 × 16 มม." },
          { label: "รางฉาก", value: "20 × 20 มม. หนา 1.2 มม." },
          { label: "สูงสุด", value: "3.60 ม." },
          { label: "ผิวราง", value: "Anodize + Powder coating" },
          { label: "ปิดสนิท", value: "แถบแม่เหล็กตลอดความสูง" },
        ],
      },
      {
        id: "pd-85",
        name: "WP-PD 85 มม.",
        rows: [
          { label: "ใบฉากหลัก", value: "กว้าง 85 มม. × หนา 6 มม." },
          { label: "ใบฉากเล็ก", value: "กว้าง 45 มม. × หนา 6 มม." },
          { label: "สูงสุด", value: "3.60 ม." },
          { label: "วัสดุใบ", value: "PVC เกรด A + เทป Soft PVC" },
          { label: "ลูกล้อ", value: "ยึด Super Glue ไม่โชว์หมุดย้ำ" },
        ],
      },
    ],
  },
  {
    categorySlug: "outdoor-curtains",
    title: "สเปคม่านม้วนภายนอก",
    intro:
      "ผ้า+อุปกรณ์สำหรับงานนอกบ้าน — สั่งขั้นต่ำ 10 ตร.หลา / ชุด ไม่รวมมอเตอร์",
    notes: ["รองรับผ้า Sunscreen 1% / 3% / 5% และ Blackout Fiberglass"],
    collections: [
      {
        id: "outdoor-roller",
        name: "Outdoor Roller",
        rows: [
          { label: "ขั้นต่ำ", value: "10 ตร.หลา / ชุด" },
          {
            label: "ผ้าที่ใช้ได้",
            value: "Sunscreen 1–5% · Blackout Fiberglass",
          },
          { label: "มอเตอร์", value: "สั่งเพิ่มแยกต่างหาก" },
        ],
      },
    ],
  },
  {
    categorySlug: "zip-blinds",
    title: "สเปคม่านซิป (Zip Blinds)",
    intro:
      "ม่านม้วนซิป ผ้า+อุปกรณ์ — สั่งขั้นต่ำ 10 ตร.หลา / ชุด ไม่รวมมอเตอร์",
    notes: ["รองรับผ้า Sunscreen 1% / 3% / 5% และ Blackout Fiberglass"],
    collections: [
      {
        id: "zip",
        name: "Zip Blinds",
        rows: [
          { label: "ขั้นต่ำ", value: "10 ตร.หลา / ชุด" },
          {
            label: "ผ้าที่ใช้ได้",
            value: "Sunscreen 1–5% · Blackout Fiberglass",
          },
          { label: "มอเตอร์", value: "สั่งเพิ่มแยกต่างหาก" },
        ],
      },
    ],
  },
  {
    categorySlug: "skylight-fss",
    title: "สเปค Skylight FSS",
    intro:
      "ม่านม้วนสกายไลท์ ผ้า+อุปกรณ์ — สั่งขั้นต่ำ 8 ตร.หลา / ชุด ไม่รวมมอเตอร์",
    notes: ["รองรับผ้า Sunscreen 1% / 3% / 5% และ Blackout Fiberglass"],
    collections: [
      {
        id: "fss",
        name: "Skylight FSS",
        rows: [
          { label: "ขั้นต่ำ", value: "8 ตร.หลา / ชุด" },
          {
            label: "ผ้าที่ใช้ได้",
            value: "Sunscreen 1–5% · Blackout Fiberglass",
          },
          { label: "มอเตอร์", value: "สั่งเพิ่มแยกต่างหาก" },
        ],
      },
    ],
  },
];

const CATEGORY_ALIASES: Record<string, string> = {
  "zebra-blinds": "roller-blinds",
  "printed-roller-blinds": "roller-blinds",
};

export function getFactorySpecsByCategory(
  categorySlug: string | null | undefined,
): FactoryCategorySpecs | null {
  if (!categorySlug) return null;
  const resolved = CATEGORY_ALIASES[categorySlug] ?? categorySlug;
  const specs =
    FACTORY_SPECS.find((item) => item.categorySlug === resolved) ?? null;
  if (!specs) return null;
  if (categorySlug === "zebra-blinds") {
    return {
      ...specs,
      categorySlug: "zebra-blinds",
      title: "สเปคม่าน Zebra / Magic Screen",
      collections: specs.collections.filter((item) => item.id === "zebra"),
    };
  }
  return specs;
}

export function matchFactoryCollection(
  specs: FactoryCategorySpecs,
  product: { name: string; sku?: string | null; slug?: string },
): FactoryCollection | null {
  const hay = `${product.name} ${product.sku ?? ""} ${product.slug ?? ""}`;
  return specs.collections.find((item) => item.match?.test(hay)) ?? null;
}
