# Migrations — wpall_retail (wpallin1-shop)

Canonical SQL lives in **`wp-group-erp/supabase/migrations/`** — not in this app repo.

Supabase project: `erpzxusskbtdxvqadwxv`  
Schema: `wpall_retail`

---

## Apply migrations

```powershell
cd "C:\Users\Admin\WP GROUP\wp-group-erp"
# First time: supabase link --project-ref erpzxusskbtdxvqadwxv
supabase db push
```

Verify schema:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'wpall_retail'
ORDER BY table_name;
```

ERP-wide runbook: `wp-group-erp/docs/MIGRATION-RUNBOOK.md`

---

## wpall_retail migration list

Apply in timestamp order. All paths relative to `wp-group-erp/supabase/migrations/`.

| Migration | Summary |
|-----------|---------|
| `20260623100000_wpall_retail_bootstrap.sql` | Schema, enums, core tables (profiles, products, orders, cart, wallet, quotations, coupons, affiliates, notifications, site_settings) |
| `20260623110000_wpall_retail_rls.sql` | Row Level Security policies + helper functions (`is_admin`, `has_role`) |
| `20260623120000_wpall_retail_phase2_seed_storage.sql` | Storage buckets `wpall-retail-products`, `wpall-retail-payment-slips`; demo catalog seed; brand settings |
| `20260623130000_wpall_retail_phase3_configurator_seed.sql` | Curtain configurator seed data |
| `20260623140000_wpall_retail_wallet_topup_tiers.sql` | `wallet_topup_requests`, tier helpers |
| `20260623150000_wpall_retail_reviews_wishlist.sql` | `product_reviews`, `wishlist_items`, PromptPay setting seed |
| `20260623200000_wpall_retail_b2b_credit_docs.sql` | B2B credit accounts, KYC documents, contract pricing |
| `20260624100000_wpall_retail_mock_products.sql` | QA mock products |
| `20260625100000_wpall_retail_mock_product_images.sql` | Mock product images |
| `20260626100000_wpall_retail_mock_product_options.sql` | Mock selectable options (color, size, material) |
| `20260627100000_wpall_retail_order_tax_invoices.sql` | Tax invoice support |
| `20260627110000_wpall_retail_marketing_catalogs.sql` | Marketing PDF catalog tables + storage bucket |
| `20260627120000_wpall_retail_catalog_bucket_limit.sql` | Larger catalog PDF storage limits |
| `20260628100000_wpall_retail_marketing_catalogs_v2.sql` | Catalog slug, visibility, analytics, dealer access |
| `20260629130000_wpall_retail_inspiration_rooms.sql` | Inspiration mood board rooms + product hotspots |
| `20260629140000_wpall_retail_inspiration_seed.sql` | Seed 10 inspiration rooms + hotspot tags |
| `20260629150000_wpall_retail_inspiration_seed_commercial.sql` | Seed 10 commercial inspiration rooms (11–20) |
| `20260629160000_wpall_retail_inspiration_engagement.sql` | View/like counts + visitor likes for trends |
| `20260629170000_wpall_retail_inspiration_detail_images.sql` | `detail_images` JSONB on inspiration rooms (swatch admin) |
| `20260629180000_wpall_retail_inspiration_materials.sql` | Admin-managed `inspiration_materials` + room links |
| `20260629181000_wpall_retail_admin_media_assets.sql` | Central admin media library table |
| `20260629140000_wpall_retail_chat.sql` | Web chat conversations, messages, AI usage + settings |
| `20260630100000_wpall_retail_order_links.sql` | B2B shareable order links (`/o/$token`) |
| `20260630120000_wpall_retail_room_advisor.sql` | AI Room Advisor sessions, photos, storage bucket `wpall-retail-room-advisor` |

See also `docs/BUSINESS-ROADMAP.md` for product priorities.

---

## Marketing PDF catalogs

Marketing catalog migrations are present in `wp-group-erp/supabase/migrations/`.

Expected objects (from app code):

| Object | Purpose |
|--------|---------|
| `marketing_catalog_categories` | Group catalogs (e.g. ม่าน, มู่ลี่) |
| `marketing_catalogs` | Title, brand, cover, PDF URL, tags, visibility |
| `marketing_catalog_products` | Link catalogs ↔ products |
| `marketing_catalog_views` | Catalog page/device view analytics |
| Storage bucket `wpall-retail-catalogs` | Public PDF/cover uploads (admin write) |

If these migrations are not applied to the shared ERP project:

- `/catalogs` and `/admin/catalogs` will fail on DB queries
- Upload API `POST /api/v1/catalog-asset` will fail on storage

**Action:** Run `supabase db push` from `wp-group-erp`, then verify the tables and bucket exist.

Feature doc: `docs/marketing-catalogs.md`

**Inspiration materials seed** (after rooms exist in DB):

```powershell
cd wpallin1-shop
node scripts/seed-inspiration-materials.mjs
# or: npm run seed:inspiration-materials
```

Admin materials tab also auto-seeds from hotspots on first load when the table is empty.

---

## Storage buckets (wpall_retail)

| Bucket | Public | Purpose |
|--------|--------|---------|
| `wpall-retail-products` | Yes | Product images |
| `wpall-retail-payment-slips` | No | Payment / top-up slips |
| `wpall-retail-catalogs` | Yes (pending migration) | Marketing PDF + covers |

---

## Adding a new migration

1. Create `wp-group-erp/supabase/migrations/YYYYMMDDHHMMSS_wpall_retail_<name>.sql`
2. Start with `SET search_path TO wpall_retail, public;`
3. Enable RLS on new tables; add policies consistent with `20260623110000_wpall_retail_rls.sql`
4. `supabase db push` against ERP project
5. Update this file and `CHANGELOG.md`

---

## Rollback policy

Shared ERP — **do not** run destructive resets on production.  
Revert app code via Vercel; fix forward with a new migration if schema change was wrong.

---

## Related

- `docs/DEPLOY.md` — deploy after migrations
- `docs/GO-LIVE-CHECKLIST.md` — migration gate before prod
- `docs/SUPABASE-SECURITY-NOTES.md` — RLS advisor findings
