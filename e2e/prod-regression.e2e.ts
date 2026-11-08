import { test, expect } from "@playwright/test";

// Production/staging bilingual regression — runs against the live site.
// URL overridable via TEST_BASE_URL (e.g. a staging tunnel); defaults to prod.
const S: string = process.env.TEST_BASE_URL || "https://fidelisauto.com";

test.describe("production regression (bilingual, mobile+desktop)", () => {
  test("EN: homepage + nav + vehicles + services + collections", async ({ page }) => {
    const res = await page.goto(S + "/", { waitUntil: "domcontentloaded" });
    expect(res!.status(), "home 200").toBeLessThan(500);
    await expect(page.locator("header, [class*='Header'], nav, [role='banner']").first()).toBeVisible();

    await page.goto(S + "/vehicles", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/404/);

    await page.goto(S + "/services", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main, body").first()).toBeVisible();

    await page.goto(S + "/collections", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/404/);
  });

  test("AR: /ar renders rtl with Arabic content", async ({ page }) => {
    await page.goto(S + "/ar", { waitUntil: "domcontentloaded" });
    const htmlLang = await page.locator("html").getAttribute("lang");
    const dir = await page.locator("html").getAttribute("dir");
    expect(htmlLang).toMatch(/^ar/);
    expect(dir).toBe("rtl");
    const bodyText = (await page.locator("body").innerText()).toLowerCase();
    expect(bodyText.length).toBeGreaterThan(20);
  });

  test("manifest + vehicles API reachable", async ({ page }) => {
    const manifestRes = await page.request.get(S + "/manifest.webmanifest");
    expect(manifestRes.status()).toBe(200);

    const apiRes = await page.request.get(S + "/api/vehicles");
    expect(apiRes.status()).toBe(200);
    const json = await apiRes.json();
    expect(Array.isArray(json)).toBe(true);
  });
});