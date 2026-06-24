# E2E smoke tests (Playwright)

Run automated browser smoke tests against production or local dev.

## Quick start

```powershell
cd wpallin1-shop
npm install
npx playwright install chromium

# Optional: admin login flows (add to .env — do not commit)
# SMOKE_TEST_EMAIL=your-admin@example.com
# SMOKE_TEST_PASSWORD=your-password
# SMOKE_BASE_URL=https://wpallin1-shop.vercel.app

npm run test:smoke
```

## What is tested

| Suite | Requires login | Routes / actions |
|-------|----------------|------------------|
| Guest storefront | No | `/`, `/shop`, mock products, `/cart`, `/compare`, `/contact`, health |
| Cart flow | No | Shop → product detail → add to cart → `/cart` |
| Admin flows | Yes (`SMOKE_TEST_*`) | Login → `/account?tab=dashboard`, orders, wishlist, `/admin/*` |

Failures report:
- HTTP status ≥ 400
- React error boundary (`Something went wrong!`)
- `useAuth must be used within AuthProvider`
- Browser `console.error` and uncaught page errors

## Browser automation in Cursor (MCP)

For interactive “click every button” testing in Agent chat, enable one of:

### Option A — Browserbase Browse (recommended in Marketplace)

1. Cursor → Extensions/Marketplace → **Browserbase Browse** → **Add to Cursor**
2. Complete Browserbase API setup when prompted
3. Agent mode → ask: *“smoke test wpallin1-shop with browser MCP”*

### Option B — Chrome DevTools MCP

Add to `%USERPROFILE%\.cursor\mcp.json`:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

Reload Cursor, then use Agent mode with `@chrome-devtools`.

### Option C — Cursor built-in browser

Settings → enable **Browser** / `cursor-ide-browser` if available in your Cursor version.

## CI (GitHub Actions)

Workflow: `.github/workflows/e2e-smoke.yml` (runs on push/PR to `main`).

Add repository secrets:

| Secret | Purpose |
|--------|---------|
| `SMOKE_TEST_EMAIL` | Admin/super_admin login for authenticated smoke |
| `SMOKE_TEST_PASSWORD` | Password (never commit to repo) |

Guest tests run without secrets; admin/checkout routes skip if secrets are missing.

## Admin users in ERP

Users with `super_admin` or `admin` role in `wpall_retail.user_roles` can access `/admin`.
Set `SMOKE_TEST_EMAIL` to an account you control; password is never stored in git.
