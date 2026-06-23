# wpallin1-shop

Standalone WP All-in-1 retail/B2B storefront (TanStack Start + Supabase ERP schema `wpall_retail`).

## Setup

```powershell
cd "C:\Users\Admin\WP GROUP\wpallin1-shop"
copy .env.example .env
# fill VITE_SUPABASE_PUBLISHABLE_KEY and SUPABASE_SERVICE_ROLE_KEY
npm install --legacy-peer-deps
npm run dev
```

## Migrations

Canonical DDL: `wp-group-erp/supabase/migrations/` (bootstrap, RLS, wallet/tiers, notifications, quotations).

Apply via:

```powershell
cd "C:\Users\Admin\WP GROUP\wp-group-erp"
supabase db push
```

## Features

- Storefront catalog, cart, checkout (bank transfer + wallet)
- Member tiers, wallet top-up, dealer portal
- In-app notifications, quotations, assisted ordering (staff)
- Mobile bottom nav across store / account / dealer / admin zones
- Admin: products, orders, members, tiers, wallet, dealers, categories, quotations

See `docs/ARCHITECTURE.md` for module layout and server-fn organization.

## Scripts

```powershell
npm run lint
npm run build
```

## Schema

Supabase ERP project `erpzxusskbtdxvqadwxv`, PostgreSQL schema `wpall_retail` (`VITE_SUPABASE_SCHEMA`).
