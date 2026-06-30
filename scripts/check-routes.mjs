/**
 * Quick route crash check against SMOKE_BASE_URL (default production).
 * Usage: node scripts/check-routes.mjs
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv(path.join(process.cwd(), ".env"));

const baseURL =
  process.env.SMOKE_BASE_URL?.trim() || "https://wpallin1-shop.vercel.app";
const email = process.env.SMOKE_TEST_EMAIL?.trim() ?? "";
const password = process.env.SMOKE_TEST_PASSWORD?.trim() ?? "";

const PUBLIC_ROUTES = [
  "/",
  "/order",
  "/shop",
  "/inspiration",
  "/configurator",
  "/catalogs",
  "/about",
  "/contact",
  "/cart",
  "/dealer/register",
  "/login",
];

const AUTH_ROUTES = [
  "/shop",
  "/account",
  "/account/orders",
  "/dealer",
  "/dealer/catalog",
  "/dealer/wallet",
  "/admin",
  "/admin/products",
];

async function hasCrash(page) {
  const title = await page.getByRole("heading", {
    name: "เกิดข้อผิดพลาดของระบบ",
  }).count();
  if (title > 0) return "500 shell";
  const chatErr = await page.getByText(/useChatUi must be used within/i).count();
  if (chatErr > 0) return "useChatUi missing provider";
  const compareErr = await page.getByText(/useCompare must be used within/i).count();
  if (compareErr > 0) return "useCompare missing provider";
  return null;
}

async function checkRoute(page, route) {
  const errors = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  const response = await page.goto(`${baseURL}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 45_000,
  });
  await page.waitForTimeout(2500);
  const crash = await hasCrash(page);
  if (crash) errors.push(crash);
  if (!response || response.status() >= 500) {
    errors.push(`HTTP ${response?.status() ?? "none"}`);
  }
  return errors;
}

const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext();
const page = await context.newPage();

const results = [];

console.log(`Checking public routes on ${baseURL}...`);
for (const route of PUBLIC_ROUTES) {
  const errors = await checkRoute(page, route);
  results.push({ route, errors });
  console.log(`${errors.length ? "FAIL" : "OK  "} ${route}${errors.length ? ` — ${errors.join("; ")}` : ""}`);
}

if (email && password) {
  console.log("\nLogging in...");
  await page.goto(`${baseURL}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[type="email"], input[name="email"]').first().fill(email);
  await page
    .locator('input[type="password"], input[name="password"]')
    .first()
    .fill(password);
  await page.locator('form button[type="submit"]').first().click();
  await page.waitForURL(/\/account/, { timeout: 30_000 }).catch(() => {});
  console.log(`After login URL: ${page.url()}`);

  console.log("\nChecking authenticated routes...");
  for (const route of AUTH_ROUTES) {
    const errors = await checkRoute(page, route);
    results.push({ route, errors, auth: true });
    console.log(`${errors.length ? "FAIL" : "OK  "} ${route}${errors.length ? ` — ${errors.join("; ")}` : ""}`);
  }
} else {
  console.log("\nSkip auth routes (no SMOKE_TEST_EMAIL/PASSWORD)");
}

await browser.close();

const failed = results.filter((r) => r.errors.length > 0);
if (failed.length) {
  console.log(`\n${failed.length} route(s) failed.`);
  process.exit(1);
}
console.log("\nAll checked routes OK.");
