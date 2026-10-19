import type { Locale } from "./locales";

/**
 * Canonical product / sales terms for all 7 locales.
 * Use these strings so every page stays consistent.
 */
export const glossary = {
  rollerBlind: {
    th: "ม่านม้วน",
    en: "roller blind",
    my: "ရိုလာကန့်လန့်ကာ",
    lo: "ມ່ານມ້ວນ",
    km: "វាំងននរមូរ",
    "zh-hans": "卷帘",
    "zh-hant": "捲簾",
  },
  woodBlind: {
    th: "มู่ลี่ไม้",
    en: "wood blind",
    my: "သစ်သားဘလိုင့်",
    lo: "ມູລີໄມ້",
    km: "វាំងននឈើ",
    "zh-hans": "木百叶",
    "zh-hant": "木百葉",
  },
  curtainRail: {
    th: "รางม่าน",
    en: "curtain rail",
    my: "လိုက်ကာတန်း",
    lo: "ຮາງມ່ານ",
    km: "រ៉ងវាំងនន",
    "zh-hans": "窗帘轨",
    "zh-hant": "窗簾軌",
  },
  pleatedCurtain: {
    th: "ม่านจีบ",
    en: "pleated curtain",
    my: "အကြောင်းကန့်လန့်ကာ",
    lo: "ມ່ານຈີບ",
    km: "វាំងននបត់",
    "zh-hans": "打褶窗帘",
    "zh-hant": "打褶窗簾",
  },
  smartMotor: {
    th: "มอเตอร์อัจฉริยะ",
    en: "smart motor",
    my: "စမတ်မော်တာ",
    lo: "ມໍເຕີອັດສະລິຍະ",
    km: "ម៉ូទ័រឆ្លាតវៃ",
    "zh-hans": "智能电机",
    "zh-hant": "智慧馬達",
  },
  siteMeasure: {
    th: "วัดหน้างาน",
    en: "on-site measurement",
    my: "နေရာတွင် တိုင်းတာခြင်း",
    lo: "ວັດໜ້າວຽກ",
    km: "វាស់នៅទីតាំង",
    "zh-hans": "现场测量",
    "zh-hant": "現場丈量",
  },
  quotation: {
    th: "ใบเสนอราคา",
    en: "quotation",
    my: "ဈေးနှုန်းစာရင်း",
    lo: "ໃບສະເໜີລາຄາ",
    km: "សម្រង់តម្លៃ",
    "zh-hans": "报价单",
    "zh-hant": "報價單",
  },
  verticalBlind: {
    th: "ม่านปรับแสง",
    en: "vertical blind",
    my: "ဒေါင်လိုက်ဘလိုင့်",
    lo: "ມ່ານປັບແສງ",
    km: "វាំងននបញ្ឈរ",
    "zh-hans": "竖百叶",
    "zh-hant": "直式百葉",
  },
  zebraBlind: {
    th: "ม่านริ้ว",
    en: "zebra blind",
    my: "ဇီးဘရာကန့်လန့်ကာ",
    lo: "ມ່ານລາຍເສືອ",
    km: "វាំងននសេប្រា",
    "zh-hans": "柔纱帘",
    "zh-hant": "柔紗簾",
  },
  pvcPartition: {
    th: "ฉากกั้น PVC",
    en: "PVC partition",
    my: "PVC အခန်းကန့်",
    lo: "ສະກັ້ນ PVC",
    km: "ភាគថាស PVC",
    "zh-hans": "PVC 隔断",
    "zh-hant": "PVC 隔間",
  },
} as const satisfies Record<string, Record<Locale, string>>;

export type GlossaryKey = keyof typeof glossary;

export function g(key: GlossaryKey, locale: Locale): string {
  return glossary[key][locale];
}
