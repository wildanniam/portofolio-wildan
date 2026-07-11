import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import {
  expectNoRuntimeFailures,
  observeRuntimeDiagnostics,
} from "./runtime-diagnostics";

const previewPath = "/preview/open-proving-ground";
const canvas = "rgb(244, 245, 243)";
const screenshotDirectory = resolve(
  process.cwd(),
  ".quality-reports/foundation/screenshots",
);

const viewportContracts = {
  "foundation-desktop-light": { columns: 12, gutter: 57.6 },
  "foundation-tablet-light": { columns: 8, gutter: 30.72 },
  "foundation-mobile-light": { columns: 4, gutter: 16 },
  "foundation-desktop-dark": { columns: 12, gutter: 57.6 },
  "foundation-tablet-dark": { columns: 8, gutter: 30.72 },
  "foundation-mobile-dark": { columns: 4, gutter: 16 },
} as const;

async function waitForFontsAndImages(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images, (image) =>
        image.complete
          ? image.decode().catch(() => undefined)
          : new Promise<void>((resolveImage) => {
              image.addEventListener("load", () => resolveImage(), {
                once: true,
              });
              image.addEventListener("error", () => resolveImage(), {
                once: true,
              });
            }),
      ),
    );
  });
}

test("the editorial foundation obeys its visual and accessibility contracts", async ({
  page,
}, testInfo) => {
  const runtimeDiagnostics = observeRuntimeDiagnostics(page);
  const contract =
    viewportContracts[
      testInfo.project.name as keyof typeof viewportContracts
    ];
  expect(contract).toBeDefined();

  const response = await page.goto(previewPath);

  expect(response?.status()).toBe(200);
  await waitForFontsAndImages(page);
  await expect(page.locator('[data-site-shell="v1"]')).toHaveCount(1);
  await expect(page.locator('[data-site-shell="legacy"]')).toHaveCount(0);
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator("main[data-foundation-page]")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/i,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /nofollow/i,
  );

  await expect(
    page.locator('[data-foundation-component="metadata-line"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-foundation-component="evidence-figure"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-foundation-component="evidence-caption"]'),
  ).toBeVisible();
  await expect(
    page.locator(
      '[data-foundation-component="action-link"][href="#evidence"]',
    ),
  ).toBeVisible();
  await expect(page.locator("#evidence")).toBeAttached();

  const imageState = await page
    .locator('[data-foundation-component="evidence-figure"] img')
    .evaluate((image: HTMLImageElement) => ({
      complete: image.complete,
      naturalWidth: image.naturalWidth,
    }));
  expect(imageState.complete).toBe(true);
  expect(imageState.naturalWidth).toBeGreaterThan(0);

  const layout = await page.evaluate(() => {
    const shell = document.querySelector<HTMLElement>("[data-portfolio-v1]");
    const container = document.querySelector<HTMLElement>(
      '[data-foundation-component="site-container"]',
    );
    const grid = document.querySelector<HTMLElement>("[data-grid-specimen]");
    const figure = document.querySelector<HTMLElement>(
      '[data-foundation-component="evidence-figure"]',
    );

    if (!shell || !container || !grid || !figure) {
      throw new Error("The foundation layout hooks are incomplete.");
    }

    const shellStyle = getComputedStyle(shell);
    const containerStyle = getComputedStyle(container);
    const gridStyle = getComputedStyle(grid);
    const htmlStyle = getComputedStyle(document.documentElement);
    const bodyStyle = getComputedStyle(document.body);
    const figureBounds = figure.getBoundingClientRect();
    const media = figure.querySelector<HTMLElement>(
      ".opg-evidence-figure__media",
    );
    const image = figure.querySelector<HTMLImageElement>("img");

    if (!media || !image) {
      throw new Error("The foundation evidence media is incomplete.");
    }

    const imageStyle = getComputedStyle(image);
    const mediaBounds = media.getBoundingClientRect();

    return {
      bodyBackground: bodyStyle.backgroundColor,
      bodyColorScheme: bodyStyle.colorScheme,
      bodyOverflowX: bodyStyle.overflowX,
      bodyScrollWidth: document.body.scrollWidth,
      bodyClientWidth: document.body.clientWidth,
      columns: gridStyle.gridTemplateColumns
        .split(" ")
        .filter(Boolean).length,
      figureLeft: figureBounds.left,
      figureRight: figureBounds.right,
      gutter: Number.parseFloat(containerStyle.paddingLeft),
      htmlBackground: htmlStyle.backgroundColor,
      htmlColorScheme: htmlStyle.colorScheme,
      htmlOverflowX: htmlStyle.overflowX,
      htmlScrollWidth: document.documentElement.scrollWidth,
      htmlClientWidth: document.documentElement.clientWidth,
      imageObjectFit: imageStyle.objectFit,
      mediaAspectRatio: mediaBounds.width / mediaBounds.height,
      shellBackground: shellStyle.backgroundColor,
      shellColor: shellStyle.color,
      shellColorScheme: shellStyle.colorScheme,
      viewportWidth: window.innerWidth,
    };
  });

  expect(layout.columns).toBe(contract.columns);
  expect(layout.gutter).toBeCloseTo(contract.gutter, 1);
  expect(layout.shellBackground).toBe(canvas);
  expect(layout.htmlBackground).toBe(canvas);
  expect(layout.bodyBackground).toBe(canvas);
  expect(layout.shellColor).toBe("rgb(43, 48, 53)");
  expect(layout.shellColorScheme).toBe("light");
  expect(layout.htmlColorScheme).toBe("light");
  expect(layout.bodyColorScheme).toBe("light");
  expect(["hidden", "clip"]).not.toContain(layout.htmlOverflowX);
  expect(["hidden", "clip"]).not.toContain(layout.bodyOverflowX);
  expect(layout.htmlScrollWidth).toBeLessThanOrEqual(layout.htmlClientWidth);
  expect(layout.bodyScrollWidth).toBeLessThanOrEqual(layout.bodyClientWidth);
  expect(layout.figureLeft).toBeGreaterThanOrEqual(0);
  expect(layout.figureRight).toBeLessThanOrEqual(layout.viewportWidth);

  if (contract.columns === 4) {
    expect(layout.imageObjectFit).toBe("cover");
    expect(layout.mediaAspectRatio).toBeCloseTo(1, 1);
  } else {
    expect(layout.imageObjectFit).toBe("contain");
    expect(layout.mediaAspectRatio).toBeCloseTo(1.6, 1);
  }

  if (testInfo.project.name.endsWith("dark")) {
    expect(
      await page.evaluate(
        () => matchMedia("(prefers-color-scheme: dark)").matches,
      ),
    ).toBe(true);
  }

  const axeResult = await new AxeBuilder({ page })
    .withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
      "wcag22aa",
    ])
    .analyze();
  const blocking = axeResult.violations
    .filter(
      (violation) =>
        violation.id === "color-contrast" ||
        violation.impact === "serious" ||
        violation.impact === "critical",
    )
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.length,
    }));

  await testInfo.attach("axe-result", {
    body: Buffer.from(JSON.stringify(axeResult, null, 2)),
    contentType: "application/json",
  });
  expect(blocking).toEqual([]);

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
  await testInfo.attach("foundation-screenshot", {
    contentType: "image/png",
    path: screenshotPath,
  });
  await expectNoRuntimeFailures(runtimeDiagnostics, testInfo);
});
