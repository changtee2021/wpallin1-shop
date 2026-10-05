import { test, expect } from "@playwright/test";

import {
  attachIssueCollectors,
  loginAsAdmin,
  smokeCredentials,
  visitAndCheck,
  type PageIssue,
} from "./helpers";

const GUEST_ROUTES = [
  "/",
  "/products",
  "/products?category=tracks",
  "/products/wood-blinds",
  "/projects",
  "/projects/colors-of-buriram-2025",
  "/about",
  "/partners",
  "/catalogs",
  "/contact",
  "/contact?topic=quote&product=zip-blinds",
  "/faq",
  "/privacy",
] as const;

const AUTH_ROUTES = ["/admin", "/admin/products", "/admin/quotations"] as const;

test.describe("wpallin1-shop smoke", () => {
  test("guest storefront pages load without runtime errors", async ({
    page,
  }) => {
    const issues: PageIssue[] = [];

    for (const route of GUEST_ROUTES) {
      const routeIssues = attachIssueCollectors(page, route);
      await visitAndCheck(page, route, issues);
      issues.push(...routeIssues);
    }

    reportIssues(issues);
  });

  test("public health API", async ({ request }) => {
    const res = await request.get("/api/public/health");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { ok?: boolean; service?: string };
    expect(body.ok).toBe(true);
    expect(body.service).toBeTruthy();
  });

  test("product → request a quote prefills the product", async ({ page }) => {
    const issues = attachIssueCollectors(page, "quote-flow");

    await visitAndCheck(page, "/products/zip-blinds", issues);
    await page
      .getByRole("main")
      .getByRole("link", { name: /ขอใบเสนอราคา|request a quote/i })
      .first()
      .click();
    await page.waitForURL(/topic=quote/);
    await expect(
      page.locator('select[name="productInterest"] option:checked'),
    ).toHaveText(/ซิป|zip/i);
    reportIssues(issues);
  });

  test("commerce routes redirect when commerce is off", async ({ page }) => {
    for (const route of ["/shop", "/cart", "/checkout", "/account"]) {
      await page.goto(route);
      await expect(page).not.toHaveURL(new RegExp(`${route}$`));
    }
  });

  test("authenticated admin flows", async ({ page }) => {
    const { hasCredentials } = smokeCredentials();
    test.skip(
      !hasCredentials,
      "Set SMOKE_TEST_EMAIL and SMOKE_TEST_PASSWORD in .env to run admin smoke",
    );

    const issues: PageIssue[] = [];
    attachIssueCollectors(page, "auth");

    await loginAsAdmin(page);

    for (const route of AUTH_ROUTES) {
      const routeIssues = attachIssueCollectors(page, route);
      await visitAndCheck(page, route, issues);
      issues.push(...routeIssues);
    }

    reportIssues(issues);
  });
});

function reportIssues(issues: PageIssue[]) {
  const unique = dedupeIssues(issues);
  if (unique.length === 0) return;

  const report = unique
    .map((i) => `[${i.kind}] ${i.path}\n  ${i.message}`)
    .join("\n\n");

  expect(unique, `Smoke issues found:\n\n${report}`).toHaveLength(0);
}

function dedupeIssues(issues: PageIssue[]) {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.kind}|${issue.path}|${issue.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
