import { defineConfig, devices } from "@playwright/test";

const isCi = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  reporter: isCi ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: isCi ? "npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !isCi,
    timeout: 120_000,
  },
});
