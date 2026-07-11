import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test, type Page } from "@playwright/test";

import {
  expectNoRuntimeFailures,
  observeRuntimeDiagnostics,
} from "../foundation/runtime-diagnostics";

const route = "/preview/open-proving-ground/moments-qa";
const screenshotDirectory = resolve(
  process.cwd(),
  ".quality-reports/content/screenshots",
);
const viewports = [
  { height: 900, name: "1440", width: 1440 },
  { height: 900, name: "768", width: 768 },
  { height: 800, name: "640", width: 640 },
  { height: 844, name: "390", width: 390 },
] as const;

async function loadAllImages(page: Page): Promise<void> {
  const images = page.locator("[data-moments-layout-qa] img");

  for (let index = 0; index < (await images.count()); index += 1) {
    await images.nth(index).scrollIntoViewIfNeeded();
  }

  await expect
    .poll(() =>
      images.evaluateAll((elements) =>
        elements.every(
          (element) =>
            (element as HTMLImageElement).complete &&
            (element as HTMLImageElement).naturalWidth > 0,
        ),
      ),
    )
    .toBe(true);

  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    window.scrollTo({ behavior: "auto", top: 0 });
  });
}

test.beforeAll(() => {
  mkdirSync(screenshotDirectory, { recursive: true });
});

test("the layout fixture remains private and explicitly non-indexable", async ({
  page,
}) => {
  const response = await page.goto(route);

  expect(response?.status()).toBe(200);
  expect(response?.headers()["cache-control"]).toContain("no-store");
  expect(response?.headers()["x-robots-tag"]).toContain("noindex");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/i,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /nofollow/i,
  );
  await expect(page.locator("[data-moments-layout-qa]")).toHaveCount(1);
  await expect(
    page.getByText(/not an approved Moments publication asset/i),
  ).toBeVisible();
});

for (const viewport of viewports) {
  test(`${viewport.width}px renders all four Moments modes without overflow`, async ({
    page,
  }, testInfo) => {
    const diagnostics = observeRuntimeDiagnostics(page);
    await page.setViewportSize({
      height: viewport.height,
      width: viewport.width,
    });
    await page.goto(route);

    const sequence = page.locator(".opg-moments-sequence > li");
    await expect(sequence).toHaveCount(4);
    expect(
      await sequence.evaluateAll((items) =>
        items.map((item) => item.getAttribute("data-mode")),
      ),
    ).toEqual(["lead", "evidence", "portrait", "contact-sheet"]);

    await expect(sequence.nth(0).locator("figure")).toHaveCount(1);
    await expect(sequence.nth(1).locator("figure")).toHaveCount(1);
    await expect(sequence.nth(2).locator("figure")).toHaveCount(1);
    await expect(sequence.nth(3).locator("figure")).toHaveCount(3);

    await loadAllImages(page);

    const currentSources = await page
      .locator("[data-moments-layout-qa] img")
      .evaluateAll((images) =>
        images.map(
          (image) => new URL((image as HTMLImageElement).currentSrc).pathname,
        ),
      );
    if (viewport.width <= 639) {
      expect(currentSources).toHaveLength(6);
      expect(currentSources.every((src) => src.endsWith("-mobile.webp"))).toBe(
        true,
      );
    } else {
      expect(currentSources).toHaveLength(6);
      expect(currentSources.every((src) => !src.endsWith("-mobile.webp"))).toBe(
        true,
      );
    }

    const contactSheetColumns = await sequence
      .nth(3)
      .locator(".opg-moment-contact-sheet figure")
      .evaluateAll(
        (figures) =>
          new Set(
            figures.map((figure) =>
              Math.round(figure.getBoundingClientRect().left),
            ),
          ).size,
      );
    expect(contactSheetColumns).toBe(viewport.width >= 768 ? 2 : 1);

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(
      overflow,
      `${viewport.width}px horizontal overflow`,
    ).toBeLessThanOrEqual(1);

    await page.screenshot({
      fullPage: true,
      path: resolve(
        screenshotDirectory,
        `moments-layout-qa-${viewport.name}.png`,
      ),
    });
    await expectNoRuntimeFailures(diagnostics, testInfo);
  });
}
