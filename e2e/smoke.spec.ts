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
  "/shop",
  "/products/mock-zebra-blackout",
  "/products/mock-roller-blackout-white",
  "/cart",
  "/compare",
  "/configurator",
  "/quick-order",
  "/contact",
  "/about",
] as const;

const AUTH_ROUTES = [
  "/account?tab=dashboard",
  "/account/orders",
  "/account/wishlist",
  "/checkout",
  "/admin",
  "/admin/products",
  "/admin/orders",
] as const;

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

  test("shop → product → add to cart flow", async ({ page }) => {
    const issues = attachIssueCollectors(page, "cart-flow");

    await visitAndCheck(page, "/shop", issues);
    await visitAndCheck(page, "/products/mock-zebra-blackout", issues);

    const addButton = page
      .getByRole("button", { name: /ตะกร้า|cart/i })
      .first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1500);
    }

    await visitAndCheck(page, "/cart", issues);
    reportIssues(issues);
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
