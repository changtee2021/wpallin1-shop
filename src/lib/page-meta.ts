import type { Localized } from "@/lib/bi";

type PageMeta = { title: Localized; description: Localized };

/** SEO titles/descriptions for static storefront pages. my/lo/km fall back to en. */
export const PAGE_META = {
  about: {
    title: {
      th: "เกี่ยวกับ WP ALL | ผู้ผลิตม่าน มู่ลี่ และระบบมอเตอร์",
      en: "About WP ALL | Curtain, Blind & Motor Manufacturer",
      "zh-hans": "关于 WP ALL | 窗帘、百叶与电机系统制造商",
      "zh-hant": "關於 WP ALL | 窗簾、百葉與馬達系統製造商",
    },
    description: {
      th: "WP ALL แบรนด์ผ้าม่าน มู่ลี่ ราง และระบบมอเตอร์ สำหรับบ้านและงานโครงการ ปรัชญา C-P-C และความใส่ใจ 6 ขั้นตอนในทุกชิ้นงาน",
      en: "WP ALL makes curtains, blinds, rails and motor systems for homes and projects, guided by the C-P-C philosophy and a 6-step quality process.",
      "zh-hans":
        "WP ALL 为住宅与工程项目提供窗帘、百叶、轨道与电机系统，秉持 C-P-C 理念与六步品质流程。",
      "zh-hant":
        "WP ALL 為住宅與工程專案提供窗簾、百葉、軌道與馬達系統，秉持 C-P-C 理念與六步品質流程。",
    },
  },
  faq: {
    title: {
      th: "คำถามที่พบบ่อย | WP ALL",
      en: "FAQ | WP ALL",
      "zh-hans": "常见问题 | WP ALL",
      "zh-hant": "常見問題 | WP ALL",
    },
    description: {
      th: "คำตอบเรื่องราคา การวัดขนาดหน้าต่าง ตัวอย่างสี ม่านมอเตอร์ งานพิมพ์ผ้า การสมัครตัวแทน และการนัดเยี่ยมชม WP ALL",
      en: "Answers on pricing, measuring windows, colour samples, motorised curtains, fabric printing, becoming a dealer and visiting WP ALL.",
      "zh-hans":
        "关于价格、窗户测量、色样、电动窗帘、布料印花、成为经销商及参观 WP ALL 的常见解答。",
      "zh-hant":
        "關於價格、窗戶丈量、色樣、電動窗簾、布料印花、成為經銷商及參觀 WP ALL 的常見解答。",
    },
  },
  partners: {
    title: {
      th: "ตัวแทนจำหน่าย / OEM / ODM | WP ALL",
      en: "Dealers / OEM / ODM | WP ALL",
      "zh-hans": "经销商 / OEM / ODM | WP ALL",
      "zh-hant": "經銷商 / OEM / ODM | WP ALL",
    },
    description: {
      th: "ร่วมเป็นตัวแทนจำหน่ายม่าน มู่ลี่ ราง และมอเตอร์ WP ALL หรือสั่งผลิตแบบ OEM / ODM ภายใต้แบรนด์ของคุณ ผลิตตามออเดอร์และจัดส่งถึงร้านคุณ",
      en: "Become a WP ALL dealer for curtains, blinds, rails and motors, or order OEM / ODM production under your own brand, made to order and delivered to your store.",
      "zh-hans":
        "成为 WP ALL 窗帘、百叶、轨道与电机经销商，或以您的品牌进行 OEM / ODM 生产，按单生产并送货到店。",
      "zh-hant":
        "成為 WP ALL 窗簾、百葉、軌道與馬達經銷商，或以您的品牌進行 OEM / ODM 生產，依訂單生產並送貨到店。",
    },
  },
  journal: {
    title: {
      th: "บทความ | WP ALL",
      en: "Journal | WP ALL",
      "zh-hans": "文章 | WP ALL",
      "zh-hant": "文章 | WP ALL",
    },
    description: {
      th: "ไอเดียแต่งบ้าน วิธีเลือกม่านและมู่ลี่ และเรื่องราวจาก WP ALL",
      en: "Home decor ideas, how to choose curtains and blinds, and stories from WP ALL.",
      "zh-hans": "家居装饰灵感、窗帘与百叶的挑选方法，以及 WP ALL 的故事。",
      "zh-hant": "居家裝飾靈感、窗簾與百葉的挑選方法，以及 WP ALL 的故事。",
    },
  },
  smartMotor: {
    title: {
      th: "ม่านมอเตอร์ไฟฟ้า Smart Motor | WP ALL",
      en: "Smart Motor Motorised Curtains | WP ALL",
      "zh-hans": "智能电机电动窗帘 | WP ALL",
      "zh-hant": "智慧馬達電動窗簾 | WP ALL",
    },
    description: {
      th: "ระบบมอเตอร์อัจฉริยะสำหรับม่านม้วน มู่ลี่ไม้ มู่ลี่อลูมิเนียม ผ้าม่านจีบ และม่านลอน ควบคุมผ่านรีโมท สวิตช์ติดผนัง และมือถือ",
      en: "Smart motor systems for roller blinds, wood and aluminium blinds, pleated and wave curtains, controlled by remote, wall switch or phone.",
      "zh-hans":
        "适用于卷帘、木百叶、铝百叶、褶皱帘与蛇形帘的智能电机系统，可通过遥控器、墙面开关或手机控制。",
      "zh-hant":
        "適用於捲簾、木百葉、鋁百葉、打褶簾與蛇形簾的智慧馬達系統，可透過遙控器、牆面開關或手機控制。",
    },
  },
  catalogs: {
    title: {
      th: "แคตตาล็อกสินค้า | WP ALL",
      en: "Product Catalogues | WP ALL",
      "zh-hans": "产品目录 | WP ALL",
      "zh-hant": "產品型錄 | WP ALL",
    },
    description: {
      th: "อ่านและดาวน์โหลดแคตตาล็อกม่าน มู่ลี่ ราง และระบบมอเตอร์ WP ALL ออนไลน์",
      en: "Read and download WP ALL catalogues for curtains, blinds, rails and motor systems online.",
      "zh-hans": "在线阅读并下载 WP ALL 窗帘、百叶、轨道与电机系统产品目录。",
      "zh-hant": "線上閱讀並下載 WP ALL 窗簾、百葉、軌道與馬達系統產品型錄。",
    },
  },
  projects: {
    title: {
      th: "ผลงาน | WP ALL",
      en: "Projects | WP ALL",
      "zh-hans": "项目案例 | WP ALL",
      "zh-hant": "專案案例 | WP ALL",
    },
    description: {
      th: "ผลงานม่านพิมพ์ลาย งานนิทรรศการ และงานติดตั้งจากตัวแทนจำหน่าย WP ALL ทั่วประเทศ เช่น Colors of Buriram 2025 และ Bangkok Design Week 2025",
      en: "Printed curtain work, exhibitions and installations by WP ALL dealers nationwide, including Colors of Buriram 2025 and Bangkok Design Week 2025.",
      "zh-hans":
        "WP ALL 全国经销商的印花窗帘、展览与安装案例，包括 Colors of Buriram 2025 与 Bangkok Design Week 2025。",
      "zh-hant":
        "WP ALL 全國經銷商的印花窗簾、展覽與安裝案例，包括 Colors of Buriram 2025 與 Bangkok Design Week 2025。",
    },
  },
  inspiration: {
    title: {
      th: "แรงบันดาลใจแต่งบ้าน | WP ALL",
      en: "Home Inspiration | WP ALL",
      "zh-hans": "家居灵感 | WP ALL",
      "zh-hant": "居家靈感 | WP ALL",
    },
    description: {
      th: "ไอเดียห้องจริงจากผ้าม่าน มู่ลี่ และวัสดุ WP ALL เลือกบรรยากาศแล้วดูว่าใช้ผ้า ราง หรือมู่ลี่แบบไหน",
      en: "Real-room ideas from WP ALL curtains, blinds and materials. Browse a look, then see the fabric, track or blind behind it.",
      "zh-hans":
        "来自 WP ALL 窗帘、百叶与材料的真实房间灵感。先看氛围，再看背后的布料、轨道或百叶。",
      "zh-hant":
        "來自 WP ALL 窗簾、百葉與材料的真實房間靈感。先看氛圍，再看背後的布料、軌道或百葉。",
    },
  },
  shop: {
    title: {
      th: "WP ALL Shop — สั่งซื้อสินค้าสำหรับตัวแทนจำหน่าย",
      en: "WP ALL Shop — Ordering for Dealers",
      "zh-hans": "WP ALL Shop — 经销商订购",
      "zh-hant": "WP ALL Shop — 經銷商訂購",
    },
    description: {
      th: "ร้านค้าออนไลน์ WP ALL ผ้าม่าน ม่านม้วน รางม่าน และอุปกรณ์ ราคาโรงงานสำหรับตัวแทนจำหน่าย สั่งซ้ำง่าย ติดตามออเดอร์ได้",
      en: "WP ALL online shop for curtains, roller blinds, rails and accessories at factory prices for dealers, with easy reorders and order tracking.",
      "zh-hans":
        "WP ALL 线上商店：窗帘、卷帘、轨道与配件，经销商享工厂价，轻松再订购并可追踪订单。",
      "zh-hant":
        "WP ALL 線上商店：窗簾、捲簾、軌道與配件，經銷商享工廠價，輕鬆再訂購並可追蹤訂單。",
    },
  },
} satisfies Record<string, PageMeta>;
