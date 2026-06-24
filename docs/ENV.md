# Environment variables — wpallin1-shop

Copy `.env.example` → `.env` for local dev.  
**Never commit `.env`** — only `.env.example` with empty placeholders.

---

## Quick setup

```powershell
cd "C:\Users\Admin\WP GROUP\wpallin1-shop"
copy .env.example .env
```

Fill keys from Supabase Dashboard → Project `erpzxusskbtdxvqadwxv` → Settings → API.

---

## Client (`VITE_*`)

Exposed to the browser. Only non-secret config.

| Variable | Required | Default / example | Purpose |
|----------|----------|-------------------|---------|
| `VITE_SUPABASE_URL` | Yes | `https://erpzxusskbtdxvqadwxv.supabase.co` | Supabase API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | `eyJ...` (anon key) | Client auth + RLS queries |
| `VITE_SUPABASE_PROJECT_ID` | Yes | `erpzxusskbtdxvqadwxv` | Project reference |
| `VITE_SUPABASE_SCHEMA` | Yes | `wpall_retail` | PostgreSQL schema isolation |
| `VITE_APP_PUBLIC_URL` | Prod | `https://wpallin1-shop.vercel.app` | Canonical site URL (SEO, affiliate links, emails) |

Local dev: `VITE_APP_PUBLIC_URL=http://localhost:8080` (or your Vite port).

Read in code: `src/lib/erp-config.ts`, `src/lib/public-url.ts`

---

## Server (no `VITE_` prefix)

Read inside request handlers / server functions only — **not** at module top level (Cloudflare/Vercel Workers compatibility).

| Variable | Required | Purpose |
|----------|----------|---------|
| `SUPABASE_URL` | Yes | Same as `VITE_SUPABASE_URL` |
| `SUPABASE_SCHEMA` | Yes | `wpall_retail` |
| `SUPABASE_PUBLISHABLE_KEY` | Yes | Token validation in API routes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Admin server fns, bypass RLS where intended |
| `APP_PUBLIC_URL` | Optional | Server fallback for public URL (`config.server.ts`) |

---

## Email (Resend)

| Variable | Required | Purpose |
|----------|----------|---------|
| `RESEND_API_KEY` | Prod | Send order/notification email |
| `EMAIL_FROM` | Prod | Verified sender, e.g. `noreply@yourdomain.com` |

Verify domain in Resend + SPF/DKIM/DMARC before go-live.

---

## Integrations

| Variable | Default | Purpose |
|----------|---------|---------|
| `INTEGRATIONS_ENABLED` | `true` | Set `false` during migration to pause webhooks/email without throwing |

wpallin1-shop does not call backoffice production-intake directly; cross-app webhooks are documented in WP GROUP rules for other apps.

---

## Rate limiting (Upstash Redis)

| Variable | Required | Purpose |
|----------|----------|---------|
| `UPSTASH_REDIS_REST_URL` | Optional | Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Redis auth token |

When unset, in-app rate limits are skipped (Vercel WAF still applies).  
Provision via Vercel Marketplace → Upstash. See `docs/VERCEL-WAF-RUNBOOK.md`.

Used for: payment slip upload, wallet top-up, catalog asset upload, quote requests.

---

## E2E smoke tests (local only)

| Variable | Purpose |
|----------|---------|
| `SMOKE_BASE_URL` | Target URL (default production) |
| `SMOKE_TEST_EMAIL` | Admin test account |
| `SMOKE_TEST_PASSWORD` | Admin test password |

Never commit real passwords. See `docs/e2e-smoke.md`.

---

## Vercel configuration

1. Project → Settings → Environment Variables
2. Add each variable for **Production** and **Preview**
3. `SUPABASE_SERVICE_ROLE_KEY` — **never** prefix with `VITE_`
4. After changing `VITE_*`, redeploy (build-time embed)

---

## Validation checklist

```text
[ ] VITE_SUPABASE_SCHEMA = wpall_retail
[ ] SUPABASE_SCHEMA = wpall_retail
[ ] VITE_APP_PUBLIC_URL matches deployed hostname
[ ] Supabase Auth redirect URLs include prod + preview
[ ] RESEND_API_KEY + EMAIL_FROM set for production email
[ ] INTEGRATIONS_ENABLED=true before go-live
```

---

## Related

- `docs/DEPLOY.md` — deploy steps
- `wp-group-erp/docs/SUPABASE-AUTH-VERCEL-URLS.md` — auth redirect URLs
