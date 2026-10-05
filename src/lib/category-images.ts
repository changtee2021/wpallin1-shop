import type { CategoryDto } from "@/types/api/categories";

/** Full-bleed photos for category tiles. Labels are drawn in the UI, not in the file. */
const CATEGORY_IMAGE_BY_SLUG: Record<string, string> = {
  curtains: "/categories/photos/cat-curtains.jpg",
  accessories: "/categories/photos/cat-accessories.jpg",
  "roller-blinds": "/categories/photos/cat-roller.jpg",
  "vertical-blinds": "/categories/photos/cat-vertical.jpg",
  "wood-blinds": "/categories/photos/cat-wood.jpg",
  "aluminum-blinds": "/categories/photos/cat-aluminum.jpg",
  "outdoor-curtains": "/categories/photos/cat-outdoor.jpg",
  "zip-blinds": "/categories/photos/cat-outdoor.jpg",
  "skylight-fss": "/categories/photos/cat-roman.jpg",
  "pvc-folding-doors": "/categories/photos/cat-partition.jpg",
  "pvc-strip-curtains": "/categories/photos/cat-vertical.jpg",
  wallpaper: "/categories/photos/cat-wallpaper.jpg",
  "window-tinting": "/categories/photos/cat-outdoor.jpg",
  "fabric-print": "/categories/photos/cat-fabric.jpg",
  "printed-roller-blinds": "/categories/photos/cat-print-roller.jpg",
  noren: "/categories/photos/cat-noren.jpg",
  "zebra-blinds": "/categories/photos/cat-zebra.jpg",
  "roman-blinds": "/categories/photos/cat-roman.jpg",
  "curtain-rails": "/categories/photos/cat-rails.jpg",
  "ready-made": "/categories/photos/cat-curtains.jpg",
  "motorized-curtains": "/categories/photos/cat-motor.jpg",
};

const CATEGORY_LABEL_EN: Record<string, string> = {
  curtains: "Curtain",
  accessories: "Accessories",
  "roller-blinds": "Roller Blinds",
  "vertical-blinds": "Vertical Blinds",
  "wood-blinds": "Wooden Venetian Blinds",
  "aluminum-blinds": "Aluminium Venetian Blinds",
  "outdoor-curtains": "Outdoor Blinds",
  "zip-blinds": "Zip Blinds",
  "skylight-fss": "Skylight",
  "pvc-folding-doors": "Folding Door",
  "pvc-strip-curtains": "PVC Strip Curtain",
  wallpaper: "Wallpaper",
  "window-tinting": "Window Film",
  "fabric-print": "Print Fabric",
  "printed-roller-blinds": "Printed Roller Blinds",
  noren: "Print Curtain",
  "zebra-blinds": "Zebra Blinds",
  "roman-blinds": "Roman Blinds",
  "curtain-rails": "Curtain Rails",
  "ready-made": "Ready-made",
  "motorized-curtains": "Motorized Curtains",
};

/** Home tiles only — the set in the original category board, in that order. */
export const HOME_CATEGORY_TILES: Array<{
  slug: string;
  nameTh: string;
  nameEn: string;
}> = [
  { slug: "curtains", nameTh: "ผ้าม่าน", nameEn: "Curtain" },
  { slug: "roller-blinds", nameTh: "ม่านม้วน", nameEn: "Roller Blinds" },
  { slug: "wood-blinds", nameTh: "มู่ลี่ไม้", nameEn: "Wooden Venetian Blinds" },
  { slug: "aluminum-blinds", nameTh: "มู่ลี่อลูมิเนียม", nameEn: "Aluminium Venetian Blinds" },
  { slug: "vertical-blinds", nameTh: "ม่านปรับแสง", nameEn: "Vertical Blinds" },
  { slug: "pvc-folding-doors", nameTh: "ฉากกั้นห้อง - กันแอร์", nameEn: "Folding Door" },
  { slug: "noren", nameTh: "ม่านญี่ปุ่น ม่านพิมพ์ลาย", nameEn: "Print Curtain" },
  { slug: "wallpaper", nameTh: "วอลเปเปอร์", nameEn: "Wallpaper" },
];

export function categoryLabelEn(slug: string): string | null {
  return CATEGORY_LABEL_EN[slug] ?? null;
}

export function resolveCategoryImageUrl(category: CategoryDto): string | null {
  return (
    CATEGORY_IMAGE_BY_SLUG[category.slug] ??
    category.imageUrl?.trim() ??
    null
  );
}
