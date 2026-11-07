import { test, expect } from "@playwright/test";

test.describe("vehicles listings (EN)", () => {
  test("public vehicles page renders the listings section", async ({
    page,
  }) => {
    await page.goto("/vehicles");

    // Page header renders
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Vehicles"
    );

    // Results count line renders (DB may be empty in CI -> "0 vehicles found")
    await expect(page.getByText(/vehicles? found/i)).toBeVisible();

    // Listing cards (h3 titles) or the empty-state heading is shown
    await expect(
      page.locator("main").getByRole("heading", { level: 3 }).first()
    ).toBeVisible();
  });
});
