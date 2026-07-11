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

test("the first native tab stop exposes the approved focus treatment", async ({
  page,
}, testInfo) => {
  const runtimeDiagnostics = observeRuntimeDiagnostics(page);
  await page.goto("/preview/open-proving-ground");
  const firstAction = page.locator(
    '[data-foundation-component="action-link"][href="#evidence"]',
  );

  await page.keyboard.press("Tab");
  await expect(firstAction).toBeFocused();

  const focus = await firstAction.evaluate((element) => {
    const style = getComputedStyle(element);
    const bounds = element.getBoundingClientRect();
    return {
      bottom: bounds.bottom,
      boxShadow: style.boxShadow,
      left: bounds.left,
      outlineColor: style.outlineColor,
      outlineOffset: style.outlineOffset,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      right: bounds.right,
      top: bounds.top,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
    };
  });

  expect(focus.outlineStyle).toBe("solid");
  expect(focus.outlineWidth).toBe("2px");
  expect(focus.outlineColor).toBe("rgb(36, 72, 216)");
  expect(focus.outlineOffset).toBe("3px");
  expect(focus.boxShadow).toContain("rgb(244, 245, 243)");
  expect(focus.left).toBeGreaterThanOrEqual(0);
  expect(focus.right).toBeLessThanOrEqual(focus.viewportWidth);
  expect(focus.top).toBeGreaterThanOrEqual(0);
  expect(focus.bottom).toBeLessThanOrEqual(focus.viewportHeight);

  mkdirSync(screenshotDirectory, { recursive: true });
  const screenshotPath = resolve(
    screenshotDirectory,
    `${testInfo.project.name}-focus.png`,
  );
  await page.screenshot({ animations: "disabled", path: screenshotPath });
  await testInfo.attach("focus-screenshot", {
    contentType: "image/png",
    path: screenshotPath,
  });
  await expectNoRuntimeFailures(runtimeDiagnostics, testInfo);
});
