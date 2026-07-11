import { defineConfig } from "@playwright/test";

const port = 3105;
const baseURL = `http://127.0.0.1:${port}`;
const previewToken = "portfolio-v1-content-preview-test-token";
const previewAuthorization = `Basic ${Buffer.from(
  `preview:${previewToken}`,
).toString("base64")}`;
const serverEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) => key !== "NO_COLOR" && key !== "FORCE_COLOR",
  ),
);

export default defineConfig({
  testDir: "./tests/content",
  outputDir: "./test-results/content",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never", outputFolder: ".quality-reports/content/playwright-report" }]]
    : [["list"], ["html", { open: "never", outputFolder: ".quality-reports/content/playwright-report" }]],
  use: {
    baseURL,
    browserName: "chromium",
    colorScheme: "light",
    extraHTTPHeaders: {
      Authorization: previewAuthorization,
    },
    locale: "en-US",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    viewport: { width: 1280, height: 800 },
  },
  projects: [
    {
      name: "content-preview",
      testIgnore: "**/content-preview.no-js.spec.ts",
    },
    {
      name: "content-preview-no-js",
      testMatch: "**/content-preview.no-js.spec.ts",
      use: { javaScriptEnabled: false },
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
