export type AboutProduct = {
  th: string;
  en: string;
  shopCategory?: string;
};

export const ABOUT_PRODUCTS: AboutProduct[] = [
  { th: "ผ้าม่าน", en: "Curtain Fabric", shopCategory: "curtains" },
  { th: "อุปกรณ์ผ้าม่าน", en: "Curtain accessories", shopCategory: "accessories" },
  { th: "ม่านม้วน", en: "Roller Blind", shopCategory: "roller-blinds" },
  { th: "ม่านปรับแสงแนวตั้ง", en: "Vertical Blind", shopCategory: "vertical-blinds" },
  { th: "มู่ลี่ไม้", en: "Wooden Venetian Blind", shopCategory: "wood-blinds" },
  { th: "มู่ลี่อลูมิเนียม", en: "Aluminium Venetian Blind", shopCategory: "aluminum-blinds" },
  { th: "ม่านกลางแจ้ง", en: "Out Door Blind", shopCategory: "outdoor-curtains" },
  { th: "ม่านซิป", en: "Zip Blind", shopCategory: "zip-blinds" },
  { th: "Skylight FSS", en: "Skylight FSS", shopCategory: "skylight-fss" },
  { th: "ประตูพับ PVC", en: "PVC Folding Door", shopCategory: "pvc-folding-doors" },
  { th: "ม่านริ้ว PVC", en: "PVC Strip Curtain", shopCategory: "pvc-strip-curtains" },
  { th: "วอลเปเปอร์", en: "Wallpaper", shopCategory: "wallpaper" },
  { th: "ฟิล์มกรองแสงอาคาร", en: "Window Tinting Building", shopCategory: "window-tinting" },
  { th: "พิมพ์ผ้าตามแบบ", en: "Custom Print Fabric", shopCategory: "fabric-print" },
  { th: "ม่านม้วนพิมพ์ลาย", en: "Print Roller Blind", shopCategory: "printed-roller-blinds" },
  { th: "ม่านโนเรนญี่ปุ่น", en: "Noren japanese curtain", shopCategory: "noren" },
];

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
  { value: "freelance_technician", th: "ช่างอิสระ", en: "Freelance Technician" },
] as const;

export const ABOUT_GALLERY = [
  { image: "/home/gallery-roller-blind.png", th: "ม่านม้วน", en: "Roller blinds" },
  { image: "/home/gallery-zebra-blind.png", th: "ม่านปรับแสง", en: "Zebra blinds" },
  { image: "/home/gallery-wood-blind.png", th: "มู่ลี่ไม้", en: "Wood blinds" },
  { image: "/home/gallery-aluminum-blind.png", th: "มู่ลี่อลูมิเนียม", en: "Aluminum blinds" },
  { image: "/home/gallery-room-divider.png", th: "ฉากกั้นห้อง", en: "Room divider" },
  { image: "/home/gallery-pleated-curtain.png", th: "ผ้าม่านจีบ", en: "Pleated curtains" },
] as const;

export const ABOUT_CERTS = [
  {
    name: "OEKO-TEX® STANDARD 100",
    href: "https://www.oeko-tex.com/en/our-standards/oeko-tex-standard-100",
    logo: "/about/certs/oeko-tex-standard-100.svg",
    hint: {
      th: "ผ้าผ่านการทดสอบสารเคมี",
      en: "Textile chemical testing",
    },
  },
  {
    name: "UL GREENGUARD Gold",
    href: "https://www.ul.com/services/ul-greenguard-certification",
    logo: "/about/certs/ul-greenguard-gold.webp",
    hint: {
      th: "คุณภาพอากาศภายในอาคาร",
      en: "Indoor air quality",
    },
  },
] as const;

export const ABOUT_IMAGES = {
  hero: "/about/hero-sheer-thai.webp",
  philosophy: "/about/philosophy-drapes.webp",
  print: "/about/print-fabric-machine.webp",
  woodHands: "/about/wood-blind-hands.webp",
  motor: "/about/motor-hardware.webp",
  roller: "/home/gallery-roller-blind.png",
  aluminum: "/home/gallery-aluminum-blind.png",
} as const;

