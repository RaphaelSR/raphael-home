import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.SITE_URL || "http://127.0.0.1:3026",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["iPhone 13"] } },
  ],
  webServer: process.env.SITE_URL
    ? undefined
    : {
        command: "npm run preview -- --port 3026 --strictPort",
        url: "http://127.0.0.1:3026",
        reuseExistingServer: !process.env.CI,
      },
});
