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

test("a 1440 by 900 viewport reflows cleanly at a 200 percent surrogate", async ({
  page,
}, testInfo) => {
  const runtimeDiagnostics = observeRuntimeDiagnostics(page);
  const response = await page.goto("/preview/open-proving-ground");

  expect(response?.status()).toBe(200);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const geometry = await page.evaluate(() => {
    const inspected = [
      document.querySelector("h1"),
      document.querySelector('[data-foundation-component="metadata-line"]'),
      document.querySelector('[data-foundation-component="action-link"]'),
      document.querySelector('[data-foundation-component="evidence-figure"]'),
    ];

    return {
      clientWidth: document.documentElement.clientWidth,
      clipped: inspected.flatMap((element) => {
        if (!(element instanceof HTMLElement)) return ["missing element"];
        const bounds = element.getBoundingClientRect();
        return bounds.left < 0 || bounds.right > window.innerWidth
          ? [element.dataset.foundationComponent ?? element.tagName]
          : [];
      }),
      columns: getComputedStyle(
        document.querySelector<HTMLElement>("[data-grid-specimen]")!,
      ).gridTemplateColumns.split(" ").length,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });

  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
  expect(geometry.clipped).toEqual([]);
  expect(geometry.columns).toBe(4);

  const firstAction = page.locator(
    '[data-foundation-component="action-link"][href="#evidence"]',
  );
  await page.keyboard.press("Tab");
  await expect(firstAction).toBeFocused();
  await expect(firstAction).toBeInViewport();

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
  await testInfo.attach("reflow-screenshot", {
    contentType: "image/png",
    path: screenshotPath,
  });
  await expectNoRuntimeFailures(runtimeDiagnostics, testInfo);
});
