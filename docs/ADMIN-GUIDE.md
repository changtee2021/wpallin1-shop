# Admin guide — wpallin1-shop

ภาพรวมการใช้งานหลังบ้าน (Admin) สำหรับทีม WP ALL

**URL:** `https://wpallin1-shop.vercel.app/admin`  
**สิทธิ์:** ผู้ใช้ที่มี role `admin` หรือ `super_admin` ใน `wpall_retail.user_roles`

---

## เข้าสู่ระบบ

1. ล็อกอินที่ `/login`
2. เปิด **แอดมิน** จากเมนู header, bottom nav (More), หรือ `/admin`
3. ถ้าไม่เห็นเมนูแอดมิน — ตรวจ role ใน Supabase หรือขอ super admin เพิ่มสิทธิ์

---

## เมนูแอดมิน

| เมนู | Path | ใช้ทำอะไร |
|------|------|-----------|
| ภาพรวม | `/admin` | Dashboard สรุป |
| คำสั่งซื้อ | `/admin/orders` | ดู/อัปเดตสถานะ order, ตรวจสลิป |
| สั่งซื้อแทน | `/admin/sales-order` | Staff สั่งซื้อแทนลูกค้า (assisted order) |
| ใบเสนอราคา | `/admin/quotations` | สร้าง/ส่ง/แปลงใบเสนอราคาเป็น order |
| กระเป๋าเงิน | `/admin/wallet` | อนุมัติ top-up, ปรับยอด wallet |
| เครดิต | `/admin/credit` | B2B เครดิต, ใบแจ้งหนี้ |
| สมาชิก | `/admin/members` | โปรไฟล์ลูกค้า, tier, สถานะบัญชี |
| ระดับ/Tier | `/admin/tiers` | ตั้งค่าระดับสมาชิก + ราคาพิเศษ |
| ตัวแทน | `/admin/dealers` | จัดการ dealer / affiliate |
| ติดต่อ/Feedback | `/admin/support` | Ticket และ feedback จากลูกค้า |
| คูปอง/โปร | `/admin/coupons` | สร้างคูปองส่วนลด |
| สต็อก | `/admin/inventory` | ดู/ปรับสต็อกสินค้า |
| รายงาน | `/admin/reports` | รายงานยอดขาย |
| สินค้า | `/admin/products` | CRUD สินค้า, รูป, ตัวเลือก |
| แคตตาล็อก PDF | `/admin/catalogs` | อัปโหลดแคตตาล็อกการตลาด — ดู `docs/marketing-catalogs.md` |
| หมวดหมู่ | `/admin/categories` | จัดการหมวดสินค้า |
| ตั้งค่า | `/admin/settings` | ข้อมูลร้าน, การชำระเงิน, ข้อความ |

---

## Workflow หลัก

### คำสั่งซื้อ (Order)

```text
pending_payment → awaiting_payment_verification → paid → confirmed → … → completed
```

1. ลูกค้าชำระโอน → อัปโหลดสลิปที่ `/account` หรือ checkout
2. แอดมินตรวจสลิปที่ **คำสั่งซื้อ** → อนุมัติการชำระ
3. อัปเดตสถานะผลิต/จัดส่งตาม workflow

ชำระด้วย **wallet** — หักยอดอัตโนมัติเมื่อ checkout สำเร็จ

### ใบเสนอราคา (Quotation)

```text
draft → sent → accepted / rejected → converted (order)
```

1. ลูกค้าขอใบเสนอราคาจากตะกร้า หรือแอดมินสร้างใหม่
2. ส่ง (`sent`) ให้ลูกค้ายืนยัน
3. เมื่อ `accepted` → แปลงเป็น order

### กระเป๋าเงิน (Wallet top-up)

1. ลูกค้าขอเติมเงิน + แนบสลิป
2. แอดมินอนุมัติที่ **กระเป๋าเงิน**
3. ยอดเข้า wallet ของลูกค้า

### สมาชิก B2B / เครดิต

- ลูกค้านิติบุคคลอัปโหลด KYC ที่ `/account`
- แอดมินตรวจเอกสาร + เปิดวงเงินเครดิตที่ **เครดิต**
- ราคาสัญญา/wholesale ผูกกับ tier และ member pricing

### สินค้า

- **สินค้า** → สร้าง/แก้ไข ราคา, สต็อก, รูป, slug
- **ตัวเลือกสินค้า** (สี, ขนาด ฯลฯ) — ตั้งใน product edit
- **หมวดหมู่** — จัดลำดับและ slug สำหรับ `/shop`

### แคตตาล็อก PDF (Marketing)

ดูคู่มือเต็ม: `docs/marketing-catalogs.md`

1. ไป **แคตตาล็อก PDF**
2. สร้างหมวด (ถ้ายังไม่มี)
3. เพิ่มแคตตาล็อก → อัปโหลด cover + PDF (แนะนำ PDF &lt; 25 MB หลังบีบอัด — ดู `docs/MEDIA-COMPRESS.md`)
4. ผูกสินค้าที่เกี่ยวข้อง (แสดงลิงก์ในหน้ารายละเอียดสินค้า)
5. ตั้ง `is_public` + `is_active` ก่อนเผยแพร่

---

## อัปโหลดไฟล์

| ประเภท | ขนาดสูงสุด | รูปแบบ |
|--------|------------|--------|
| รูปสินค้า | ตาม product upload API | JPEG, PNG, WebP |
| สลิปชำระเงิน | ตาม payment-slip API | รูป/PDF |
| แคตตาล็อก cover/PDF | แนะนำ PDF &lt; 25 MB (บล็อก &gt; 50 MB) | JPEG, PNG, WebP, PDF |

บีบอัดก่อนอัปโหลด: `npm run media:compress` — ดู **`docs/MEDIA-COMPRESS.md`**

อัปโหลดแคตตาล็อกต้องล็อกอินแอดมิน (Bearer token) — ทำผ่าน UI ใน `/admin/catalogs`

---

## สิทธิ์และความปลอดภัย

- RLS บังคับที่ Supabase — แอดมินใช้ session ของตัวเอง + server fn ตรวจ role
- `SUPABASE_SERVICE_ROLE_KEY` ใช้เฉพาะ server — ห้ามใส่ใน client
- ระหว่าง migration ตั้ง `INTEGRATIONS_ENABLED=false` ชั่วคราวได้

Security notes: `docs/SUPABASE-SECURITY-NOTES.md`

---

## แก้ปัญหาเบื้องต้น

| อาการ | ตรวจ |
|-------|------|
| 404 / ว่างหน้าแคตตาล็อก | Migration marketing catalogs ยังไม่ push — `docs/MIGRATIONS.md` |
| อัปโหลดแคตตาล็อกล้มเหลว | Bucket `wpall-retail-catalogs` + RLS; ขนาดไฟล์ |
| ลูกค้าไม่ได้รับอีเมล | `RESEND_API_KEY`, `EMAIL_FROM`, domain verify |
| 403 แอดมิน | `user_roles` ไม่มี admin/super_admin |

---

## Related

- `docs/marketing-catalogs.md` — แคตตาล็อก PDF
- `docs/ARCHITECTURE.md` — โครงสร้างโมดูล
- `docs/e2e-smoke.md` — smoke test หลัง deploy
