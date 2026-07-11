import { defineConfig } from "@playwright/test";

const port = 3104;
const baseURL = `http://127.0.0.1:${port}`;
const visualTest = "**/foundation.visual.spec.ts";
const focusTest = "**/foundation.focus.spec.ts";
const noJavaScriptTest = "**/foundation.no-js.spec.ts";
const reflowTest = "**/foundation.reflow.spec.ts";
const serverEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) => key !== "NO_COLOR" && key !== "FORCE_COLOR",
  ),
);

const chromiumBase = {
  browserName: "chromium" as const,
  deviceScaleFactor: 1,
  locale: "en-US",
};

export default defineConfig({
  testDir: "./tests/foundation",
  outputDir: "./test-results/foundation",
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
            outputFolder: ".quality-reports/foundation/playwright-report",
          },
        ],
      ]
    : [
        ["list"],
        [
          "html",
          {
            open: "never",
            outputFolder: ".quality-reports/foundation/playwright-report",
          },
        ],
      ],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "foundation-desktop-light",
      testMatch: [visualTest, focusTest],
      use: {
        ...chromiumBase,
        viewport: { width: 1440, height: 900 },
        colorScheme: "light",
      },
    },
    {
      name: "foundation-tablet-light",
      testMatch: visualTest,
      use: {
        ...chromiumBase,
        viewport: { width: 768, height: 1024 },
        colorScheme: "light",
        hasTouch: true,
      },
    },
    {
      name: "foundation-mobile-light",
      testMatch: visualTest,
      use: {
        ...chromiumBase,
        viewport: { width: 390, height: 844 },
        colorScheme: "light",
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: "foundation-desktop-dark",
      testMatch: visualTest,
      use: {
        ...chromiumBase,
        viewport: { width: 1440, height: 900 },
        colorScheme: "dark",
      },
    },
    {
      name: "foundation-tablet-dark",
      testMatch: visualTest,
      use: {
        ...chromiumBase,
        viewport: { width: 768, height: 1024 },
        colorScheme: "dark",
        hasTouch: true,
      },
    },
    {
      name: "foundation-mobile-dark",
      testMatch: visualTest,
      use: {
        ...chromiumBase,
        viewport: { width: 390, height: 844 },
        colorScheme: "dark",
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: "foundation-desktop-no-js",
      testMatch: noJavaScriptTest,
      use: {
        ...chromiumBase,
        viewport: { width: 1440, height: 900 },
        colorScheme: "light",
        javaScriptEnabled: false,
      },
    },
    {
      name: "foundation-mobile-no-js",
      testMatch: noJavaScriptTest,
      use: {
        ...chromiumBase,
        viewport: { width: 390, height: 844 },
        colorScheme: "light",
        hasTouch: true,
        isMobile: true,
        javaScriptEnabled: false,
      },
    },
    {
      name: "foundation-reflow-200pct",
      testMatch: reflowTest,
      use: {
        ...chromiumBase,
        viewport: { width: 720, height: 450 },
        colorScheme: "light",
      },
    },
  ],
  webServer: {
    command:
      "npm run build && npm run start -- --hostname 127.0.0.1 --port 3104",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...serverEnvironment,
      PORTFOLIO_V1_PREVIEW: "1",
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
