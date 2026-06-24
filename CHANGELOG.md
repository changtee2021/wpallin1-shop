# Changelog

All notable changes to **wpallin1-shop** are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/).  
Versions follow deploy milestones; pre-1.0 uses dates.

---

## [Unreleased]

### Added
- `docs/design.md` — WP ALL brand / UI design system
- `docs/DEPLOY.md`, `docs/ENV.md`, `docs/MIGRATIONS.md`, `docs/ADMIN-GUIDE.md`, `docs/GO-LIVE-CHECKLIST.md`, `docs/marketing-catalogs.md`

### Pending
- Migration `20260627100000_wpall_retail_marketing_catalogs.sql` in wp-group-erp (required for marketing catalogs in production DB)

---

## [2026-06-24] — UX + Marketing catalogs

### Added
- Marketing PDF catalogs: `/catalogs`, `/catalogs/$id`, `/admin/catalogs`, product page links, upload API
- Header link หน้าแรก (home)

### Changed
- Storefront UX: card-style product option selectors, purchase panel, sticky mobile add-to-cart
- Cart page: order summary sidebar, mobile sticky checkout
- Product option groups, compact header, footer cleanup

### Fixed
- (from same release window) sitemap hardening, expanded smoke coverage, CI workflow

**Commits:** `70611e4`, `d483113`, `0d0ab11`, `b69d4b2`

---

## [2026-06-23] — Ecommerce foundation

### Added
- Playwright smoke tests (`e2e/smoke.spec.ts`, `docs/e2e-smoke.md`)
- B2B credit, KYC documents, wholesale tools, product card actions
- Security: legal pages, SEO, Resend email, Upstash rate limiting, CSP report-only
- Ecommerce roadmap: affiliate, coupons, reviews, wishlist, admin ops tools
- Admin support tickets + guest feedback viewer
- Account restructure: dashboard + unified settings
- Product image placeholder, attributes on detail page

### Fixed
- Account nav search params, null account status
- Product detail crash (review summary → server fn)
- Account sidebar slow loading (auth opts + lazy tab fetch)

**Commits:** `739ee17` … `6dbe532`

---

## [2026-06-23] — Initial release

### Added
- Greenfield WP ALL retail storefront (TanStack Start + `wpall_retail`)
- Storefront: catalog, cart, checkout (bank transfer + wallet)
- Member tiers, dealer portal, quotations, assisted ordering
- Mobile bottom navigation across store / account / dealer / admin
- Admin: products, orders, members, tiers, wallet, dealers, categories

**Commit:** `6dbe532`

---

## Migration timeline (wpall_retail)

| Date | Migration | Note |
|------|-----------|------|
| 2026-06-23 | `20260623100000` … `20260623150000` | Bootstrap, RLS, storage, configurator, wallet, reviews |
| 2026-06-23 | `20260623200000` | B2B credit + KYC |
| 2026-06-24 | `20260624100000` … `20260626100000` | Mock products QA |
| TBD | `20260627100000` | Marketing catalogs (pending) |

Full list: `docs/MIGRATIONS.md`
