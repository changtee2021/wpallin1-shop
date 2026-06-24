# Media compression — บีบอัดไฟล์ก่อนอัปลงเว็บ

เครื่องมือใน repo นี้ช่วยลดขนาด **รูปภาพ วิดีโอ เสียง PDF** ก่อนอัปโหลดขึ้น Supabase / หน้าเว็บ เพื่อให้โหลดเร็วและไม่เปลือง bandwidth โดยไม่จำเป็น

## สรุปเร็ว

| ประเภท | วิธี | คำสั่งหลัก |
|--------|------|------------|
| รูปภาพ | Sharp (CLI) หรือบีบอัดในเบราว์เซอร์ (แอดมิน) | `npm run media:compress -- "photo.jpg"` |
| PDF แคตตาล็อก | Ghostscript ผ่าน `compress-pdf` | `npm run media:compress -- "catalog.pdf"` |
| วิดีโอ | ffmpeg (ต้องติดตั้งในเครื่อง) | `npm run media:compress -- "promo.mp4"` |
| เสียง | ffmpeg | `npm run media:compress -- "voice.wav" --format mp3` |

```bash
cd wpallin1-shop
npm run media:compress -- --help
```

## เป้าหมายขนาดแนะนำ (wpallin1.com)

| การใช้งาน | แนะนำ | สูงสุดที่ควรอัป |
|-----------|--------|------------------|
| รูปสินค้า / ปกแคตตาล็อก | &lt; 500 KB | ~2 MB |
| PDF แคตตาล็อก (flipbook) | 5–15 MB | 50 MB (แอดมินบล็อกเกิน) |
| วิดีโอสั้นบนหน้าเว็บ | &lt; 10 MB | 25 MB |
| ไฟล์เสียง | &lt; 3 MB | 10 MB |

Storage bucket `wpall-retail-catalogs` รองรับไฟล์เดียวสูงสุด **150 MB** แต่ผู้ใช้จริงไม่ควรดาวน์โหลดไฟล์ใหญ่ขนาดนั้นบนมือถือ

---

## CLI: `media:compress`

สคริปต์หลัก: [`scripts/compress-media.mjs`](../scripts/compress-media.mjs)

### รูปภาพ

```bash
npm run media:compress -- "assets/hero.png"
npm run media:compress -- "assets/hero.png" --format webp --quality 80
npm run media:compress -- "assets/hero.png" --out "assets/hero-web.jpg" --max 1600
```

ค่าเริ่มต้น:

- ขนาดสูงสุดด้านยาว **1920 px** (ไม่ขยายรูปเล็ก)
- JPEG quality **82** (mozjpeg)
- ถ้าบีบอัดแล้วใหญ่กว่าเดิม จะ **ไม่เขียนทับ** (คืนไฟล์เดิม)

รองรับ: `.jpg` `.png` `.webp` `.gif` `.bmp` `.tif` `.avif` `.heic` (ผ่าน sharp)

### PDF

```bash
npm run media:compress -- "WP ALL Roller Blinds.pdf"
npm run media:compress -- "catalog.pdf" --preset screen
npm run media:compress -- "catalog.pdf" --out "catalog-web.pdf" --preset ebook
```

Preset (`--preset`):

| Preset | เหมาะกับ | คุณภาพโดยประมาณ |
|--------|----------|------------------|
| `screen` | ดูบนมือถือ / โหลดเร็วสุด | ต่ำสุด |
| `ebook` | **แคตตาล็อกออนไลน์ (ค่าเริ่มต้น)** | สมดุล |
| `printer` | เก็บความละเอียดสูงกว่า | ใหญ่กว่า |

ตัวอย่างจริง: PDF ม่านม้วน **128 MB → ~8 MB** ด้วย preset `ebook`

คำสั่งเก่ายังใช้ได้: `npm run catalog:compress -- "<file.pdf>"` (เรียกตัวเดียวกัน)

### วิดีโอ

ต้องมี **ffmpeg** ใน PATH:

```powershell
winget install Gyan.FFmpeg
# หรือดาวน์โหลดจาก https://ffmpeg.org/download.html
```

