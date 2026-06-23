# Supabase Security Advisor — wpall_retail (2026-06-23)

Project: `erpzxusskbtdxvqadwxv`  
Re-run: MCP `get_advisors(project_id, type=security)`

## wpall_retail findings (this app)

| Level | Issue | Detail | Action |
|-------|-------|--------|--------|
| WARN | Function search_path mutable | `set_updated_at`, `next_quotation_number`, `next_order_number` | Set `search_path` in migration (ERP backlog) |
| WARN | Permissive RLS INSERT | `affiliate_clicks` anon insert | Intentional for referral tracking; monitor abuse |
| WARN | Public bucket listing | `wpall-retail-products` bucket | Consider tightening storage SELECT policy |

## Shared ERP (other schemas — not wpallin1-shop scope)

- `backoffice.*` permissive CRM RLS policies
- `wp_production.*` RLS enabled without policies on several tables
- Auth: **Leaked password protection disabled** — enable in Supabase Dashboard → Authentication → Password Security

## Remediation links

- [RLS linter](https://supabase.com/docs/guides/database/database-linter)
- [Leaked password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
