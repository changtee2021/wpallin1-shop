# Marketing PDF catalogs

ระบบแคตตาล็อกการตลาด (PDF) สำหรับให้ลูกค้าดูออนไลน์ และผูกกับสินค้าในหน้ารายละเอียด

เพิ่มใน commit `70611e4` (2026-06-24).

---

## Routes

| Zone | Path | Description |
|------|------|-------------|
| Storefront | `/catalogs` | รายการแคตตาล็อก + filter ตามหมวด |
| Storefront | `/catalogs/$id` | ดู PDF ใน iframe |
| Storefront | `/products/$slug` | แสดงแคตตาล็อกที่ผูกกับสินค้า |
| Admin | `/admin/catalogs` | CRUD หมวด, แคตตาล็อก, อัปโหลดไฟล์ |
| API | `POST /api/v1/catalog-asset` | อัปโหลด cover/PDF (admin only) |

เมนู storefront: **แคตตาล็อก** ใน header + mobile menu.

---

## Data model

Schema: `wpall_retail` (migration **pending** — see below)

### `marketing_catalog_categories`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `name` | TEXT | ชื่อหมวด |
| `sort_order` | INT | ลำดับแสดง |
| `is_active` | BOOL | ปิดไม่แสดง |

### `marketing_catalogs`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `category_id` | UUID | FK → categories (nullable) |
| `title` | TEXT | ชื่อแคตตาล็อก |
| `brand` | TEXT | แบรนด์ (optional) |
| `description` | TEXT | คำอธิบาย |
| `cover_image_url` | TEXT | รูปปก |
| `pdf_url` | TEXT | ลิงก์ PDF |
| `external_link` | TEXT | ลิงก์ภายนอก (optional) |
| `tags` | TEXT[] | แท็กค้นหา |
| `sort_order` | INT | ลำดับ |
| `is_public` | BOOL | แสดงบน storefront |
| `is_active` | BOOL | เปิดใช้งาน |

### `marketing_catalog_products`

| Column | Type | Notes |
|--------|------|-------|
| `catalog_id` | UUID | FK |
| `product_id` | UUID | FK → products |

---

## Storage

| Bucket | Access | Path pattern |
|--------|--------|--------------|
| `wpall-retail-catalogs` | Public read, admin write | `cover/{uuid}.ext`, `pdf/{uuid}.ext` |

Upload limits (`/api/v1/catalog-asset`):

- Max size: **25 MB**
- Types: JPEG, PNG, WebP, PDF
- Rate limit: 20 req/min per admin (เมื่อมี Upstash)

---

## บีบอัดไฟล์ก่อนอัปโหลด

PDF จากดีไซน์มักใหญ่มาก (100MB+) — **บีบอัดก่อน** เพื่อให้ flipbook โหลดเร็ว:

```bash
cd wpallin1-shop
npm run media:compress -- "path/to/catalog.pdf"
```

- แนะนำ output &lt; **25 MB** (แอดมินเตือน &gt; 25 MB, บล็อก &gt; 50 MB)
- รูปปกบีบอัดอัตโนมัติในเบราว์เซอร์เมื่ออัปโหลด
- วิดีโอ/เสียงใช้ CLI เดียวกัน (ต้องมี ffmpeg)

คู่มือเต็ม: **[docs/MEDIA-COMPRESS.md](./MEDIA-COMPRESS.md)**

---

## Admin workflow

1. เปิด `/admin/catalogs`
2. **หมวด** — สร้างหมวด (เช่น "ม่านจีบ", "มู่ลี่")
3. **เพิ่มแคตตาล็อก** — กรอกชื่อ, แบรนด์, คำอธิบาย
4. กด **อัปโหลด** สำหรับ cover และ PDF
5. เลือกสินค้าที่เกี่ยวข้อง (multi-select)
6. ตั้ง `เผยแพร่` (`is_public`) + `ใช้งาน` (`is_active`)
7. บันทึก → ตรวจที่ `/catalogs`

---

## Code map

| File | Role |
|------|------|
| `src/services/marketing-catalog.service.ts` | DB queries |
| `src/lib/server-fns/marketing-catalogs.ts` | Server functions |
| `src/types/api/marketing-catalogs.ts` | DTOs |
| `src/routes/_store.catalogs.tsx` | List page |
| `src/routes/_store.catalogs.$id.tsx` | PDF viewer |
| `src/routes/admin.catalogs.tsx` | Admin UI |
| `src/routes/api/v1/catalog-asset.ts` | Upload API |
| `src/components/storefront/marketing-catalog-grid.tsx` | Grid cards |
| `src/components/storefront/product-marketing-catalogs.tsx` | Product page links |

---

## Migration requirement

แอปพร้อมแล้ว แต่ **ต้องมี migration ใน wp-group-erp** ก่อนใช้งาน production:

```
20260627100000_wpall_retail_marketing_catalogs.sql
```

```powershell
cd "C:\Users\Admin\WP GROUP\wp-group-erp"
supabase db push
```

ดูสถานะ: `docs/MIGRATIONS.md`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| หน้าแคตตาล็อก error / ว่าง | Apply marketing catalogs migration |
| Upload 400/403 | ตรวจ admin role, ขนาดไฟล์, MIME type |
| PDF ไม่แสดงใน iframe | ตรวจ bucket public + URL ถูกต้อง; บาง browser block mixed content |
| ไม่เห็นในหน้าสินค้า | ผูก product ใน admin + `is_public` + `is_active` |

---

## Related

- `docs/ADMIN-GUIDE.md` — เมนูแอดมิน
- `docs/MIGRATIONS.md` — DDL list
- `CHANGELOG.md` — release note
