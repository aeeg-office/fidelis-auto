import { test, expect } from "@playwright/test";

test.describe("Arabic locale", () => {
  test("home renders RTL with Arabic content", async ({ page }) => {
    await page.goto("/ar");

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar-EG");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "نحن نحب السيارات"
    );
  });
});
