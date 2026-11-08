import { defineConfig, devices } from "@playwright/test";

// Production-only regression runner: no webServer (tests the LIVE site,
// addresses are absolute in prod-regression.e2e.ts). Mobile + desktop.
export default defineConfig({
  testDir: "./e2e",
  testMatch: /prod-regression\.e2e\.ts/,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  use: { trace: "on-first-retry", baseURL: "https://fidelisauto.com" },
  webServer: undefined,
  projects: [
    { name: "chromium-mobile", use: { ...devices["Pixel 7"] } },
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
  ],
});