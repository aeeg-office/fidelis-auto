import { test, expect } from "@playwright/test";

test.describe("homepage (EN)", () => {
  test("loads and renders header navigation", async ({ page }) => {
    await page.goto("/");

    // Brand + header banner visible (nav collapses into the menu on mobile)
    await expect(
      page.getByRole("link", { name: /fidelis auto/i }).first()
    ).toBeVisible();
    await expect(page.getByRole("banner").first()).toBeVisible();

    // Hero renders
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Love Cars"
    );
  });
});
