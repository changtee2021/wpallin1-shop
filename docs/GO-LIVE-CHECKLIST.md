# Go-live checklist — wpallin1-shop

ใช้ก่อนเปิดร้าน production จริง (หรือ promote deploy สำคัญ)

Production URL: **https://wpallin1-shop.vercel.app**

---

## 1. Database & migrations

- [ ] `supabase db push` จาก `wp-group-erp` สำเร็จ ไม่มี error
- [ ] Migration ทั้งหมดใน `docs/MIGRATIONS.md` ถูก apply แล้ว
- [ ] **Marketing catalogs** migration (`20260627100000_wpall_retail_marketing_catalogs.sql`) มีใน repo และ apply แล้ว
- [ ] ตรวจตารางหลัก: `products`, `orders`, `profiles`, `site_settings`
- [ ] Storage buckets: `wpall-retail-products`, `wpall-retail-payment-slips`, `wpall-retail-catalogs`

---

## 2. Environment (Vercel Production)

- [ ] `VITE_SUPABASE_*` + `SUPABASE_*` ครบ
- [ ] `VITE_SUPABASE_SCHEMA` = `wpall_retail`
- [ ] `VITE_APP_PUBLIC_URL` = `https://wpallin1-shop.vercel.app`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ตั้งเฉพาะ server env
- [ ] `RESEND_API_KEY` + `EMAIL_FROM` (domain verified)
- [ ] `INTEGRATIONS_ENABLED=true`
- [ ] `UPSTASH_REDIS_REST_*` (แนะนำสำหรับ rate limit)

รายละเอียด: `docs/ENV.md`

---

## 3. Supabase Auth

- [ ] Site URL + Redirect URLs รวม production และ preview domains
- [ ] อ้างอิง `wp-group-erp/docs/SUPABASE-AUTH-VERCEL-URLS.md`
- [ ] เปิด Leaked password protection (แนะนำ)
- [ ] สร้าง admin test account + กำหนด role `admin` / `super_admin`

---

## 4. Content & catalog

- [ ] สินค้าจริง: รูป, ราคา, สต็อก, slug, หมวดหมู่
- [ ] ตั้งค่าร้าน: `/admin/settings` (ธนาคาร, PromptPay, ข้อความ)
- [ ] หน้ากฎหมาย: privacy, terms, refund (ไม่ใช่ placeholder)
- [ ] แคตตาล็อก PDF อัปโหลดและทดสอบ `/catalogs` + ลิงก์จากหน้าสินค้า
- [ ] ลบหรือปิด mock QA products ถ้าไม่ต้องการแสดง

---

## 5. Commerce flows (manual QA)

- [ ] Guest: ดูสินค้า → ใส่ตะกร้า → checkout โอน → อัปโหลดสลิป
- [ ] Member: ล็อกอิน → ราคา tier → ชำระ wallet
- [ ] Admin: อนุมัติสลิป → อัปเดตสถานะ order
- [ ] ใบเสนอราคา: ขอ → ส่ง → accept → convert
- [ ] Wallet top-up: ขอ → แอดมินอนุมัติ
- [ ] B2B: อัปโหลด KYC → เปิดเครดิต (ถ้าใช้)
- [ ] ตัวเลือกสินค้า (สี/ขนาด): เลือก → ตะกร้า → checkout สะท้อนตัวเลือกถูกต้อง

---

## 6. Build & deploy

- [ ] `npm run build` ผ่าน
- [ ] `vercel deploy --prod --yes`
- [ ] `GET /api/public/health` → OK
- [ ] `npm run test:smoke` ผ่าน (optional แต่แนะนำ)

ดู `docs/DEPLOY.md`, `docs/e2e-smoke.md`

---

## 7. Security & ops

- [ ] Vercel Firewall rules — `docs/VERCEL-WAF-RUNBOOK.md`
- [ ] CSP: ตรวจ report-only แล้ว enforce เมื่อไม่มี violation
- [ ] Supabase security advisor — `docs/SUPABASE-SECURITY-NOTES.md`
- [ ] ไม่ commit `.env` หรือ service role key

---

## 8. SEO & monitoring

- [ ] `sitemap.xml` / `robots.txt` ทำงาน
- [ ] OG image / meta หน้าหลักและสินค้า
- [ ] ตั้ง monitoring ใน wpgroup-portal (ถ้าใช้ infra schema)

---

## Known gaps (post-launch backlog)

รายการที่อาจยังไม่ครบ end-to-end — ติดตามใน issue/roadmap:

| หัวข้อ | สถานะ |
|--------|--------|
| Product options ใน order line items | ตรวจ E2E ก่อน go-live |
| Stock decrement อัตโนมัติหลัง checkout | ตรวจ business rule |
| English i18n ครบทุกหน้า | บางหน้ายัง TH-first |
| Header teal ตาม CI mockup | ดู `docs/design.md` |
| DB Heavent webfont | รอ license |

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| Dev | | |
| Ops / Admin | | |
| Business | | |

---

## Related

- `docs/DEPLOY.md`
- `docs/MIGRATIONS.md`
- `docs/ADMIN-GUIDE.md`
- `CHANGELOG.md`
