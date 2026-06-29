# WP ALL — Design System (wpallin1-shop)

เอกสารนี้อ้างอิง **CI Brand Guide Board** และ mockup mobile app ของ WP ALL  
ใช้เป็นมาตรฐานสำหรับ storefront, admin UI และ asset ใหม่ทั้งหมด

---

## 1. Brand identity

| หัวข้อ | ค่า |
|--------|-----|
| Brand name | **WP ALL** (WP All-in-1) |
| Tagline | WP all in one – Home Decoration |
| Vision | CENTER OF CURTAIN |
| Mission | WP have no competitors, only business partners |
| Value | Complete home decoration solution (ผ้าม่าน + มู่ลี่ + อุปกรณ์ครบ) |
| Voice & tone | มืออาชีพ น่าเชื่อถือ เป็นมิตร ไม่ทางการเกินไป |

### Logo usage

- **Main mark:** ตัว W แบบ ribbon/overlap + ลูกศรชี้ขึ้น + คำว่า **All**
- **App icon:** วงกลมพื้น teal + logo สีขาว
- **Do:** ใช้บนพื้นขาว / พื้น teal / พื้น orange ตาม guide
- **Don't:** เปลี่ยนสี logo แบบสุ่ม, บีบ/ยืด, วางบนพื้นที่ contrast ต่ำ

### Assets in repo

| File | Use |
|------|-----|
| `/brand/logo-color.png` | Header, hero, marketing |
| `/brand/logo-mono-dark.png` | Favicon, mono contexts |

---

## 2. Color palette

### Primary — Teal (มืออาชีพ / header / navigation)

| Token | Hex (brand) | ใช้ใน app |
|-------|-------------|-----------|
| Teal 500 | `#188F8B` | `--primary`, header, links, section titles |
| Teal light | `#E8F5F4` | secondary backgrounds, chips |
| Teal dark | `#126B68` | hover states, footer accents |

### Accent — Orange (CTA / ราคา / active state)

| Token | Hex (brand) | ใช้ใน app |
|-------|-------------|-----------|
| Orange 500 | `#E7847E` | `--accent`, ปุ่มซื้อ, ราคา, badge |
| Orange light | `#FCEEEA` | highlight backgrounds |
| Orange dark | `#D46A5F` | hover บนปุ่ม accent |

### Neutrals

| Token | Hex | ใช้ |
|-------|-----|-----|
| Background | `#FFFFFF` | การ์ด, body |
| Surface muted | `#F1F1F1` | พื้นหลัง section / page |
| Text primary | `#1A1516` | หัวข้อ, body |
| Text muted | `#6B7280` | คำอธิบายรอง |
| Border | `#E5E7EB` | เส้นแบ่ง, input |

### Semantic mapping (Tailwind / shadcn)

Canonical tokens live in `src/styles.css`:

```css
--primary      → Teal (brand)
--accent       → Orange (brand)
--background   → White
--muted        → Light grey sections
--destructive  → Error / ลบ (คงแดงระบบ)
```

Current oklch values (light mode):

```css
--primary: oklch(0.518 0.078 180.5);   /* ≈ #188F8B */
--accent:  oklch(0.738 0.157 54.8);    /* ≈ #E7847E */
```

> **กฎ:** อย่า hardcode hex ใน component ใหม่ — ใช้ `bg-primary`, `text-accent`, `bg-muted` แทน

---

## 3. Typography

### Brand fonts (จาก CI)

| ระดับ | Font | ใช้ |
|-------|------|-----|
| Display / Heading | **DB Heavent** Bold/Medium | Hero, H1–H2 (เมื่อมี license/webfont) |
| Body | **DB Heavent** Regular | ข้อความทั่วไป |
| Accent labels | FC Friday / FC SaveSpace / FC Motorway | badge, promo (marketing เท่านั้น) |

### Web fallback (ปัจจุบันใน `src/styles.css`)

```css
--font-sans: "Inter", "IBM Plex Sans Thai", "Noto Sans Thai", system-ui, sans-serif;
--font-document: "Sarabun", "TH Sarabun New", "Noto Sans Thai", sans-serif;
```

### Type scale (mobile-first)

| Element | Size | Weight |
|---------|------|--------|
| H1 (page) | 24–30px | Bold |
| H2 (section) | 18–20px | Bold, `text-primary` |
| Body | 14–16px | Regular |
| Caption | 12px | Medium |
| Price | 16–18px | Bold, `text-accent` |

---

## 4. Layout & spacing

- **Max width:** `max-w-7xl` (storefront), `max-w-3xl` (content pages)
- **Page padding:** `px-4 sm:px-6`, `py-6 sm:py-8`
- **Section gap:** `space-y-10 lg:space-y-14`
- **Card radius:** `--radius: 0.625rem` (10px); การ์ดใหญ่ใช้ `rounded-xl` / `rounded-2xl`
- **Grid:**
  - หมวดหมู่: 2 columns (mobile mockup)
  - สินค้ายอดนิยม: 2 columns
  - Best selling: horizontal scroll carousel

---

## 5. Components (ตาม mockup mobile)

### Header

