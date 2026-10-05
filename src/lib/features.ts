/**
 * Brand-site mode: the storefront shows products without prices, and login,
 * cart, checkout, wishlist and notifications stay hidden until this is "true".
 * Inlined at build time, so it is safe to read on both client and server.
 */
export const COMMERCE_ENABLED =
  import.meta.env.VITE_COMMERCE_ENABLED === "true";
