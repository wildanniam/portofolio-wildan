import { defineConfig, devices } from "@playwright/test";

const port = 3107;
const baseURL = `http://127.0.0.1:${port}`;
const previewToken = "portfolio-v1-release-candidate-test-token";
const previewAuthorization = `Basic ${Buffer.from(
  `preview:${previewToken}`,
).toString("base64")}`;
const serverEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) => key !== "NO_COLOR" && key !== "FORCE_COLOR",
  ),
);
const viewport = { height: 800, width: 1280 };

export default defineConfig({
  testDir: "./tests/release",
  outputDir: "./test-results/release",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [
        ["github"],
        [
          "html",
          {
            open: "never",
            outputFolder: ".quality-reports/release/playwright-report",
          },
        ],
      ]
    : [
        ["list"],
        [
          "html",
          {
            open: "never",
            outputFolder: ".quality-reports/release/playwright-report",
          },
        ],
      ],
  use: {
    baseURL,
    colorScheme: "light",
    extraHTTPHeaders: {
      Authorization: previewAuthorization,
    },
    locale: "en-US",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "release-chromium",
      use: { ...devices["Desktop Chrome"], viewport },
    },
    {
      name: "release-firefox",
      use: { ...devices["Desktop Firefox"], viewport },
    },
    {
      name: "release-webkit",
      use: { ...devices["Desktop Safari"], viewport },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...serverEnvironment,
      FORCE_COLOR: "0",
      PORTFOLIO_V1_PREVIEW: "1",
      PORTFOLIO_V1_PREVIEW_TOKEN: previewToken,
    },
    gracefulShutdown: {
      signal: "SIGTERM",
      timeout: 10_000,
    },
    stdout: "pipe",
    stderr: "pipe",
  },
});