- พื้น **primary (teal)** หรือ white + border ตาม zone
- Logo ซ้าย, search กลาง/ขวา, cart + notification ขวา
- แถว nav ล่าง (desktop): หน้าแรก | ร้านค้า | แคตตาล็อก | สั่งทำผ้าม่าน | เกี่ยวกับเรา

Implementation: `src/components/layout/storefront-header.tsx`

### Hero / Promo banner

- รูปโปรโมชัน + coupon/QR (เมื่อมี campaign)
- ปุ่ม CTA ใช้ `bg-accent`

Implementation: `src/components/storefront/home/home-hero.tsx`

### Category card

- การ์ดสี่เหลี่ยม, ไอคอน line-art ซ้าย, รูปตัวอย่างจางขวา
- หมวดตัวอย่าง: ฉากกั้นห้อง, รางมอเตอร์, มู่ลี่, รางโชว์, ม่านม้วน, ม่านจีบ ฯลฯ

Implementation: `src/components/storefront/category-rail.tsx`

### Product card

- รูปใหญ่, ชื่อ 2 บรรทัด, ราคา `text-accent`
- Badge โปร / featured ใช้ `bg-accent text-white`
- Hover: `group-hover:text-primary`

Implementation: `src/components/storefront/product-card.tsx`

### Section header

- หัวข้อซ้าย + แถบ accent สีส้มแนวตั้ง (ตาม mockup “สินค้ายอดนิยม”)
- ปุ่ม “VIEW ALL” = `variant="outline"` + border accent

### Certifications row

- ไอคอน + label สั้น ๆ (OEKO-TEX, Greenguard, Anti-bacterial ฯลฯ)
- จัดเป็น 2 แถว grid บน mobile

### Bottom navigation (mobile)

- 4 ไอเทม: หน้าแรก | สินค้า/แคตตาล็อก | เครื่องมือ/คำนวณ | บัญชี
- Active = `text-accent`, inactive = muted

### Skeleton loading

- ทุกหน้าต้องมี skeleton ขณะโหลด — ดู [`docs/SKELETON-LOADING.md`](SKELETON-LOADING.md)

### Buttons

| ประเภท | Style |
|--------|-------|
| Primary CTA (ซื้อ/ชำระ) | `bg-accent hover:bg-accent/90` |
| Secondary | `variant="outline"` |
| Nav / link | `text-primary hover:text-primary/80` |

### Forms

- Input สูง `h-11` บน mobile
- Label ชัด, error เป็นข้อความไทยเข้าใจง่าย

---

## 6. Pattern & decoration

- **Brand pattern:** diagonal ribbons teal + orange (จาก logo W)
- ใช้เบา ๆ ใน hero, footer, marketing — **อย่า**ทับข้อความสำคัญ
- พื้นหลัง section ทั่วไปใช้ `bg-muted/30` หรือ `#F1F1F1`

---

## 7. Imagery

- รูปสินค้า: สว่าง, พื้นห้องจริง, เน้นผ้าม่าน/มู่ลี่
- Placeholder: gradient อ่อน (ดู `product-image.tsx`)
- แคตตาล็อก PDF: cover 4:3, ชื่อแบรนด์ + หมวด

---

## 8. Accessibility

- Contrast ขั้นต่ำ WCAG AA สำหรับข้อความบน primary/accent
- ปุ่ม icon ต้องมี `aria-label`
- ราคา/CTA ไม่พึ่งสีอย่างเดียว — มีตัวเลข/ข้อความชัด

---

## 9. Do / Don't

**Do**

- ใช้ teal สำหรับ brand/nav, orange สำหรับ action/price
- spacing โปร่ง, การ์ดมี shadow เบา
- ภาษาไทยเป็นหลัก, EN เป็นรอง

**Don't**

- ใช้สีน้ำเงิน `#2563eb` (ของ Phase 1 เก่า — ไม่ตรง CI)
- ปุ่ม CTA หลายสีในหน้าเดียว
- ฟอนต์หนาแน่นเกินไปบน mobile

---

## 10. Gap vs current implementation

| เรื่อง | CI จากภาพ | โค้ดปัจจุบัน |
|--------|-----------|--------------|
| สีหลัก | Teal `#188F8B` | `--primary` teal ใน `styles.css` ✅ |
| สี accent | Orange `#E7847E` | `--accent` orange ใน `styles.css` ✅ |
| ฟอนต์ | DB Heavent | Inter + IBM Plex Sans Thai ⚠️ |
| Layout home | category grid + carousel | `CategoryRail` + `ProductFeed` — ยังไม่เหมือน mockup 100% |
| Header | teal bar | header เป็น white ⚠️ |

### Follow-up checklist

- [ ] โหลด webfont DB Heavent (ถ้ามี license) แทน/เสริม Inter
- [ ] ปรับ home ให้ใกล้ mockup: category grid 2 คอลัมน์, best-selling carousel
- [ ] Header mobile: teal bar + bottom nav active state สีส้ม
- [ ] อัปเดต `CHECKPOINT-1.md` ให้ตรง CI (เลิกอ้าง accent `#2563eb`)
- [ ] เพิ่ม asset pattern/ribbon ใน `/public/brand/`

---

## References

- CI Brand Guide Board (internal)
- Mobile app mockup — home, categories, best selling, popular products
- Code: `src/styles.css`, `src/components/storefront/*`, `src/components/layout/storefront-header.tsx`
