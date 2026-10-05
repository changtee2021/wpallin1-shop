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

ใช้ **IBM Plex Sans Thai** (400 / 500 / 600) เป็นฟอนต์หลักของทั้งเว็บ — เน้นเรียบ คลีน เนื้อหาน้ำหนักปกติ หัวข้อหนาขึ้นเล็กน้อย:

```css
--font-sans: "IBM Plex Sans Thai", ui-sans-serif, system-ui, sans-serif;
--font-weight-semibold: 500; /* font-semibold = medium */
--font-weight-bold: 600;     /* font-bold = semibold */
--font-document: "Sarabun", "TH Sarabun New", "Noto Sans Thai", sans-serif;
```

`font-document` (Sarabun) ใช้เฉพาะหน้าเอกสาร/ใบเสนอราคาที่ต้องพิมพ์ ไม่เปลี่ยนตามฟอนต์หลัก

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

## 5. Components (brand showcase, 2026)

เว็บเป็น **brand + product showcase ไม่แสดงราคา** (`VITE_COMMERCE_ENABLED=false`) ทุกปุ่มขายนำไป "ขอใบเสนอราคา" (`/contact?topic=quote`) หรือ LINE

### Editorial utilities (`src/styles.css`)

| Utility | ใช้ |
|---------|-----|
| `brand-display` | H1 ขนาดใหญ่ (hero / หัวหน้า) |
| `brand-heading` | H2 ของ section |
| `brand-kicker` | ป้ายเล็กตัวพิมพ์ใหญ่เหนือหัวข้อ — ต้องใส่สีเอง เช่น `text-primary` |
| `brand-index` | เลขลำดับ `01`–`05` แบบ tabular — ต้องใส่สีเอง |
| `brand-section` | padding แนวตั้งมาตรฐานของ section |
| `brand-marquee` | แถบเลื่อนวน (หยุดเมื่อ reduced motion) |
| `scroll-rise` / `scroll-zoom` | โมชันตอนเลื่อน: ลอยขึ้น+จางเข้า / รูปซูมออกตอนเข้าจอ (CSS scroll timeline ไม่มี JS) |
| `scroll-parallax` / `scroll-fade-away` | hero หน้าแรก: รูปเลื่อนช้ากว่า / ข้อความจางออกตอนเลื่อนลง |
| `bg-primary-deep` / `bg-surface` | พื้น teal เข้ม (footer, CTA band) / พื้นเทาอ่อน |

`SectionHeading`, `ProductCard`, `ProjectCard` มีโมชันในตัวแล้ว ไม่ต้องห่อ `RevealOnScroll` ซ้ำ

โมชันหน้าแรกแยกตาม section (CSS ล้วน, ปิดเมื่อ reduced motion, Firefox แสดงนิ่ง):

**ลำดับเรื่องหน้าแรก:** Hero → 01 Why WP ALL (`BrandStatement`) → 02 Our factory (`BrandFactory`, ขอบบนโค้งเลื่อนทับบทก่อน) → 03 Our products (`BrandProductRail`, รวมหมวด + สินค้าเด่นเป็นส่วนเดียว) → 04 Projects (`BrandProjectsBento`) → ช่องทางบ้าน/ตัวแทน → footer CTA

พื้นสลับ: ขาว → teal เข้ม → ครีม (`bg-cream`) → ขาว เพื่อให้แต่ละบทแยกกันชัด

**ระบบโมชันหน้าแรกใช้ 3 แบบเท่านั้น:** Reveal (`scroll-rise` + `--i`) สำหรับข้อความ/การ์ด · Mask (`scroll-wipe-up-soft` + `scroll-zoom` ข้างใน) สำหรับรูป · Scroll-linked เฉพาะ 3 จุด (hero, โรงงาน, rail สินค้า) อย่าเพิ่มชนิดใหม่ในหน้าแรก

| Section | คลาส | เอฟเฟกต์ |
|---------|------|----------|
| แถบบนสุด | `scroll-progress` | เส้นส้มบอกความคืบหน้าการเลื่อน |
| Hero | `hero-word` / `hero-blur-in` / `scroll-hero-card` | ข้อความเบลอเข้าทีละคำตอนโหลด · เลื่อนแล้ว hero พับเป็นการ์ดมุมโค้งเว้นขอบ |
| ประโยคเปิด + จุดเด่น 4 ข้อ | `scroll-word` · `scroll-rise` + `--i` | คำสว่างทีละคำ · ลอยขึ้นไล่ทีละข้อ |
| โรงงาน | `BrandFactory` (IntersectionObserver) | รูปตรึง ครอสเฟดตามขั้นตอน · ตัวเลขนับขึ้น |
| สินค้า | `pin-x` / `pin-x-stage` / `pin-x-viewport` / `pin-x-track` | desktop (≥1024px, สูง ≥680px): ตรึงส่วนนี้ เลื่อนลงแล้วการ์ดวิ่งไปซ้าย · มือถือ/Firefox: ปัดแนวนอนปกติ |
| ผลงาน | `scroll-wipe-up-soft` + `scroll-zoom` | กริด bento 1 ใหญ่ + 4 เล็ก รูปเปิดจากล่าง |
| บ้าน / ตัวแทน | `scroll-wipe-up-soft` + `--i` | กล่องภาพเปิดจากล่าง กล่องที่สองตามหลัง + รูปซูมออก |
| หน้า About | `scroll-hero-shrink` · `scroll-marquee-left/right` · `scroll-line-top` · `scroll-scale-in` | แถบสโลแกนวิ่งสวนทาง · เส้นส้มวาดตัวเอง · ตัวอักษร C-P-C ซูมเข้า |

