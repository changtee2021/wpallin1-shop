import type {
  InspirationMaterialDto,
  InspirationRoomDto,
} from "@/types/api/inspiration";

export type FabricPublicDto = {
  id: string;
  code: string;
  name: string;
  collectionName: string | null;
  colorName: string | null;
  rollWidthCm: number;
  swatchUrl: string | null;
};

export type LocalizedText = {
  th: string;
  en: string;
};

export type LocalizedMaterialProfile = {
  composition: LocalizedText;
  texture: LocalizedText;
  specifications: Array<{ label: LocalizedText; value: LocalizedText }>;
  certifications: Array<{ label: LocalizedText; detail: LocalizedText }>;
  suitableRooms: LocalizedText[];
  bestFor: LocalizedText[];
  care: LocalizedText[];
};

export type MaterialProfileContext = {
  material: InspirationMaterialDto;
  fabric: FabricPublicDto | null;
  usedRooms: InspirationRoomDto[];
};

export type ResolvedMaterialProfile = LocalizedMaterialProfile & {
  dynamicSpecifications: Array<{ label: string; value: string }>;
  observedRoomTypes: string[];
};

type ProfileFamily =
  | "blackout"
  | "linen"
  | "sheer"
  | "rail"
  | "blind"
  | "wave"
  | "eyelet"
  | "pleated"
  | "generic";

const lt = (th: string, en: string): LocalizedText => ({ th, en });

