import { defineConfig, devices } from "@playwright/test";

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;
const serverEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) => key !== "NO_COLOR" && key !== "FORCE_COLOR",
  ),
);

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command:
      "npm run build && npm run start -- --hostname 127.0.0.1 --port 3100",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...serverEnvironment,
      PORTFOLIO_V1_PREVIEW: "0",
      FORCE_COLOR: "0",
    },
    gracefulShutdown: {
      signal: "SIGTERM",
      timeout: 10_000,
    },
    stdout: "pipe",
    stderr: "pipe",
  },
});
