import { useCallback } from "react";

import { useT, type Locale } from "@/i18n";

type Translations = Record<Exclude<Locale, "th">, string>;

/**
 * Catalog titles, descriptions, tags and category names are stored in Thai in
 * `wpall_retail.marketing_catalogs` / `marketing_catalog_categories`. Keyed by
 * the exact Thai text; new admin entries need a row here or they render as-is.
 */
const CATALOG_DB_TEXT: Record<string, Translations> = {
  "WP ALL Roller Blinds — ม่านม้วน": {
    en: "WP ALL Roller Blinds",
    my: "WP ALL Roller Blinds — လိပ်ကာ",
    lo: "WP ALL Roller Blinds — ມ່ານມ້ວນ",
    km: "WP ALL Roller Blinds — វាំងននរមូរ",
    "zh-hans": "WP ALL Roller Blinds — 卷帘",
    "zh-hant": "WP ALL Roller Blinds — 捲簾",
  },
  "แคตตาล็อกม่านม้วนครบทุกประเภท — Blackout, Sunscreen, Zebra, Motorized และอุปกรณ์":
    {
      en: "Every roller blind type in one catalogue — Blackout, Sunscreen, Zebra, Motorized and accessories",
      my: "လိပ်ကာ အမျိုးအစားအားလုံး ပါဝင်သော ကတ်တလောက် — Blackout, Sunscreen, Zebra, Motorized နှင့် ဆက်စပ်ပစ္စည်းများ",
      lo: "ແຄັດຕາລັອກມ່ານມ້ວນຄົບທຸກປະເພດ — Blackout, Sunscreen, Zebra, Motorized ແລະ ອຸປະກອນ",
      km: "កាតាឡុកវាំងននរមូរគ្រប់ប្រភេទ — Blackout, Sunscreen, Zebra, Motorized និងគ្រឿងបន្លាស់",
      "zh-hans":
        "全系列卷帘目录 — Blackout、Sunscreen、Zebra、Motorized 及配件",
      "zh-hant":
        "全系列捲簾型錄 — Blackout、Sunscreen、Zebra、Motorized 及配件",
    },
  "WP ALL Wooden Blinds — มู่ลี่ไม้": {
    en: "WP ALL Wooden Blinds",
    my: "WP ALL Wooden Blinds — သစ်သားဘလိုင်း",
    lo: "WP ALL Wooden Blinds — ມູ່ລີ່ໄມ້",
    km: "WP ALL Wooden Blinds — វាំងននបន្ទះឈើ",
    "zh-hans": "WP ALL Wooden Blinds — 木百叶",
    "zh-hant": "WP ALL Wooden Blinds — 木百葉",
  },
  "แคตตาล็อกมู่ลี่ไม้ครบชุด — ไม้จริง ไม้เทียม ขนาดซี่ สี และอุปกรณ์ติดตั้ง": {
    en: "The full wooden blind catalogue — real wood, faux wood, slat sizes, colours and installation hardware",
    my: "သစ်သားဘလိုင်း ကတ်တလောက် အပြည့်အစုံ — သစ်သားစစ်၊ သစ်သားတု၊ ဘလိုင်းပြားအရွယ်အစား၊ အရောင်နှင့် တပ်ဆင်ပစ္စည်းများ",
    lo: "ແຄັດຕາລັອກມູ່ລີ່ໄມ້ຄົບຊຸດ — ໄມ້ແທ້ ໄມ້ທຽມ ຂະໜາດໃບ ສີ ແລະ ອຸປະກອນຕິດຕັ້ງ",
    km: "កាតាឡុកវាំងននបន្ទះឈើពេញលេញ — ឈើពិត ឈើសិប្បនិម្មិត ទំហំបន្ទះ ពណ៌ និងគ្រឿងតម្លើង",
    "zh-hans": "木百叶完整目录 — 实木、仿木、叶片尺寸、颜色及安装配件",
    "zh-hant": "木百葉完整型錄 — 實木、仿木、葉片尺寸、顏色及安裝配件",
  },
  "WP ALL ใบราคาส่ง — ตัวแทนจำหน่าย": {
    en: "WP ALL Wholesale Price List — Dealers",
    my: "WP ALL လက်ကားဈေးနှုန်းစာရင်း — ကိုယ်စားလှယ်များ",
    lo: "WP ALL ໃບລາຄາສົ່ງ — ຕົວແທນຈຳໜ່າຍ",
    km: "WP ALL តារាងតម្លៃលក់ដុំ — តំណាងចែកចាយ",
    "zh-hans": "WP ALL 批发价目表 — 经销商",
    "zh-hant": "WP ALL 批發價目表 — 經銷商",
  },
  "ใบราคาส่งโรงงานสำหรับตัวแทนที่อนุมัติแล้ว — ม่านม้วน มู่ลี่ ฉาก PVC ราง และมอเตอร์":
    {
      en: "Factory wholesale prices for approved dealers — roller blinds, blinds, PVC partitions, rails and motors",
      my: "အတည်ပြုပြီး ကိုယ်စားလှယ်များအတွက် စက်ရုံလက်ကားဈေး — လိပ်ကာ၊ ဘလိုင်း၊ PVC အကာ၊ လိုက်ကာတန်းနှင့် မော်တာ",
      lo: "ລາຄາສົ່ງຈາກໂຮງງານສຳລັບຕົວແທນທີ່ອະນຸມັດແລ້ວ — ມ່ານມ້ວນ ມູ່ລີ່ ຝາກັ້ນ PVC ຮາງ ແລະ ມໍເຕີ",
      km: "តម្លៃលក់ដុំពីរោងចក្រសម្រាប់តំណាងដែលបានអនុម័ត — វាំងននរមូរ វាំងននបន្ទះ ជញ្ជាំងខណ្ឌ PVC រ៉ង និងម៉ូទ័រ",
      "zh-hans":
        "已审核经销商的工厂批发价 — 卷帘、百叶帘、PVC 隔断、轨道及电机",
      "zh-hant":
        "已審核經銷商的工廠批發價 — 捲簾、百葉簾、PVC 隔間、軌道及馬達",
    },
  ม่านม้วน: {
    en: "Roller Blinds",
    my: "လိပ်ကာ",
    lo: "ມ່ານມ້ວນ",
    km: "វាំងននរមូរ",
    "zh-hans": "卷帘",
    "zh-hant": "捲簾",
  },
  ม่านจีบ: {
    en: "Pleated Curtains",
    my: "အခေါက်လိုက်ကာ",
    lo: "ຜ້າມ່ານຈີບ",
    km: "វាំងននជីប",
    "zh-hans": "褶皱窗帘",
    "zh-hant": "褶皺窗簾",
  },
  มู่ลี่: {
    en: "Blinds",
    my: "ဘလိုင်း",
    lo: "ມູ່ລີ່",
    km: "វាំងននបន្ទះ",
    "zh-hans": "百叶帘",
    "zh-hant": "百葉簾",
  },
  มู่ลี่ไม้: {
    en: "Wooden Blinds",
    my: "သစ်သားဘလိုင်း",
    lo: "ມູ່ລີ່ໄມ້",
    km: "វាំងននបន្ទះឈើ",
    "zh-hans": "木百叶",
    "zh-hant": "木百葉",
  },
  "ม่านตาไก่ / อื่นๆ": {
    en: "Eyelet Curtains / Other",
    my: "ကွင်းပေါက်လိုက်ကာ / အခြား",
    lo: "ຜ້າມ່ານຕາໄກ່ / ອື່ນໆ",
    km: "វាំងននរង្វង់ដែក / ផ្សេងៗ",
    "zh-hans": "打孔窗帘 / 其他",
    "zh-hant": "打孔窗簾 / 其他",
  },
  ผ้าม่าน: {
    en: "Curtains",
    my: "လိုက်ကာ",
    lo: "ຜ້າມ່ານ",
    km: "វាំងនន",
    "zh-hans": "窗帘",
    "zh-hant": "窗簾",
  },
  วอลเปเปอร์: {
    en: "Wallpaper",
    my: "နံရံကပ်စက္ကူ",
    lo: "ວໍເປເປີ",
    km: "ក្រដាសបិទជញ្ជាំង",
    "zh-hans": "壁纸",
    "zh-hant": "壁紙",
  },
  ไม้จริง: {
    en: "Real wood",
    my: "သစ်သားစစ်",
    lo: "ໄມ້ແທ້",
    km: "ឈើពិត",
    "zh-hans": "实木",
    "zh-hant": "實木",
  },
  ไม้เทียม: {
    en: "Faux wood",
    my: "သစ်သားတု",
    lo: "ໄມ້ທຽມ",
    km: "ឈើសិប្បនិម្មិត",
    "zh-hans": "仿木",
    "zh-hant": "仿木",
  },
  ใบราคา: {
    en: "Price list",
    my: "ဈေးနှုန်းစာရင်း",
    lo: "ໃບລາຄາ",
    km: "តារាងតម្លៃ",
    "zh-hans": "价目表",
    "zh-hant": "價目表",
  },
  ตัวแทน: {
    en: "Dealer",
    my: "ကိုယ်စားလှယ်",
    lo: "ຕົວແທນ",
    km: "តំណាង",
    "zh-hans": "经销商",
    "zh-hant": "經銷商",
  },
  แคตตาล็อก: {
    en: "catalogues",
    my: "ကတ်တလောက်",
    lo: "ແຄັດຕາລັອກ",
    km: "កាតាឡុក",
    "zh-hans": "本目录",
    "zh-hant": "本型錄",
  },
};

export function catalogDbText(locale: Locale, text: string): string {
  if (locale === "th") return text;
  return CATALOG_DB_TEXT[text]?.[locale] ?? text;
}

export function useCatalogDbText() {
  const { locale } = useT();
  return useCallback((text: string) => catalogDbText(locale, text), [locale]);
}