const PROFILE_CONTENT: Record<ProfileFamily, LocalizedMaterialProfile> = {
  blackout: {
    composition: lt(
      "โพลีเอสเตอร์ผสม cotton 3 ชั้น พร้อมชั้น blackout และเคลือบ UV",
      "Triple-weave polyester-cotton blend with blackout coating and UV layer",
    ),
    texture: lt(
      "เนื้อทอหนา สัมผัสเรียบ ด้านนอกเป็น matte กันแสงทะลุได้ดี",
      "Dense woven face with a smooth matte finish and strong light blocking",
    ),
    specifications: [
      {
        label: lt("น้ำหนัก", "Weight"),
        value: lt("280–320 g/m²", "280–320 g/m²"),
      },
      {
        label: lt("การกันแสง", "Light blocking"),
        value: lt("99%+ blackout", "99%+ blackout"),
      },
      {
        label: lt("ความกว้างม้วน", "Roll width"),
        value: lt("280 cm", "280 cm"),
      },
      {
        label: lt("ชั้นผ้า", "Layers"),
        value: lt(
          "3 ชั้น (face + blackout + backing)",
          "3 layers (face + blackout + backing)",
        ),
      },
    ],
    certifications: [
      {
        label: lt("Oeko-Tex Standard 100", "Oeko-Tex Standard 100"),
        detail: lt(
          "ทดสอบสารเคมีต่อร่างกาย — เหมาะใช้ในห้องนอนและพื้นที่อยู่อาศัย",
          "Tested for harmful substances — suitable for bedrooms and living spaces",
        ),
      },
      {
        label: lt("UV Protection", "UV Protection"),
        detail: lt(
          "ช่วยลดรังสี UV ที่เข้าห้อง ลดการซีดจางของเฟอร์นิเจอร์",
          "Reduces UV entering the room and helps protect interior furnishings",
        ),
      },
    ],
    suitableRooms: [
      lt("ห้องนอน", "Bedroom"),
      lt("ห้อง Home Theater", "Home theater"),
      lt("ห้องเด็กเล็ก", "Nursery"),
    ],
    bestFor: [
      lt("นอนกลางวัน / กลางคืนมืดสนิท", "Day sleep and near-total darkness"),
      lt("ความเป็นส่วนตัวสูง", "High privacy"),
      lt("คอนโด / ห้องที่มีแสงรบกวน", "Condos and light-polluted rooms"),
    ],
    care: [
      lt(
        "ซักมือหรือซักเครื่องโปรแกรม Delicate",
        "Hand wash or machine wash on delicate",
      ),
      lt(
        "รีดที่อุณหภูมิต่ำ หลีกเลี่ยงความร้อนสูง",
        "Low-heat iron; avoid high heat",
      ),
    ],
  },
  linen: {
    composition: lt(
      "Linen ผสม polyester ให้เส้นใยสวย ทรงตัวดี และดูแลง่าย",
      "Linen-polyester blend for structure, drape, and easier care",
    ),
    texture: lt(
      "ลายทอธรรมชาติ สัมผัสนุ่ม มีมิติของเส้นใยชัด",
      "Natural slub weave with a soft hand and visible fiber character",
    ),
    specifications: [
      {
        label: lt("น้ำหนัก", "Weight"),
        value: lt("220–260 g/m²", "220–260 g/m²"),
      },
      {
        label: lt("ลายทอ", "Weave"),
        value: lt("Plain / slub linen look", "Plain / slub linen look"),
      },
      {
        label: lt("ความกว้างม้วน", "Roll width"),
        value: lt("280 cm", "280 cm"),
      },
      {
        label: lt("ระบายอากาศ", "Breathability"),
        value: lt("ดี — เหมาะอากาศร้อน", "Good — suited to warm climates"),
      },
    ],
    certifications: [
      {
        label: lt("Oeko-Tex Standard 100", "Oeko-Tex Standard 100"),
        detail: lt(
          "ผ่านการทดสอบสารเคมีต่อผิวหนัง",
          "Certified for skin-friendly use",
        ),
      },
      {
        label: lt("Natural fiber blend", "Natural fiber blend"),
        detail: lt(
          "ใช้เส้นใยธรรมชาติผสมสำหรับลุค Scandinavian",
          "Natural-fiber blend for Scandinavian looks",
        ),
      },
    ],
    suitableRooms: [
      lt("ห้องนั่งเล่น", "Living room"),
      lt("ห้องทานข้าว", "Dining room"),
      lt("ห้องนอน", "Bedroom"),
    ],
    bestFor: [
      lt("โทนอบอุ่น / มินิมอล", "Warm minimal interiors"),
      lt("ม่านเลเยอร์กับ sheer", "Layered looks with sheer"),
      lt(
        "พื้นที่อยู่อาศัยที่ต้องการความนุ่มนวล",
        "Residential spaces needing softness",
      ),
    ],
    care: [
      lt("ซักน้ำเย็น แยกสี", "Cold wash, separate colors"),
      lt("ตากในร่ม ลดแสงแดดจัด", "Dry in shade to preserve color"),
    ],
  },
  sheer: {
    composition: lt(
      "Polyester voile โปร่งแสง น้ำหนักเบา ทรงตัวดี",
      "Lightweight polyester voile with a soft sheer drape",
    ),
    texture: lt(
      "เนื้อบาง โปร่ง กรองแสงนุ่ม ให้บรรยากาศโปร่งสบาย",
      "Fine open weave that filters light gently for an airy feel",
    ),
    specifications: [
      {
        label: lt("น้ำหนัก", "Weight"),
        value: lt("80–120 g/m²", "80–120 g/m²"),
      },
      {
        label: lt("การกรองแสง", "Light filter"),
        value: lt("โปร่ง 40–60%", "Sheer 40–60%"),
      },
      {
        label: lt("ความกว้างม้วน", "Roll width"),
        value: lt("300 cm", "300 cm"),
      },
      {
        label: lt("การตกแต่ง", "Drape"),
        value: lt("นุ่ม ลอยตัว", "Soft and floating"),
      },
    ],
    certifications: [
      {
        label: lt("Oeko-Tex Standard 100", "Oeko-Tex Standard 100"),
        detail: lt(
          "ปลอดสารเคมีอันตรายต่อการสัมผัส",
          "Free from harmful contact substances",
        ),
      },
    ],
    suitableRooms: [
      lt("ห้องนั่งเล่น", "Living room"),
      lt("ห้องทานข้าว", "Dining room"),
      lt("ห้องทำงาน", "Home office"),
    ],
    bestFor: [
      lt("ต้องการแสงธรรมชาติ", "Maximizing natural daylight"),
      lt("ม่านเลเยอร์คู่ blackout", "Layering with blackout curtains"),
      lt("พื้นที่รับแขก / คาเฟ่", "Guest-facing and hospitality spaces"),
    ],
    care: [
      lt("ถุงซัก โปรแกรม Delicate", "Use a laundry bag on delicate cycle"),
      lt("หลีกเลี่ยง bleach", "Avoid bleach"),
    ],
  },
  rail: {
    composition: lt(
      "อลูมิเนียมอัลลอย / เหล็กเคลือบ อุปกรณ์ยึดสแตนเลส",
      "Aluminium alloy / coated steel with stainless fixings",
    ),
    texture: lt(
      "ผิวเรียบ ทนทาน รองรับน้ำหนักม่านได้ดี",
      "Smooth durable finish designed for daily curtain operation",
    ),
    specifications: [
      {
        label: lt("วัสดุ", "Material"),
        value: lt("Aluminium / steel", "Aluminium / steel"),
      },
      {
        label: lt("รับน้ำหนัก", "Load rating"),
        value: lt("สูง — รองรับม่าน 2 ชั้น", "High — supports double layers"),
      },
      {
        label: lt("ผิวเคลือบ", "Finish"),
        value: lt("Matte / satin", "Matte / satin"),
      },
      {
        label: lt("การติดตั้ง", "Mounting"),
        value: lt("เพดาน / ผนัง", "Ceiling / wall"),
      },
    ],
    certifications: [
      {
        label: lt("ISO 9001 (supplier)", "ISO 9001 (supplier)"),
        detail: lt(
          "ระบบคุณภาพจากโรงงานผู้ผลิต",
          "Quality system from manufacturing partner",
        ),
      },
    ],
    suitableRooms: [
      lt("ห้องนั่งเล่น", "Living room"),
      lt("ห้องนอน", "Bedroom"),
      lt("ห้องประชุม", "Meeting room"),
    ],
    bestFor: [
      lt("เลื่อนม่านลื่น ใช้งานทุกวัน", "Smooth daily operation"),
      lt("ม่านหนัก / blackout", "Heavier blackout panels"),
      lt("ระบบมอเตอร์ (ถ้ารองรับ)", "Motorized setups where supported"),
    ],
    care: [lt("เช็ดฝุ่นด้วยผ้าชุบน้ำหมาด ๆ", "Wipe with a lightly damp cloth")],
  },
  blind: {
    composition: lt(
      "Polyester / PVC-free composite สำหรับมู่ลี่ม้วนและ sunscreen",
      "Polyester / PVC-free composite for roller and sunscreen blinds",
    ),
    texture: lt(
      "ผิวเรียบ ทนแสง ควบคุมแสงได้แม่นยำ",
      "Smooth light-stable surface for precise light control",
    ),
    specifications: [
      {
        label: lt("วัสดุ", "Material"),
        value: lt("Polyester composite", "Polyester composite"),
      },
      {
        label: lt("การกรองแสง", "Light control"),
        value: lt(
          "1–5% / 3% sunscreen (ตามรุ่น)",
          "1–5% / 3% sunscreen (by model)",
        ),
      },
      {
        label: lt("ระบบ", "Control"),
        value: lt("Chain / motorized", "Chain / motorized"),
      },
      {
        label: lt("การติดตั้ง", "Mounting"),
        value: lt("ในช่อง / นอกช่อง", "Inside / outside recess"),
      },
    ],
    certifications: [
      {
        label: lt("Fire retardant (grade B1)", "Fire retardant (grade B1)"),
        detail: lt(
          "เหมาะพื้นที่ commercial บางประเภท",
          "Suitable for selected commercial spaces",
        ),
      },
      {
        label: lt("UV stable", "UV stable"),
        detail: lt("ลดการซีดจางจากแดด", "Helps resist sun fading"),
      },
    ],
    suitableRooms: [
      lt("ห้องทำงาน", "Office"),
      lt("ห้องนอน", "Bedroom"),
      lt("ห้องครัว", "Kitchen"),
    ],
    bestFor: [
      lt("ประหยัดพื้นที่", "Space-saving windows"),
      lt("ควบคุมแสงจ้า", "Glare control"),
      lt("โทนโมเดิร์น / มินิมอล", "Modern minimal interiors"),
    ],
    care: [
      lt("ปัดฝุ่นหรือดูดฝุ่นแปรงนุ่ม", "Dust or vacuum with soft brush"),
      lt("เช็ดคราบด้วยผ้าชุบน้ำสบาย ๆ", "Spot-clean with damp cloth"),
    ],
  },
  wave: {
    composition: lt(
      "ระบบหัวม่าน Wave + รางเฉพาะทาง ใช้กับผ้าม่านทั่วไป",
      "Wave heading system with dedicated track for curtain fabrics",
    ),
    texture: lt(
      "เส้นโค้งต่อเนื่อง ดูนุ่มหรู ไม่มีจีบแข็ง",
      "Continuous soft curves without stiff pleats",
    ),
    specifications: [
      {
        label: lt("หัวม่าน", "Heading"),
        value: lt("Wave / S-fold", "Wave / S-fold"),
      },
      {
        label: lt("Fullness", "Fullness"),
        value: lt("2.0–2.5x", "2.0–2.5x"),
      },
      {
        label: lt("ราง", "Track"),
        value: lt("Wave track / ripple fold", "Wave track / ripple fold"),
      },
      {
        label: lt("ลุค", "Look"),
        value: lt("Hotel / contemporary", "Hotel / contemporary"),
      },
    ],
    certifications: [
      {
        label: lt("Craft specification sheet", "Craft specification sheet"),
        detail: lt(
          "มีแบบมาตรฐานการผลิตและระยะห่าง hook ตามขนาด",
          "Standard production sheet with hook spacing by width",
        ),
      },
    ],
    suitableRooms: [
      lt("ห้องนั่งเล่น", "Living room"),
      lt("ห้องนอนหลัก", "Master bedroom"),
      lt("โรงแรม / โชว์รูม", "Hotel / showroom"),
    ],
    bestFor: [
      lt("ลุคพรีเมียม", "Premium aesthetic"),
      lt("เส้นผ้านุ่มต่อเนื่อง", "Continuous soft folds"),
      lt("หน้าต่างกว้าง", "Wide window spans"),
    ],
    care: [
      lt(
        "รีดไอน้ำเบา ๆ หรือปล่อยให้น้ำหนักผ้าทรงตัว",
        "Light steam or let weight settle the folds",
      ),
    ],
  },
  eyelet: {
    composition: lt(
      "หัวม่านตาไก่ (metal eyelet) + ผ้าม่านตามที่เลือก",
      "Metal eyelet heading paired with your chosen curtain fabric",
    ),
    texture: lt(
      "จีบเป็นรู ดูทันสมัย เลื่อนเปิด-ปิดลื่น",
      "Modern ring heading with smooth traverse",
    ),
    specifications: [
      {
        label: lt("หัวม่าน", "Heading"),
        value: lt("Eyelet / grommet", "Eyelet / grommet"),
      },
      {
        label: lt("วงแหวน", "Rings"),
        value: lt("Metal / coated", "Metal / coated"),
      },
      {
        label: lt("Fullness", "Fullness"),
        value: lt("1.8–2.2x", "1.8–2.2x"),
      },
      {
        label: lt("ติดตั้ง", "Install"),
        value: lt("รางเส้นเดียว", "Single pole / track"),
      },
    ],
    certifications: [
      {
        label: lt("Craft specification sheet", "Craft specification sheet"),
        detail: lt(
          "ระยะห่าง eyelet มาตรฐานตามความกว้าง",
          "Standard eyelet spacing by panel width",
        ),
      },
    ],
    suitableRooms: [
      lt("ห้องนอน", "Bedroom"),
      lt("ห้องเด็ก", "Kids room"),
      lt("Airbnb / คอนโด", "Airbnb / condo"),
    ],
    bestFor: [
      lt("ติดตั้งง่าย", "Easy install"),
      lt("สไตล์ casual ทันสมัย", "Casual contemporary style"),
      lt("เลื่อนม่านบ่อย", "Frequent daily use"),
    ],
    care: [
      lt("ซักตามคำแนะนำของผ้าที่เลือก", "Follow care label of selected fabric"),
    ],
  },
  pleated: {
    composition: lt(
      "หัวม่านจีบคลาสสิก + ตะขอ/สเตย์ตามแบบ",
      "Classic pleated heading with hooks and stays",
    ),
    texture: lt(
      "รูปจีบชัด ดูเป็นทางการ ทรงตัวดี",
      "Defined pleats with a formal structured look",
    ),
    specifications: [
      {
        label: lt("หัวม่าน", "Heading"),
        value: lt("Pinch pleat / pencil pleat", "Pinch pleat / pencil pleat"),
      },
      {
        label: lt("Fullness", "Fullness"),
        value: lt("2.0–2.5x", "2.0–2.5x"),
      },
      {
        label: lt("ระยะจีบ", "Pleat spacing"),
        value: lt("10–12 cm (ตามแบบ)", "10–12 cm (by spec)"),
      },
      {
        label: lt("ลุค", "Look"),
        value: lt("Classic / formal", "Classic / formal"),
      },
    ],
    certifications: [
      {
        label: lt("Craft specification sheet", "Craft specification sheet"),
        detail: lt(
          "แบบจีบและจำนวน hook ตามความกว้าง",
          "Pleat layout and hook count by width",
        ),
      },
    ],
    suitableRooms: [
      lt("ห้องรับแขก", "Formal living"),
      lt("ห้องทานข้าว", "Dining room"),
      lt("ห้องประชุม", "Meeting room"),
    ],
    bestFor: [
      lt("งานคลาสสิก", "Classic interiors"),
      lt("พื้นที่ formal", "Formal spaces"),
      lt("ต้องการ volume ม่าน", "Full curtain volume"),
    ],
    care: [lt("รีดไอน้ำที่จีบเพื่อคงรูป", "Steam pleats to maintain shape")],
  },
  generic: {
    composition: lt(
      "วัสดุตกแต่งสำหรับงานม่านและมู่ลี่ — รายละเอียดตามสินค้าที่เลือก",
      "Decor material for curtains and blinds — details follow selected product",
    ),
    texture: lt(
      "เนื้อสัมผัสและลวดลายขึ้นกับประเภทวัสดุที่เลือก",
      "Hand-feel and pattern depend on the selected material type",
    ),
    specifications: [
      {
        label: lt("ประเภท", "Type"),
        value: lt("ตามหมวดวัสดุ", "By material category"),
      },
      {
        label: lt("การใช้งาน", "Application"),
        value: lt("ตกแต่งภายใน", "Interior furnishing"),
      },
      {
        label: lt("สั่งทำ", "Custom"),
        value: lt("ปรับขนาดและสีได้", "Custom size and color available"),
      },
    ],
    certifications: [
      {
        label: lt("Quality checklist", "Quality checklist"),
        detail: lt(
          "ตรวจสอบก่อนส่งมอบตามมาตรฐาน WP ALL",
          "Pre-delivery QC per WP ALL standards",
        ),
      },
    ],
    suitableRooms: [
      lt("ห้องนั่งเล่น", "Living room"),
      lt("ห้องนอน", "Bedroom"),
    ],
    bestFor: [
      lt("ตกแต่งภายใน", "Interior styling"),
      lt("สั่งทำตามพื้นที่", "Made-to-measure projects"),
    ],
    care: [
      lt(
        "ดูแลตามคำแนะนำของวัสดุที่เลือก",
        "Follow care guidance for selected material",
      ),
    ],
  },
};

