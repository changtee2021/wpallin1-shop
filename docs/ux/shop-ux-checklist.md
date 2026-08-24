# WP ALL Shop UX/UI standard

Source of truth for chrome / page-layout work on `wpallin1-shop`.  
มาตรฐานหน้าตาและความง่ายของร้าน — งานเดิม ข้อมูลเดิม ความเร็วเดิมหรือเร็วขึ้น

Adapted from `wp-enterprise/docs/ux/erp-ux-checklist.md`.  
ตัดข้อที่เป็น ERP (รหัสพนักงาน, ติดต่อ IT, sidebar 6 บท) ออกแล้ว

Run this file before shipping any UX change.  
ใช้ไฟล์นี้ก่อนขึ้นของทุกครั้งที่แตะหน้าตา

Sources:

- [Checklist Design](https://www.checklist.design/) — Login, Admin Panel, Data Table, Empty State, Search, Input error
- Changtee buttons — `wp-enterprise/.cursor/skills/touch-friendly-buttons/SKILL.md`
- Shop design — `docs/design.md`
- Skeleton loading — `docs/SKELETON-LOADING.md`

---

## Hard stop

If a change would alter checkout / payment / cart / order / webhook / RPC / query / RLS, or add a fetch on every layout paint, **stop**.

อย่าแตะงานขายจริง หรือดึงข้อมูลใหม่ตอนวาด header/nav

---

## Locked (do not re-decide)

Already shipped. Keep these unless the user asks to change them.

| Topic | Decision |
|---|---|
| Login | Email + password + Google. Customer self-reset via email. |
| Password field | Show/hide toggle |
| Login inputs | `text-base` (16px) so iOS does not zoom |
| Font | Inter + IBM Plex Sans Thai. Do **not** add DB Heavent unless licensed |
| CI | Teal primary, orange accent — tokens in `src/styles.css`, no new hex in components |
| Confirm | In-app dialog — never `window.confirm` |
| Sign-out | Ask once (dialog) |
| Loading | Skeleton via `PageLoading` — see `docs/SKELETON-LOADING.md` |

---

## Bar (every screen)

Tick all before merge. ต้องผ่านทุกข้อก่อนขึ้นของ

### Buttons (Changtee)

- [ ] One action, one control — no overlapping hit areas
- [ ] Mobile tap ≥ 44px (`min-h-11`); desktop ≥ 36px (`min-h-9`)
- [ ] Destructive = icon + Thai label + confirm dialog
- [ ] Primary / secondary / danger look different
- [ ] Icon-only has `aria-label` (Thai)
- [ ] Hover / active / disabled / loading exist

### Forms

- [ ] Visible label (not placeholder-only)
- [ ] Inputs `text-base` (16px)
- [ ] Validate after blur or submit — not while typing
- [ ] Error beside the field + icon; toast is extra, not the only signal
- [ ] Password fields have show/hide
- [ ] Forgot-password stays email reset (storefront)

### Lists / tables

- [ ] Loading ≠ empty ≠ no-results ≠ error (four different copies **and** visuals)
- [ ] Search/filter shows chips when active + a clear-all path
- [ ] Pagination / range shows count when used
- [ ] Row actions: 2–3 visible, rest in overflow; do not cover the row
- [ ] Money / qty / counts use `tabular-nums` (`<Price />`)

### Shell

- [ ] Current page is obvious (title; breadcrumb on deep routes)
- [ ] Mobile drawer: focus trap, Escape closes, backdrop is a `<button>`
- [ ] Skip link to `#main-content`
- [ ] Header stays scannable on a phone
- [ ] Sign-out asks once

### Access + speed

- [ ] Visible focus ring (`focus-visible:ring-2 focus-visible:ring-[var(--primary)]`)
- [ ] Color is not the only status signal (icon or text too)
- [ ] No new network on layout paint
- [ ] Contrast ≥ 4.5:1 for body text

---

## Four list states (copy)

Use `ListEmptyState` / `ListNoResultsState` / `ListErrorState` in `src/components/ui/list-query-state.tsx`.  
Loading stays `PageLoading`. Do not reuse empty for error.

| State | When | Visual | Thai shape |
|---|---|---|---|
| Loading | First fetch | Skeleton | ไม่ต้องมีข้อความยาว |
| Empty | Never had data | Short line + one next action | `ยังไม่มี…` + ปุ่มไปร้าน/สร้าง |
| No results | Filters/search hid everything | Short line + clear filters | `ไม่พบรายการที่ตรงกับตัวกรอง` + ล้างตัวกรอง |
| Error | Fetch failed | Icon + text + retry | `โหลดไม่สำเร็จ` + ลองใหม่ |

---

## Progress

| Area | Status |
|---|---|
| Shared 4-state + skip-link + sign-out dialog | Done |
| Shop / account lists / admin products & orders | Done |
| Login + checkout field errors | Done |
| Button touch size + `<Price />` | Done |
| Other admin / dealer lists | Next |

---

## Out of scope unless asked

SSO, Remember me, global command palette, full dark-mode chrome, licensed fonts (DB Heavent), ERP employee login.

---

## How to use this file

1. Confirm the change is chrome-only (hard stop).
2. Do not reopen locked rows.
3. Tick the **Bar** on the screens you touched.
4. Prefer CSS / existing components. Stop and ask if new data is required.
