import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  expectNoRuntimeFailures,
  observeRuntimeDiagnostics,
} from "./runtime-diagnostics";

const screenshotDirectory = resolve(
  process.cwd(),
  ".quality-reports/foundation/screenshots",
);

test("essential evidence and navigation survive without JavaScript", async ({
  page,
}, testInfo) => {
  const runtimeDiagnostics = observeRuntimeDiagnostics(page);
  const response = await page.goto("/preview/open-proving-ground");

  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/i,
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.locator('[data-foundation-component="metadata-line"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-foundation-component="evidence-figure"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-foundation-component="evidence-caption"]'),
  ).toBeVisible();

  const firstAction = page.locator(
    '[data-foundation-component="action-link"][href="#evidence"]',
  );
  await expect(firstAction).toBeVisible();

  const hiddenEssentialContent = await page
    .locator(
      [
        "h1",
        '[data-foundation-component="metadata-line"]',
        '[data-foundation-component="action-link"]',
        '[data-foundation-component="evidence-figure"]',
        '[data-foundation-component="evidence-caption"]',
      ].join(","),
    )
    .evaluateAll((elements) =>
      elements.flatMap((element) => {
        const style = getComputedStyle(element);
        return style.display === "none" ||
          style.visibility !== "visible" ||
          Number.parseFloat(style.opacity) === 0
          ? [element.tagName]
          : [];
      }),
    );
  expect(hiddenEssentialContent).toEqual([]);

  await page.keyboard.press("Tab");
  await expect(firstAction).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#evidence$/);
  await expect(page.locator("#evidence")).toBeInViewport();

  mkdirSync(screenshotDirectory, { recursive: true });
  const screenshotPath = resolve(
    screenshotDirectory,
    `${testInfo.project.name}.png`,
  );
  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: screenshotPath,
  });
  await testInfo.attach("no-js-screenshot", {
    contentType: "image/png",
    path: screenshotPath,
  });
  await expectNoRuntimeFailures(runtimeDiagnostics, testInfo, {
    allowJavaScriptDisabledNextChunks: true,
  });
});
