# Skeleton loading (wpallin1-shop)

Every page in this app must show a **skeleton** while content is loading — not plain text like "กำลังโหลด...".

Skeletons use `@/components/ui/skeleton` (`bg-primary/10`, `animate-pulse`) and match the layout of the real page.

---

## When to show skeletons

| Situation | Mechanism |
|-----------|-----------|
| **Route navigation** (loader, `beforeLoad`, code-split) | Automatic via `defaultPendingComponent` in `src/router.tsx` |
| **Client fetch after mount** (`useEffect`, React Query) | `<PageLoading variant="..." />` in the page/component |
| **Dialog / panel** loading | `InlineRowsSkeleton` or a small local skeleton |

---

## Components

Import from `@/components/loading`:

```tsx
import { PageLoading, InlineRowsSkeleton } from "@/components/loading";
```

### `PageLoading` variants

| `variant` | Use for |
|-----------|---------|
| `default` | Generic content, static pages, reports |
| `list` | Orders list, notifications, quotations list |
| `grid` | Product grid, wishlist, shop |
| `table` | Admin tables (orders, members, dealers, products) |
| `detail` | Order detail, quotation detail, member profile |
| `form` | Settings, product edit, checkout |
| `dashboard` | Admin overview, affiliate dashboard, stats |
| `cart` | Cart / cart summary |
| `auth` | Full-page auth shells (rare; login uses button spinner) |

### Examples

**Full page (client fetch):**

```tsx
if (loading) return <PageLoading variant="detail" />;
```

**Inline section:**

```tsx
{loading ? <PageLoading variant="table" /> : <OrdersTable ... />}
```

**Dialog:**

```tsx
{loadingDetail ? <InlineRowsSkeleton rows={4} /> : <Content />}
```

---

## New route checklist

When adding a route under `src/routes/`:

1. **Has a `loader` or slow `beforeLoad`?**  
   Router already shows `RoutePendingFallback`. Optionally set a specific skeleton:

   ```tsx
   import { PageLoading } from "@/components/loading";

   export const Route = createFileRoute("/admin/foo")({
     pendingComponent: () => <PageLoading variant="table" />,
     loader: async () => { ... },
     component: FooPage,
   });
   ```

2. **Fetches data in `useEffect` after mount?**  
   Add `loading` state and return `<PageLoading variant="..." />` until data arrives.

3. **Never ship** bare `<p>กำลังโหลด...</p>` or spinner-only full pages (except submit buttons on forms).

4. **Pick the closest variant** — same columns/cards as the loaded UI.

5. **Update this doc** if you add a new reusable variant in `page-skeletons.tsx`.

---

## File map

| File | Role |
|------|------|
| `src/components/ui/skeleton.tsx` | Base primitive |
| `src/components/loading/page-skeletons.tsx` | All composed skeletons + `PageLoading` |
| `src/components/loading/index.ts` | Public exports |
| `src/router.tsx` | `defaultPendingComponent`, `defaultPendingMs`, `defaultPendingMinMs` |

---

## Route → variant reference

Use this when choosing `pendingComponent` or in-page `PageLoading`:

| Area | Routes (examples) | Variant |
|------|-------------------|---------|
| Store home / shop | `_store.index`, `_store.shop`, `_store.products.$slug` | `grid` / router default |
| Cart | `_store.cart.index`, `_store.cart.summary` | `cart` |
| Checkout | `_store.checkout` | `form` |
| Account lists | `account.orders`, `account.notifications`, `account.quotations` | `list` |
| Account detail | `account.orders.$orderId` | `detail` |
| Wishlist | `account.wishlist` | `grid` |
| Affiliate | `account.affiliate` | `dashboard` |
| Admin overview | `admin.index` | `dashboard` |
| Admin tables | `admin.orders`, `admin.members`, `admin.products.index`, … | `table` |
| Admin detail | `admin.orders.$orderId`, `admin.quotations.$quotationId` | `detail` |
| Admin forms | `admin.settings`, `admin.products.$id`, `admin.banners` | `form` |
| Dealer | `dealer.index`, `dealer.catalog`, … | `dashboard` / `grid` |
| Public quote | `quote.$token` | `detail` |

---

## Performance notes

- Router uses `defaultPendingMinMs: 0` — skeletons show only while data is actually loading (no artificial 250ms delay).
- `defaultPreloadStaleTime: 30_000` — revisiting a route within 30s reuses loader data.

- Page skeletons set `aria-busy="true"` and `aria-label="Loading page"`.
- Do not trap focus in skeleton state; real content replaces skeleton when ready.