const FABRIC_ID_FAMILIES: Record<string, ProfileFamily> = {
  "f2000001-0000-4000-8000-000000000004": "blackout",
  "f2000001-0000-4000-8000-000000000005": "blackout",
  "f2000001-0000-4000-8000-000000000006": "blackout",
  "f2000001-0000-4000-8000-000000000010": "blackout",
  "f2000001-0000-4000-8000-000000000001": "linen",
  "f2000001-0000-4000-8000-000000000002": "linen",
  "f2000001-0000-4000-8000-000000000003": "linen",
  "f2000001-0000-4000-8000-000000000009": "linen",
  "f2000001-0000-4000-8000-000000000011": "linen",
  "f2000001-0000-4000-8000-000000000007": "sheer",
  "f2000001-0000-4000-8000-000000000008": "sheer",
  "f2000001-0000-4000-8000-000000000012": "sheer",
};

function detectProfileFamily(material: InspirationMaterialDto): ProfileFamily {
  if (material.fabricId && FABRIC_ID_FAMILIES[material.fabricId]) {
    return FABRIC_ID_FAMILIES[material.fabricId];
  }

  const label = `${material.label} ${material.caption ?? ""}`.toLowerCase();
  const slug = material.slug.toLowerCase();

  if (
    material.materialType === "rail" ||
    label.includes("ราง") ||
    slug.includes("rail")
  ) {
    return "rail";
  }
  if (
    material.materialType === "blind" ||
    label.includes("มู่ลี่") ||
    slug.includes("roller") ||
    slug.includes("zebra") ||
    slug.includes("motorized")
  ) {
    return "blind";
  }
  if (material.configuratorProductType === "wave" || label.includes("wave"))
    return "wave";
  if (
    material.configuratorProductType === "eyelet" ||
    label.includes("eyelet") ||
    label.includes("ตาไก่")
  ) {
    return "eyelet";
  }
  if (
    material.configuratorProductType === "pleated" ||
    label.includes("จีบ") ||
    label.includes("pleated")
  ) {
    return "pleated";
  }
  if (
    label.includes("blackout") ||
    label.includes("กรม") ||
    label.includes("navy") ||
    label.includes("grey") ||
    label.includes("ถ่าน")
  ) {
    return "blackout";
  }
  if (label.includes("sheer") || label.includes("โปร่ง")) return "sheer";
  if (
    label.includes("linen") ||
    label.includes("เบจ") ||
    label.includes("ทราย")
  )
    return "linen";

  if (material.materialType === "fabric") return "linen";
  if (material.materialType === "style") return "wave";

  return "generic";
}

