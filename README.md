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

## Documentation

| Doc | Description |
|-----|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Routes, modules, server functions |
| [design.md](docs/design.md) | WP ALL brand colors, typography, UI patterns |
| [ENV.md](docs/ENV.md) | Environment variables |
| [DEPLOY.md](docs/DEPLOY.md) | Preview & production deploy |
| [MIGRATIONS.md](docs/MIGRATIONS.md) | `wpall_retail` migration list |
| [ADMIN-GUIDE.md](docs/ADMIN-GUIDE.md) | Admin back-office guide |
| [GO-LIVE-CHECKLIST.md](docs/GO-LIVE-CHECKLIST.md) | Pre-launch checklist |
| [marketing-catalogs.md](docs/marketing-catalogs.md) | PDF catalog feature |
| [e2e-smoke.md](docs/e2e-smoke.md) | Playwright smoke tests |
| [VERCEL-WAF-RUNBOOK.md](docs/VERCEL-WAF-RUNBOOK.md) | Firewall & rate limits |
| [SUPABASE-SECURITY-NOTES.md](docs/SUPABASE-SECURITY-NOTES.md) | RLS advisor notes |
| [CHANGELOG.md](CHANGELOG.md) | Release history |

## Migrations

Canonical DDL: `wp-group-erp/supabase/migrations/` (bootstrap, RLS, wallet/tiers, marketing catalogs).

Apply via:

```powershell
cd "C:\Users\Admin\WP GROUP\wp-group-erp"
supabase db push
```

See `docs/MIGRATIONS.md` for the full `wpall_retail` list.

## Features

- Storefront catalog, cart, checkout (bank transfer + wallet)
- Member tiers, wallet top-up, dealer portal
- In-app notifications, quotations, assisted ordering (staff)
- Marketing PDF catalogs (`/catalogs`)
- Mobile bottom nav across store / account / dealer / admin zones
- Admin: products, orders, members, tiers, wallet, dealers, categories, quotations, catalogs

## Scripts

```powershell
npm run lint
npm run build
npm run test:smoke
```

## Schema

Supabase ERP project `erpzxusskbtdxvqadwxv`, PostgreSQL schema `wpall_retail` (`VITE_SUPABASE_SCHEMA`).

Production: **https://wpallin1-shop.vercel.app**
