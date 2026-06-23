# Vercel WAF runbook — wpallin1-shop

Production: https://wpallin1-shop.vercel.app  
Project: `wpallin1-shop` (Vercel dashboard → Project → Settings → Firewall)

## 1. Enable managed protection

1. Open **Vercel Dashboard** → **wpallin1-shop** → **Firewall**
2. Enable **Attack Challenge Mode** during incidents (optional baseline: off)
3. Enable **OWASP Core Rule Set** / managed rulesets if available on your plan

## 2. Rate limiting rules (dashboard)

Create rules for these paths (recommended starting limits):

| Path | Method | Limit | Window | Notes |
|------|--------|-------|--------|-------|
| `/login` | GET | 30 | 1 min | Client-side auth page — limit page loads |
| `/signup` | GET | 30 | 1 min | Same |
| `/api/v1/payment-slip` | POST | 10 | 1 min | Slip upload |
| `/api/v1/wallet-topup-slip` | POST | 10 | 1 min | Wallet top-up slip |
| `/_serverFn/*` | POST | 60 | 1 min | Server function abuse (broad) |

Auth sign-in/sign-up uses **Supabase client SDK** (not app server routes). Also configure **Supabase Auth rate limits** in Supabase Dashboard → Authentication → Rate Limits.

## 3. In-app rate limiting (Upstash)

When `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set in Vercel env:

- Slip uploads: 5 req/min per user
- Quote requests: 3 req/min per user

Provision via **Vercel Marketplace → Upstash Redis**, then add env vars to Production + Preview.

## 4. CSP rollout

`vercel.json` ships **Content-Security-Policy-Report-Only** first. After preview verification:

1. Confirm no CSP violations in browser console
2. Rename header to `Content-Security-Policy` (enforcing)

## 5. Email domain (Resend)

1. Verify sending domain in Resend
2. Add DNS: SPF, DKIM, DMARC
3. Set Vercel env: `RESEND_API_KEY`, `EMAIL_FROM=noreply@yourdomain.com`

## 6. Supabase RLS

Run Security Advisor periodically:

```text
MCP: get_advisors(project_id=erpzxusskbtdxvqadwxv, type=security)
```

Focus on schema `wpall_retail`: `product_reviews`, `wishlist_items`, `orders`, `profiles`.

## 7. Incident checklist

- Enable Attack Challenge Mode
- Check Vercel Runtime Logs (500 spikes on `/_serverFn` or slip routes)
- Pause integrations: `INTEGRATIONS_ENABLED=false` in Vercel env
- Rotate `SUPABASE_SERVICE_ROLE_KEY` if suspected leak
