import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export type PageIssue = {
  path: string;
  kind: "console" | "pageerror" | "ui";
  message: string;
};

export function attachIssueCollectors(page: Page, pathLabel: string) {
  const issues: PageIssue[] = [];

  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (shouldIgnoreConsoleError(text)) return;
    issues.push({ path: pathLabel, kind: "console", message: text });
  });

  page.on("pageerror", (err) => {
    issues.push({
      path: pathLabel,
      kind: "pageerror",
      message: err.message,
    });
  });

  return issues;
}

function shouldIgnoreConsoleError(text: string): boolean {
  const ignored = [
    "favicon",
    "Failed to load resource",
    "net::ERR_BLOCKED_BY_CLIENT",
  ];
  return ignored.some((part) => text.includes(part));
}

export async function assertHealthyPage(page: Page, pathLabel: string) {
  await expect(page.getByText("Something went wrong!")).toHaveCount(0);
  await expect(
    page.getByText("useAuth must be used within AuthProvider"),
  ).toHaveCount(0);

  const title = await page.title();
  expect(title.length, `${pathLabel}: empty document title`).toBeGreaterThan(0);
}

export async function dismissCookieBanner(page: Page) {
  const accept = page.getByRole("button", {
    name: /ยอมรับทั้งหมด|accept all/i,
  });
  if (await accept.isVisible({ timeout: 2000 }).catch(() => false)) {
    await accept.click();
  }
}

export async function visitAndCheck(
  page: Page,
  url: string,
  issues: PageIssue[],
  options?: { waitUntil?: "load" | "domcontentloaded" | "networkidle" },
) {
  const response = await page.goto(url, {
    waitUntil: options?.waitUntil ?? "domcontentloaded",
  });
  expect(response, `${url}: no response`).toBeTruthy();
  expect(response!.status(), `${url}: HTTP ${response!.status()}`).toBeLessThan(
    400,
  );

  await page.waitForTimeout(1500);
  await dismissCookieBanner(page);
  await assertHealthyPage(page, url);

  const uiErrors = await page
    .locator('[role="alert"], .text-destructive')
    .allTextContents();
  for (const text of uiErrors) {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 300) continue;
    if (/เข้าสู่ระบบ|login|required/i.test(trimmed)) continue;
    issues.push({ path: url, kind: "ui", message: trimmed });
  }
}

export function smokeCredentials() {
  const email =
    process.env.SMOKE_TEST_EMAIL?.trim() ||
    process.env.SMOKE_ADMIN_EMAIL?.trim() ||
    "";
  const password =
    process.env.SMOKE_TEST_PASSWORD?.trim() ||
    process.env.TEST_USER_PASSWORD?.trim() ||
    "";
  return { email, password, hasCredentials: Boolean(email && password) };
}

export async function loginAsAdmin(page: Page) {
  const { email, password } = smokeCredentials();

  await page.goto("/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.locator('form button[type="submit"]').click();

  await page.waitForURL(/\/account/, { timeout: 20_000 });
  await assertHealthyPage(page, "/account (after login)");
}
