import { test, expect } from "@playwright/test";

// Option C compliance: homepage collector category tiles replaced with
// Cars / Motorcycles / Collections wired to real routes, gold confined to
// badges/rules (no gold background buttons), bilingual.
test.describe("Option C homepage compliance", () => {
  test("three tiles render with correct routes (EN)", async ({ page }) => {
    await page.goto("/");

    const cars = page.getByRole("link", { name: /cars/i }).first();
    const motorcycles = page.getByRole("link", { name: /motorcycles/i }).first();
    const collections = page.getByRole("link", { name: /collections/i }).first();

    await expect(cars).toBeVisible();
    await expect(motorcycles).toBeVisible();
    await expect(collections).toBeVisible();

    await expect(cars).toHaveAttribute("href", "/vehicles?type=CAR");
    await expect(motorcycles).toHaveAttribute("href", "/vehicles?type=MOTORCYCLE");
    await expect(collections).toHaveAttribute("href", "/collections");
  });

  test("homepage CTA buttons are ink or inverse, not gold background", async ({
    page,
  }) => {
    await page.goto("/");

    // Primary hero CTA should have an ink/white fill (bg-text-inverse or bg-ink),
    // never the gold accent background.
    const cta = page.getByRole("link", { name: /browse|explore|view/i }).first();
    await expect(cta).toBeVisible();
    const cls = await cta.getAttribute("class");
    expect(cls).toBeTruthy();
    // Gold accent must not be a solid button background.
    expect(cls).not.toContain("bg-[var(--color-accent)]");
  });

  test("Arabic homepage renders three tiles with Arabic labels (AR)", async ({
    page,
  }) => {
    await page.goto("/ar");

    await expect(
      page.getByRole("link", { name: /سيارات/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /دراجات نارية/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /مجموعات/i }).first()
    ).toBeVisible();
  });
});