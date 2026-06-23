/** Shared Supabase ERP project — WP GROUP */
export const ERP_PROJECT_ID = "erpzxusskbtdxvqadwxv";

export const SUPABASE_SCHEMA =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_SUPABASE_SCHEMA as string | undefined)) ||
  (typeof process !== "undefined" ? process.env.SUPABASE_SCHEMA : undefined) ||
  "wpall_retail";

export const APP_SLUG = "wpallin1-shop";

export const APP_PUBLIC_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_APP_PUBLIC_URL as string | undefined)) ||
  (typeof process !== "undefined" ? process.env.APP_PUBLIC_URL : undefined) ||
  "";
