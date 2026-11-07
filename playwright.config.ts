import { defineConfig, devices } from "@playwright/test";

/**
 * E2E smoke suite — PWA installability + core public flows.
 *
 * The webServer runs `next start`, which requires a production build to
 * exist: CI builds before running the suite (`npm run build` && test:e2e).
 * Locally: `npm run build && npm run test:e2e`.
 *
 * Specs are named *.e2e.ts so vitest (default `npm test` include) never
 * picks them up.
 */
const PORT = 3210;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.e2e\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
