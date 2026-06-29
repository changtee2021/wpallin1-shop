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
const target = process.argv[2] || "/dealer";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage();
const pageErrors = [];
const consoleErrors = [];

page.on("pageerror", (err) => pageErrors.push(err.message));
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});

await page.goto(`${baseURL}/login`, { waitUntil: "domcontentloaded" });
await page.locator('input[type="email"], input[name="email"]').first().fill(process.env.SMOKE_TEST_EMAIL);
await page
  .locator('input[type="password"], input[name="password"]')
  .first()
  .fill(process.env.SMOKE_TEST_PASSWORD);
await page.locator('form button[type="submit"]').first().click();
await page.waitForTimeout(5000);

await page.goto(`${baseURL}${target}`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(3000);

const body = await page.locator("body").innerText();
console.log("URL:", page.url());
console.log("pageerror:", pageErrors.join(" | ") || "(none)");
console.log("console errors:", consoleErrors.slice(0, 10).join(" | ") || "(none)");
console.log("body:\n", body.slice(0, 1500));

await browser.close();