function dynamicSpecsFromFabric(fabric: FabricPublicDto | null): Array<{
  label: string;
  value: string;
}> {
  if (!fabric) return [];

  const rows: Array<{ label: string; value: string }> = [
    { label: "SKU", value: fabric.code },
  ];

  if (fabric.collectionName) {
    rows.push({ label: "Collection", value: fabric.collectionName });
  }
  if (fabric.colorName) {
    rows.push({ label: "Color", value: fabric.colorName });
  }
  if (fabric.rollWidthCm) {
    rows.push({ label: "Roll width", value: `${fabric.rollWidthCm} cm` });
  }

  return rows;
}

export function resolveMaterialProfile(
  context: MaterialProfileContext,
): ResolvedMaterialProfile {
  const family = detectProfileFamily(context.material);
  const content = PROFILE_CONTENT[family];
  const observedRoomTypes = [
    ...new Set(
      context.usedRooms
        .map((room) => room.roomType)
        .filter((value): value is string => Boolean(value)),
    ),
  ];

  return {
    ...content,
    dynamicSpecifications: dynamicSpecsFromFabric(context.fabric),
    observedRoomTypes,
  };
}

export function pickLocalized(
  text: LocalizedText,
  locale: "th" | "en",
): string {
  return locale === "en" ? text.en : text.th;
}
