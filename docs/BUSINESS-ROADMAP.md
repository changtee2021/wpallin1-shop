# WP ALL — Business & Product Roadmap

เอกสารนี้สรุปทิศทางธุรกิจ การตลาด และลำดับงานบน **wpallin1-shop**  
อ้างอิงการตอบแบบสอบถาม (มิ.ย. 2026) และสถานะโค้ดปัจจุบัน

---

## สรุปการตอบ (Decision log)

| หัวข้อ | คำตอบ |
|--------|--------|
| โฟกัส 3 เดือนแรก | **สมดุลทั้ง 3 กลุ่ม** — พื้นฐานร่วมก่อน |
| Inspiration (Pinterest + tag) | **Phase 1 ทันที** — จุดขายหลัก |
| B2B เดิม | **มีเยอะ สั่งนอกเว็บ** (LINE/โทร) เป็นหลัก |
| สัดส่วนสินค้า | **Custom + พร้อมส่ง ครึ่งหนึ่งครึ่งหนึ่ง** |
| ทีม | **มีทีมขาย/แอดมิน** — เว็บรองรับ workflow ได้ |

---

## Positioning (จุดยืน)

**ข้อความหลัก:**

> โรงงานผลิตม่านครบวงจร — สั่ง Custom ได้จริง ราคาโรงงาน บริการทั้งปลีกและตัวแทน

**Brand (จาก CI):**

- Vision: CENTER OF CURTAIN
- Mission: WP have no competitors, only business partners
- Tagline: ศูนย์กลางผ้าม่าน — ครบวงจร

**อย่าแข่ง:** marketplace เรื่องราคาถูกสุด  
**ให้ชนะที่:** โรงงานจริง + Custom จริง + B2B tools จริง

---

## กลุ่มลูกค้า & Journey

### B2C ปลีก

```
Inspiration / หน้าแรก → เลือก mood หรือหมวด → Configurator หรือสินค้าพร้อมส่ง
→ ใบเสนอราคา (งานใหญ่) หรือ Checkout (งานเล็ก) → ติดตาม order
```

### B2B ร้านม่าน / ช่าง

```
สมัครตัวแทน → Dealer portal → Quick order SKU / แคตตาล็อก dealer-only
→ Quotation ให้ลูกค้าปลายทาง → Wallet / เครดิต → Reorder
```

**เป้าหมายเร่งด่วน:** ย้ายร้านที่สั่ง LINE/โทรเข้าเว็บ — ลดงานแอดมินซ้ำ

### โครงการ

```
หน้า commercial → ติดต่อทีมขาย → Quotation → Assisted order → ติดตาม lead time
```

---

## สิ่งที่มีในเว็บแล้ว (ใช้เป็นจุดขาย)

| โมดูล | ไฟล์อ้างอิง |
|--------|-------------|
| Configurator custom + ราคา real-time | `configurator-wizard.tsx`, `configurator.service.ts` |
| Smart search ภาษาไทย | `smart-search.service.ts` |
| Marketing PDF catalogs | `docs/marketing-catalogs.md` |
| Quotation flow | `docs/ARCHITECTURE.md` |
| Quick order SKU + price list | `_store.quick-order.tsx` |
| Dealer portal + wallet + tier | `/dealer/*` |
| Assisted order | `checkout.service.ts` |

---

## ลำดับงาน (Prioritized backlog)

### Sprint 1 — พื้นฐาน + ข้อความ (ทำแล้วในรอบนี้)

| # | งาน | สถานะ |
|---|-----|--------|
| 1 | เอกสาร roadmap นี้ | ✅ |
| 2 | ปรับ homepage — 3 เสาหลัก (โรงงาน / Custom / ตัวแทน) | ✅ |
| 3 | Nav + CTA ตัวแทนจำหน่ายเด่นขึ้น | ✅ |
| 4 | Configurator — แชร์ลิงก์แบบ (URL params) | ✅ |
| 5 | Inspiration Board v1 — schema + หน้าร้าน + admin พื้นฐาน | ✅ |

