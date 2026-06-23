import process from "node:process";

export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    supabaseSchema: process.env.SUPABASE_SCHEMA ?? "wpall_retail",
    appPublicUrl:
      process.env.APP_PUBLIC_URL ?? process.env.VITE_APP_PUBLIC_URL ?? "",
  };
}
