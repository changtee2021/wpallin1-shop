# Deploy guide — wpallin1-shop

Production URL: **https://wpallin1-shop.vercel.app**  
GitHub: `changtee2021/wpallin1-shop`  
Supabase ERP: `erpzxusskbtdxvqadwxv` · schema `wpall_retail`

---

## Prerequisites

1. Vercel project linked (`vercel link --yes` from repo root)
2. Env vars set in Vercel (see `docs/ENV.md`)
3. Pending migrations applied (`docs/MIGRATIONS.md` → `supabase db push`)
4. Local build passes:

```powershell
cd "C:\Users\Admin\WP GROUP\wpallin1-shop"
npm install --legacy-peer-deps
npm run build
```

Optional: `npm run lint` (full-repo prettier may have pre-existing warnings).

---

## Preview deploy (เดโม่)

```powershell
cd "C:\Users\Admin\WP GROUP\wpallin1-shop"
npm run build
vercel deploy --yes
```

- **No** `--prod` flag
- Preview uses the **same Supabase ERP** — demo writes affect real data
- Health check: `GET <preview-url>/api/public/health`

Batch (from WP GROUP root):

```powershell
.\wp-group-erp\scripts\deploy-vercel-all.ps1 -PreviewOnly -Only wpallin1-shop
```

---

## Production deploy

### Pre-flight

| Check | Command / action |
|-------|------------------|
| Migrations | `cd wp-group-erp; supabase db push` — see `docs/MIGRATIONS.md` |
| Build | `npm run build` in wpallin1-shop |
| Auth URLs | Supabase Dashboard → Auth → URL config — add production + preview URLs per `wp-group-erp/docs/SUPABASE-AUTH-VERCEL-URLS.md` |
| `VITE_APP_PUBLIC_URL` | Must match production domain in Vercel env |
| Integrations | `INTEGRATIONS_ENABLED=true` when email/webhooks should run |

### Deploy

```powershell
cd "C:\Users\Admin\WP GROUP\wpallin1-shop"
npm run build
vercel deploy --prod --yes
```

Batch:

```powershell
.\wp-group-erp\scripts\deploy-vercel-all.ps1 -Only wpallin1-shop
```

### Post-deploy

```powershell
curl https://wpallin1-shop.vercel.app/api/public/health
npm run test:smoke   # optional; set SMOKE_* in .env
```

Smoke test details: `docs/e2e-smoke.md`

---

## Vercel env sync

Set variables for **Production** and **Preview**:

| Variable | Required |
|----------|----------|
| `VITE_SUPABASE_URL` | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes |
| `VITE_SUPABASE_SCHEMA` | Yes (`wpall_retail`) |
| `VITE_APP_PUBLIC_URL` | Yes (per environment) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (server only) |
| `SUPABASE_URL` | Yes |
| `SUPABASE_SCHEMA` | Yes |
| `RESEND_API_KEY` + `EMAIL_FROM` | For transactional email |
| `UPSTASH_REDIS_REST_*` | Optional rate limiting |
| `INTEGRATIONS_ENABLED` | `true` in prod |

Full reference: `docs/ENV.md`

---

## Rollback

1. Vercel Dashboard → **wpallin1-shop** → Deployments
2. Promote a previous successful deployment to Production
3. If a bad migration was applied, restore DB from Supabase backup (portal infra) — do not `db reset` on shared ERP

---

## Security & WAF

- Firewall rules: `docs/VERCEL-WAF-RUNBOOK.md`
- CSP: `vercel.json` (report-only first, then enforce)
- Supabase advisors: `docs/SUPABASE-SECURITY-NOTES.md`

---

## Related docs

- `docs/ENV.md` — environment variables
- `docs/MIGRATIONS.md` — database migrations
- `docs/GO-LIVE-CHECKLIST.md` — launch checklist
- `docs/ARCHITECTURE.md` — app structure
