# wpallin1-shop Architecture

## Route zones

| Prefix | Layout | Auth |
|--------|--------|------|
| `/_store` | Storefront header + bottom nav | Public |
| `/account` | Account + bottom nav | Login |
| `/dealer` | Dealer portal + bottom nav | Dealer |
| `/admin` | Admin + bottom nav | Admin |

## Modules

- **Catalog** — `catalog.service.ts`, `admin-catalog.service.ts`, `category.service.ts`
- **Commerce** — cart, checkout, orders, quotations, coupons
- **Membership** — tiers, wallet, profile, `pricing.service.ts` (bulk member prices)
- **Notifications** — `notification.service.ts` + `notifications` table
- **Assisted orders** — `placeOrderOnBehalf()` in `checkout.service.ts`

## Server functions

TanStack Start server fns live in `src/lib/api.functions.ts` (barrel) with domain splits under `src/lib/server-fns/`:

- `_shared.ts` — schemas, `getAdminClient`
- `notifications.ts`, `quotations.ts`, `assisted-order.ts`, `categories.ts`, `pricing.ts`

## Quotation flow

`draft` → `sent` → `accepted`/`rejected` → `converted` (order)

Customer can request from cart; admin sends and converts.

## Assisted order

Staff creates order with `orders.user_id = customer`, audit in `metadata.placed_by_user_id`.

## Mobile shell

`use-app-nav.ts` + `AppBottomNav` + `AppMoreSheet` provide zone-aware bottom navigation on all layouts.

## Related docs

- `docs/DEPLOY.md`, `docs/ENV.md`, `docs/MIGRATIONS.md` — deploy & database
- `docs/ADMIN-GUIDE.md`, `docs/marketing-catalogs.md` — operations
- `docs/design.md`, `docs/GO-LIVE-CHECKLIST.md`, `CHANGELOG.md`