### Sprint 2 — B2B migration (สัปดาห์ 2–4)

| # | งาน | รายละเอียด |
|---|-----|-------------|
| 6 | Onboard ร้านเดิม | ทีมขายชวนสมัคร `/dealer/register` + สอน quick order |
| 7 | Price list + SKU sheet | ส่งลิงก์ `/quick-order` ให้ร้านที่เคยสั่ง LINE |
| 8 | Dealer-only catalogs | อัปโหลดแคตตาล็อกเฉพาะตัวแทน |
| 9 | Reorder จากประวัติ order | ปุ่มสั่งซ้ำใน dealer portal |

### Sprint 3 — Inspiration เต็มรูปแบบ (เดือน 2)

| # | งาน |
|---|-----|
| 10 | อัปโหลดภาพ 20–30 ชุด + tag สินค้า/ผ้า |
| 11 | Filter mood / style / ห้อง |
| 12 | ปุ่ม "ใช้แบบนี้" → pre-fill Configurator |
| 13 | KPI: click hotspot → product / configurator |

### Sprint 4 — โครงการ + SEO (เดือน 2–3)

| # | งาน |
|---|-----|
| 14 | Case study landing (โรงแรม/คอนโด) |
| 15 | SEO: "ม่านสั่งทำ", "ม่านมอเตอร์", "ม่านโรงงาน" |
| 16 | Configurator export PDF spec สำหรับช่างวัด |

---

## การตลาดตามกลุ่ม

### B2C

- **Content:** before/after, room tour, inspiration board
- **ช่องทาง:** Facebook, TikTok, LINE OA, Google SEO
- **CTA บนเว็บ:** `/inspiration`, `/configurator`, ขอใบเสนอราคา

### B2B

- **ข้อความ:** "ร้านม่านสั่งจากโรงงานโดยตรง — ไม่ต้องสต็อกทุกอย่าง"
- **ช่องทาง:** ทีมขายเดิม, งานแสดงสินค้า, QR สมัครตัวแทน
- **CTA:** `/dealer/register`, `/quick-order`, dealer catalogs

### โครงการ

- Case study + quotation template
- ทีมขาย human touch + assisted order

---

## KPI ที่ควรวัด

| กลุ่ม | Metric |
|-------|--------|
| B2C | Inspiration → product clicks, Configurator starts → cart, Quotation requests |
| B2B | Active dealers/month, Quick order frequency, % order จากเว็บ vs LINE |
| ทั้งหมด | Repeat rate, conversion ต่อช่องทาง |

---

## Inspiration Board — โมเดลข้อมูล

Migration: `wp-group-erp/supabase/migrations/20260629130000_wpall_retail_inspiration_rooms.sql`

| ตาราง | ใช้ทำอะไร |
|--------|-----------|
| `inspiration_rooms` | ภาพห้อง + slug + tags (style, mood, room_type) |
| `inspiration_hotspots` | จุด tag บนภาพ (% x,y) → product / fabric / configurator type |

**Admin:** `/admin/inspiration`  
**Storefront:** `/inspiration`, `/inspiration/$slug`

---

## Configurator share link

รูปแบบ URL:

```
/configurator?type=pleated&fabric=<uuid>&w=200&h=220&rail=<key>&install=<key>
```

ใช้แชร์ให้ลูกค้า/ช่างเปิดแบบเดิมได้โดยไม่ต้องบันทึก DB

---

## Apply migration

```powershell
cd "C:\Users\Admin\WP GROUP\wp-group-erp"
supabase db push
```

---

## อ้างอิง

- `docs/design.md` — CI และ brand voice
- `docs/ARCHITECTURE.md` — โซน route และ quotation
- `docs/marketing-catalogs.md` — แพทเทิร์น content marketing
