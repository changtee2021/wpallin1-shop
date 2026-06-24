# Marketing PDF catalogs (E-book Viewer)

ระบบแคตตาล็อกการตลาด (PDF) — อ่านบนเว็บแบบ E-book (mobile scroll + desktop pro viewer)

---

## Routes

| Zone | Path | Description |
|------|------|-------------|
| Storefront | `/catalogs` | รายการ + ค้นหา + filter หมวด + การ์ด premium |
| Storefront | `/catalogs/$slug` | E-book viewer (`?page=10` deep link) |
| Storefront | `/catalogs/$uuid` | Redirect → slug (legacy) |
| Storefront | `/products/$slug` | แคตตาล็อกที่ผูกกับสินค้า |
| Admin | `/admin/catalogs` | CRUD + upload + visibility/status |
| API | `POST /api/v1/catalog-asset` | อัปโหลด cover/PDF (admin only) |

---

## Viewer modes

| Device | Mode |
|--------|------|
| Mobile | Vertical scroll + lazy page render |
| Desktop | Thumbnail sidebar + pro toolbar (default) |
| Desktop | Optional flipbook toggle |

Sticky CTA: **ขอใบเสนอราคา** + **ทัก LINE** (`VITE_LINE_OA_URL`, default `https://lin.ee/vopHClz`)

---

## Data model (v2)

Schema: `wpall_retail`

Migrations:
- `20260627110000_wpall_retail_marketing_catalogs.sql`
- `20260627120000_wpall_retail_catalog_bucket_limit.sql`
- **`20260628100000_wpall_retail_marketing_catalogs_v2.sql`** — slug, visibility, status, analytics

Key fields on `marketing_catalogs`:
- `slug`, `version`, `page_count`, `file_size`
- `visibility`: `public` | `dealer` | `private`
- `status`: `draft` | `published` | `archived`
- `allow_download`, `is_featured`, `pdf_storage_path`

Analytics: `marketing_catalog_views`

---

## Stable PDF URL

เมื่อมี `catalogId` แล้ว อัปโหลด PDF จะ upsert ที่ `pdf/{catalogId}.pdf` — URL ไม่เปลี่ยนเมื่อ replace

---

## Phase 2 features

- **In-catalog search** — search text inside PDF, jump to page
- **View analytics** — admin list shows 7d / 30d / all-time views
- **Dealer-only catalogs** — lock screen + register/login CTA
- **Flipbook preference** — persisted in localStorage on desktop
- **SEO** — OG meta on viewer, public catalogs in sitemap


```powershell
cd "C:\Users\Admin\WP GROUP\wp-group-erp"
supabase db push
```

---

## Code map

| File | Role |
|------|------|
| `src/components/storefront/catalog-viewer.tsx` | Viewer shell |
| `src/components/storefront/catalog-scroll-viewer.tsx` | Mobile |
| `src/components/storefront/catalog-pro-viewer.tsx` | Desktop |
| `src/components/storefront/catalog-flipbook.tsx` | Optional flipbook |
| `src/lib/pdf-to-pages.ts` | pdfjs-dist render |
| `src/services/marketing-catalog.service.ts` | DB queries |
| `docs/MEDIA-COMPRESS.md` | บีบอัด PDF ก่อนอัปโหลด |