### Header / footer

- ไม่มีแถบประกาศด้านบน
- Header `fixed`: หน้าแรกตอนบนสุดพื้นใส (ทับ hero) · หน้าอื่นตอนบนสุดพื้น teal · เลื่อนลงเกิน 24px กลายเป็นแถบลอยทรงแคปซูล (teal เข้มกว่า `primary-deep` + ring ขาว 20% + blur ให้แยกจากพื้นบทโรงงาน) ตามลงมา
- Nav: สินค้า | ผลงาน | เกี่ยวกับเรา | แคตตาล็อก | ติดต่อ (`SITE_NAV`) + dropdown ภาษา (TH ▾) + ปุ่มส้ม "Contact Us" → `/contact`
- กระดิ่ง/ตะกร้า/บัญชี แสดงเฉพาะเมื่อเปิด commerce
- Footer: CTA band (ribbon) → คอลัมน์หมวดสินค้า / บริษัท / ติดต่อ + LINE QR

Implementation: `src/components/layout/storefront-header.tsx`, `storefront-footer.tsx`

### Shared brand components (`src/components/brand/`)

- `SectionHeading` — "01 — KICKER" + หัวข้อใหญ่ + คำอธิบาย + action ขวา (`tone="dark"` บนพื้น teal)
- `ProductCard` — รูป 4:5, รหัสรุ่น, ชื่อ, tagline (ไม่มีราคา)
- `ProjectCard` — รูป 4:3, ประเภท · สถานที่ · ปี
- `BrandGridSkeleton` / `BrandPageError` — loading / error ของหน้า

### Home sections

`src/components/storefront/home/brand-home-sections.tsx`: Hero crossfade → USP strip → Category index (hover เปลี่ยนรูป) → Story + ตัวเลข → สินค้าแนะนำ → ผลงาน (scroll-snap) → แยกทาง บ้าน / ตัวแทน

### Data

ข้อมูลสินค้า/ผลงานเป็น static สองภาษา (`Bi = { th, en }`, `useBi()`):
`src/data/products-catalog.ts`, `src/data/projects.ts`, `src/data/about-content.ts`
รูปเป็น crop จากสไลด์ WP ALL 2026 (`public/products`, `public/projects`, `public/brand/factory-*`) — **placeholder** รอรูปถ่ายจริง

### Certifications

ซ่อนไว้ทั้งหมดจนกว่าทีมยืนยันว่าข้อใดใช้ได้จริง (ISO, มอก., OEKO-TEX, SGS, ประกัน ฯลฯ)

### Skeleton loading

- ทุกหน้าต้องมี skeleton ขณะโหลด — ดู [`docs/SKELETON-LOADING.md`](SKELETON-LOADING.md)

### Buttons

| ประเภท | Style |
|--------|-------|
| Primary CTA (ขอใบเสนอราคา) | `rounded-full bg-accent text-white hover:bg-accent/90`, สูง ≥ 44px |
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
| ฟอนต์ | DB Heavent | IBM Plex Sans Thai ✅ |
| Layout home | brand showcase | `brand-home-sections.tsx` ✅ |
| Header | teal bar | ใสบน hero → แถบลอยเมื่อเลื่อน ✅ |

### Follow-up checklist

- [ ] โหลด webfont DB Heavent (ถ้ามี license) แทน/เสริม IBM Plex Sans Thai
- [ ] เปลี่ยนรูป placeholder (crop จากสไลด์) เป็นรูปถ่ายจริง
- [ ] ยืนยัน certification ที่ใช้ได้ แล้วค่อยเปิดแสดง
- [ ] อัปเดต `CHECKPOINT-1.md` ให้ตรง CI (เลิกอ้าง accent `#2563eb`)

---

## References

- CI Brand Guide Board (internal)
- Mobile app mockup — home, categories, best selling, popular products
- Code: `src/styles.css`, `src/components/storefront/*`, `src/components/layout/storefront-header.tsx`