export const ABOUT_COPY = {
  th: {
    heroKicker: "WP ALL in 1 · Home & Decoration",
    heroTitle: "ศูนย์กลางผ้าม่าน",
    heroAccent: "ผ้าม่าน",
    heroBody:
      "ผู้ผลิตและจัดจำหน่ายผ้าม่าน มู่ลี่ และระบบมอเตอร์ สำหรับบ้านและโครงการ",
    ctaShop: "ชมสินค้า",
    ctaDealer: "สมัครตัวแทน",
    storyEyebrow: "เกี่ยวกับเรา",
    storyTitle: "โรงงานจริง งานตามพื้นที่จริง",
    storyBody:
      "WP ALL เป็นผู้ผลิตและจัดจำหน่ายผ้าม่าน มู่ลี่ และระบบมอเตอร์ ทั้งภายในและภายนอก ยึดมาตรฐานมืออาชีพและงานเฉพาะทาง เพื่อส่งมอบโซลูชันที่ออกแบบตามพื้นที่จริง ทั้งลูกค้าบ้านและงานโครงการ",
    values: [
      {
        title: "คนที่ไว้ใจได้",
        en: "Trusted People",
        body: "ทีมขาย โรงงาน และช่างคุยเรื่องเดียวกัน",
      },
      {
        title: "กระบวนการที่ไว้ใจได้",
        en: "Trusted Processes",
        body: "วัด ผลิต ตรวจ ติดตั้ง ตามขั้นตอน",
      },
      {
        title: "เติบโตไปด้วยกัน",
        en: "Growing Together",
        body: "ร้านคู่ค้าและโครงการโตไปพร้อมโรงงาน",
      },
    ],
    philosophyEyebrow: "Our Business Philosophy",
    philosophyTitle: "ปรัชญาธุรกิจของเรา",
    cpc: [
      { letter: "C", title: "Complete Solutions", th: "ครบวงจร" },
      { letter: "P", title: "Professional Standards", th: "มาตรฐานมืออาชีพ" },
      { letter: "C", title: "Custom Made Flexibility", th: "สั่งทำยืดหยุ่น" },
    ],
    productsEyebrow: "Our Product",
    productsTitle: "สินค้าของเรา",
    productsCaption: "เลือกและปรับม่านให้เข้ากับพื้นที่ของคุณ",
    printKicker: "Specialist customized",
    printTitle: "Print Fabric",
    printBody: "ผู้เชี่ยวชาญพิมพ์ผ้าตามแบบ — จากโรงงานสู่พื้นที่จริง",
    printCta: "ดูหมวดพิมพ์ผ้า",
    partnersKicker: "Best Price, Quality Product & Ready to Ship",
    partnersTitle: "เราต้องการพาร์ทเนอร์",
    partnersBody:
      "ร้านค้าปลีก ขายส่ง งานโครงการ นักออกแบบ และช่าง — สั่งจากโรงงานได้โดยตรง",
    partnersCta: "สมัครเป็นตัวแทน",
    motorTitle: "Experts in SmartBlinds & Motor Systems",
    motorBody: "ผู้เชี่ยวชาญระบบม่านมอเตอร์และสมาร์ทบลายด์",
    motorCta: "ดูระบบมอเตอร์",
    certsTitle: "มาตรฐานวัสดุ",
    certHint: "ใช้วัสดุที่ผ่านมาตรฐานสากลสำหรับงานบ้านและโครงการ",
    officeEyebrow: "สำนักงานใหญ่",
    officeCtaLine: "คุย LINE",
    officeCtaVisit: "นัดชมโรงงาน",
    officeCtaProject: "ติดต่อโครงการ",
  },
  en: {
    heroKicker: "WP ALL in 1 · Home & Decoration",
    heroTitle: "Center of curtains",
    heroAccent: "curtains",
    heroBody:
      "Manufacturer and distributor of curtains, blinds, and motorized systems for homes and commercial projects.",
    ctaShop: "Browse products",
    ctaDealer: "Become a dealer",
    storyEyebrow: "About us",
    storyTitle: "A real factory. Made for the space.",
    storyBody:
      "WP ALL is a manufacturer and distributor of curtains, blinds, and motorized systems for indoor and outdoor spaces. Driven by professional standards and specialized expertise, we deliver efficient, tailor-made solutions for private clients and commercial projects.",
    values: [
      {
        title: "Trusted People",
        en: "Trusted People",
        body: "Sales, factory, and installers work from the same brief.",
      },
      {
        title: "Trusted Processes",
        en: "Trusted Processes",
        body: "Measure, produce, inspect, and install in a clear sequence.",
      },
      {
        title: "Growing Together",
        en: "Growing Together",
        body: "Dealers and projects grow with the factory.",
      },
    ],
    philosophyEyebrow: "Our Business Philosophy",
    philosophyTitle: "How we work",
    cpc: [
      { letter: "C", title: "Complete Solutions", th: "End-to-end range" },
      { letter: "P", title: "Professional Standards", th: "Factory discipline" },
      { letter: "C", title: "Custom Made Flexibility", th: "Made to measure" },
    ],
    productsEyebrow: "Our Product",
    productsTitle: "What we make",
    productsCaption: "Select and customize matching blinds for your space.",
    printKicker: "Specialist customized",
    printTitle: "Print Fabric",
    printBody: "Custom printed fabric from our own production line.",
    printCta: "See print fabrics",
    partnersKicker: "Best Price, Quality Product & Ready to Ship",
    partnersTitle: "We are looking for partners",
    partnersBody:
      "Retail, wholesale, projects, designers, and technicians — order factory-direct.",
    partnersCta: "Apply as a dealer",
    motorTitle: "Experts in SmartBlinds & Motor Systems",
    motorBody: "Motorized curtains and smart-blind hardware, specified to the opening.",
    motorCta: "See motor systems",
    certsTitle: "Material standards",
    certHint: "Materials specified against international indoor-air and textile tests.",
    officeEyebrow: "Head office",
    officeCtaLine: "Chat on LINE",
    officeCtaVisit: "Book a factory visit",
    officeCtaProject: "Project inquiry",
  },
} as const;