```bash
npm run media:compress -- "promo.mov"
npm run media:compress -- "promo.mov" --crf 30 --max-height 720
```

ค่าเริ่มต้น:

- H.264 (`libx264`), CRF **28**
- ความสูงสูงสุด **1080p**
- เสียง AAC **128k**
- `+faststart` สำหรับเล่นบนเว็บเร็วขึ้น

### เสียง

```bash
npm run media:compress -- "narration.wav"
npm run media:compress -- "narration.wav" --format mp3 --bitrate 128k
npm run media:compress -- "podcast.wav" --format aac
```

ค่าเริ่มต้น: MP3 **128k**

### โฟลเดอร์ (หลายไฟล์)

```bash
npm run media:compress -- "./assets/raw" --recursive
```

จะประมวลผลเฉพาะนามสกุลที่รู้จัก ข้ามไฟล์อื่น

---

## ในแอป (เบราว์เซอร์)

ไฟล์ [`src/lib/media-compress.ts`](../src/lib/media-compress.ts):

- **รูปปกแคตตาล็อก** — บีบอัดอัตโนมัติก่อนอัปโหลดใน `/admin/catalogs`
- **PDF / วิดีโอ / เสียง** — บีบอัดในเบราว์เซอร์ไม่สะดวก ใช้ CLI ด้านบน

หน้าแอดมินแสดงคำเตือนเมื่อ PDF &gt; 25 MB และบล็อกเมื่อ &gt; 50 MB

---

## สคริปต์ที่เกี่ยวข้อง

| สคริปต์ | หน้าที่ |
|---------|---------|
| `npm run media:compress` | บีบอัดทุกประเภท (แนะนำ) |
| `npm run catalog:compress` | alias สำหรับ PDF แคตตาล็อก |
| `npm run catalog:seed-roller` | seed PDF ม่านม้วน (บีบอัดอัตโนมัติถ้า &gt; 50 MB) |

โมดูลย่อยใน `scripts/lib/`:

- `compress-image.mjs` — sharp
- `compress-pdf.mjs` — compress-pdf (Ghostscript แบบ bundle)
- `compress-ffmpeg.mjs` — วิดีโอ/เสียง
- `compress-utils.mjs` — ตรวจชนิดไฟล์, รวมโฟลเดอร์

---

## Dependencies

ติดตั้งแล้วในโปรเจกต์ (dev):

- `sharp` — รูปภาพ
- `compress-pdf` — PDF (มี Ghostscript ในตัว)

ติดตั้งในเครื่องเอง:

- **ffmpeg** — วิดีโอและเสียง (ไม่ bundle ใน npm)

```bash
cd wpallin1-shop
npm install --legacy-peer-deps
```

---

## Workflow แนะนำก่อนอัปแคตตาล็อก

1. ได้ไฟล์ดิบจากดีไซน์ (มักใหญ่มาก)
2. `npm run media:compress -- "catalog.pdf" --preset ebook`
3. ตรวจขนาด output (&lt; 25 MB ดีที่สุด)
4. อัปโหลดที่ `/admin/catalogs` หรือใช้ `catalog:seed-roller`
5. กด **สร้างปกจากหน้า 1** ถ้ายังไม่มีรูปปก

---

## แก้ปัญหา

| อาการ | แนวทาง |
|-------|--------|
| PDF ยังใหญ่เกิน 50 MB | ลอง `--preset screen` หรือแยกเล่ม |
| `ffmpeg not found` | ติดตั้ง ffmpeg แล้วเปิด terminal ใหม่ |
| รูปบีบอัดแล้วไม่เล็กลง | รูปเล็ก/บีบอัดมาแล้ว — สคริปต์จะข้าม |
| อัปโหลด 413 | บีบอัดก่อน หรือตรวจ bucket limit ใน migration |

---

## อ้างอิง

- [Marketing catalogs](./marketing-catalogs.md) — ฟีเจอร์แคตตาล็อก / flipbook
- `wp-group-erp/scripts/compress-product-media.mjs` — บีบอัดรูปใน bucket `product-media` แบบ batch (backoffice)
