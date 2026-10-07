/**
 * Which site this build serves. Inlined at build time, so it is safe to read
 * on both client and server.
 *
 * - `brand`       — wpallin1.com showcase: no prices, login, cart or checkout.
 * - `dealer_shop` — shop subdomain: anyone can browse prices; only approved
 *                   dealers (or admins) can add to cart and check out.
 * - `full`        — the original open storefront.
 *
 * Builds that predate `VITE_SITE_MODE` fall back to `VITE_COMMERCE_ENABLED`.
 */
export type SiteMode = "brand" | "dealer_shop" | "full";

function resolveSiteMode(): SiteMode {
  const raw = import.meta.env.VITE_SITE_MODE;
  if (raw === "brand" || raw === "dealer_shop" || raw === "full") return raw;
  return import.meta.env.VITE_COMMERCE_ENABLED === "true" ? "full" : "brand";
}

export const SITE_MODE: SiteMode = resolveSiteMode();

/** Prices, login, cart, checkout, account and dealer portal are reachable. */
export const COMMERCE_ENABLED = SITE_MODE !== "brand";

/** Cart and checkout are limited to approved dealers. */
export const DEALER_ONLY_PURCHASE = SITE_MODE === "dealer_shop";

const DEFAULT_SHOP_URL = "https://shop.wpallin1.com";

/** Public shop URL the brand site links to. Override with `VITE_SHOP_URL`. */
export const SHOP_URL = (() => {
  const raw = import.meta.env.VITE_SHOP_URL;
  return typeof raw === "string" && raw.trim()
    ? raw.trim().replace(/\/$/, "")
    : DEFAULT_SHOP_URL;
})();

/** Where "Shop" links point: the in-app catalogue, or the shop subdomain from the brand site. */
export function shopHref(path = "/shop"): string {
  if (COMMERCE_ENABLED || !SHOP_URL) return path;
  return `${SHOP_URL}${path}`;
}
