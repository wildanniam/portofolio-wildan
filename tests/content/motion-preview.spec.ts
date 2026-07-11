import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import {
  expectNoRuntimeFailures,
  observeRuntimeDiagnostics,
} from "../foundation/runtime-diagnostics";

const route = "/preview/open-proving-ground/site";
const rootSelector = "#flagship-work-explorer-interactive";

function observeScriptPaths(page: Page): string[] {
  const scripts: string[] = [];
  page.on("response", (response) => {
    if (response.request().resourceType() === "script") {
      scripts.push(new URL(response.url()).pathname);
    }
  });
  return scripts;
}

test("wide motion stays cold, loads at the explorer, and removes its inert overlay", async ({
  page,
}, testInfo) => {
  const diagnostics = observeRuntimeDiagnostics(page);
  const scriptResponses = observeScriptPaths(page);
  const mediaResponses: string[] = [];
  page.on("response", (response) => {
    if (response.request().resourceType() === "image") {
      mediaResponses.push(new URL(response.url()).pathname);
    }
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);

  const root = page.locator(rootSelector);
  await expect(root).toHaveAttribute("data-enhanced", "true");
  await page.waitForTimeout(1_000);
  const coldScripts = new Set(scriptResponses);
  await expect(root).toHaveAttribute("data-motion-state", "idle");
  await expect(page.locator("[data-explorer-motion-controller]")).toHaveCount(0);

  await page.evaluate(() => {
    let total = 0;
    const observer = new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) {
        const shift = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value?: number;
        };
        if (!shift.hadRecentInput) total += shift.value ?? 0;
      }
      (window as typeof window & { __opgMotionCls?: number }).__opgMotionCls =
        total;
    });
    observer.observe({ buffered: true, type: "layout-shift" });
  });

  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute("data-motion-state", "ready-wide");
  await expect(root).toHaveAttribute("data-motion-profile", "desktop-sticky");
  await expect(page.locator("[data-explorer-motion-controller]")).toHaveCount(1);
  expect(scriptResponses.some((script) => !coldScripts.has(script))).toBe(true);
  expect(
    mediaResponses.filter((path) =>
      /\/media\/projects\/(?:nova-ai|paygate|quorum)\//.test(path),
    ),
  ).toEqual([]);

  await page.evaluate(() => {
    const sheet = document.querySelector<HTMLElement>(
      ".opg-evidence-contact-sheet",
    );
    if (!sheet) throw new Error("Expected the Fradium evidence sheet.");
    const sheetTop = sheet.getBoundingClientRect().top + window.scrollY;
    const start = sheetTop - window.innerHeight * 0.72;
    const end = sheetTop + sheet.offsetHeight - window.innerHeight * 0.28;
    window.scrollTo({
      behavior: "auto",
      top: start + (end - start) * 0.68,
    });
  });

  const overlay = page.locator("[data-motion-overlay]");
  await expect(overlay).toHaveCount(1);
  await expect(root).toHaveAttribute("data-motion-phase", "inspect");
  const overlayState = await overlay.evaluate((node) => ({
    alt: node.querySelector("img")?.getAttribute("alt"),
    ariaHidden: node.getAttribute("aria-hidden"),
    focusables: node.querySelectorAll(
      'a[href], button, input, select, textarea, [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
    ).length,
    ids: Number(node.hasAttribute("id")) + node.querySelectorAll("[id]").length,
    hitShielded: (() => {
      const rect = node.getBoundingClientRect();
      const hit = document.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      );
      return hit === node.parentElement;
    })(),
    inert: (node as HTMLElement).inert,
    pointerEvents: getComputedStyle(node).pointerEvents,
    shield: (() => {
      const shield = node.parentElement;
      return {
        ariaHidden: shield?.getAttribute("aria-hidden"),
        focusables:
          shield?.querySelectorAll(
            'a[href], button, input, select, textarea, [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
          ).length ?? -1,
        pointerEvents: shield ? getComputedStyle(shield).pointerEvents : null,
      };
    })(),
    sourceSemantic: (() => {
      const source = document.querySelector<HTMLImageElement>(
        '[data-lead="true"] .opg-evidence-contact-sheet__media img',
      );
      return {
        altPresent: Boolean(source?.alt.trim()),
        ariaHidden: source?.getAttribute("aria-hidden") ?? null,
        visibility: source ? getComputedStyle(source).visibility : null,
      };
    })(),
    text: node.textContent?.trim() ?? "",
    withinEvidenceColumn: (() => {
      const rect = node.getBoundingClientRect();
      const panels = document
        .querySelector(".opg-project-explorer__panels")
        ?.getBoundingClientRect();
      return Boolean(
        panels &&
          rect.left >= panels.left - 1 &&
          rect.right <= panels.right + 1,
      );
    })(),
  }));
  expect(overlayState).toEqual({
    alt: "",
    ariaHidden: "true",
    focusables: 0,
    hitShielded: true,
    ids: 0,
    inert: true,
    pointerEvents: "none",
    shield: {
      ariaHidden: "true",
      focusables: 0,
      pointerEvents: "auto",
    },
    sourceSemantic: {
      altPresent: true,
      ariaHidden: null,
      visibility: "visible",
    },
    text: "",
    withinEvidenceColumn: true,
  });

  const activeMotionAxe = await new AxeBuilder({ page })
    .include(rootSelector)
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    activeMotionAxe.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    ),
  ).toEqual([]);

  await page.evaluate(() => window.scrollBy({ behavior: "auto", top: 1_400 }));
  await expect(overlay).toHaveCount(0);
  await expect(root).toHaveAttribute("data-motion-phase", "release");
  const cls = await page.evaluate(
    () =>
      (window as typeof window & { __opgMotionCls?: number }).__opgMotionCls ??
      0,
  );
  expect(cls).toBeLessThanOrEqual(0.001);
  await expectNoRuntimeFailures(diagnostics, testInfo);
});

test("enhanced selection is immediate, preserves focus, and follows history", async ({
  page,
}, testInfo) => {
  const diagnostics = observeRuntimeDiagnostics(page);
  await page.goto(route);

  const nova = page.getByRole("button", {
    name: "Preview evidence for Nova AI Wallet",
  });
  await nova.focus();
  await page.keyboard.press("Enter");
  await expect(nova).toBeFocused();
  await expect(nova).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.locator('[data-explorer-panel][data-project-slug="nova-ai"]'),
  ).toBeVisible();
  await expect(page.locator("[data-explorer-status]")).toHaveText(
    "Showing evidence for Nova AI Wallet.",
  );

  for (const project of ["PayGate", "Quorum"]) {
    await page
      .getByRole("button", { name: `Preview evidence for ${project}` })
      .click();
  }
  await expect(page).toHaveURL(/project=quorum/);
  await expect(
    page.locator('[data-explorer-panel][data-project-slug="quorum"]'),
  ).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/project=paygate/);
  await expect(
    page.locator('[data-explorer-panel][data-project-slug="paygate"]'),
  ).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/project=quorum/);
  await expect(page.locator("[data-motion-overlay]")).toHaveCount(0);
  await expect(page.locator(rootSelector)).toHaveAttribute(
    "data-motion-phase",
    "idle",
  );

  const axe = await new AxeBuilder({ page })
    .include(rootSelector)
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    axe.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    ),
  ).toEqual([]);
  await expectNoRuntimeFailures(diagnostics, testInfo);
});

test("rapid selection interrupts the travel visual and leaves one clean final state", async ({
  page,
}, testInfo) => {
  const diagnostics = observeRuntimeDiagnostics(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);

  const root = page.locator(rootSelector);
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute("data-motion-state", "ready-wide");

  await page.evaluate(() => {
    const sheet = document.querySelector<HTMLElement>(
      ".opg-evidence-contact-sheet",
    );
    if (!sheet) throw new Error("Expected the Fradium evidence sheet.");
    const sheetTop = sheet.getBoundingClientRect().top + window.scrollY;
    const start = sheetTop - window.innerHeight * 0.72;
    const end = sheetTop + sheet.offsetHeight - window.innerHeight * 0.28;
    window.scrollTo({
      behavior: "auto",
      top: start + (end - start) * 0.45,
    });
  });
  await expect(page.locator("[data-motion-overlay]")).toHaveCount(1);

  await page.evaluate(async () => {
    const values = ["nova-ai", "paygate", "quorum"];
    await new Promise<void>((resolve) => {
      values.forEach((value, index) => {
        window.setTimeout(() => {
          document
            .querySelector<HTMLButtonElement>(
              `[data-explorer-preview][value="${value}"]`,
            )
            ?.click();
          if (index === values.length - 1) {
            window.setTimeout(resolve, 120);
          }
        }, index * 40);
      });
    });
  });

  await expect(root).toHaveAttribute("data-active-project", "quorum");
  await expect(page).toHaveURL(/project=quorum/);
  await expect(
    page.locator('[data-explorer-panel][data-project-slug="quorum"]'),
  ).toBeVisible();
  await expect(page.locator("[data-explorer-status]")).toHaveText(
    "Showing evidence for Quorum.",
  );
  const quorumOverlay = page.locator("[data-motion-overlay]");
  await expect(quorumOverlay).toHaveCount(1);
  await expect(quorumOverlay.locator("img")).toHaveAttribute(
    "src",
    /\/media\/projects\/quorum\/discover-surface\.webp$/,
  );
  const quorumOverlayBounds = await quorumOverlay.boundingBox();
  expect(quorumOverlayBounds).not.toBeNull();
  expect(quorumOverlayBounds?.width).toBeGreaterThan(100);
  expect(quorumOverlayBounds?.height).toBeGreaterThan(100);
  await expect(page.locator("[data-explorer-motion-controller]")).toHaveCount(1);
  await expect(root).not.toHaveAttribute("data-motion-phase", "idle");
  await expect
    .poll(() =>
      page.locator("[data-explorer-panel]").evaluateAll((panels) =>
        panels
          .filter((panel) => panel.hasAttribute("hidden"))
          .every((panel) => {
          const style = (panel as HTMLElement).style;
          return !style.opacity && !style.transform && !style.visibility;
          }),
      ),
    )
    .toBe(true);

  await page
    .getByRole("button", { name: "Preview evidence for Nova AI Wallet" })
    .click();
  await page
    .getByRole("button", { name: "Preview evidence for Fradium" })
    .click();
  await page.evaluate(() => {
    const sheet = document.querySelector<HTMLElement>(
      ".opg-evidence-contact-sheet",
    );
    if (!sheet) throw new Error("Expected the restored Fradium evidence sheet.");
    const sheetTop = sheet.getBoundingClientRect().top + window.scrollY;
    const start = sheetTop - window.innerHeight * 0.72;
    const end = sheetTop + sheet.offsetHeight - window.innerHeight * 0.28;
    window.scrollTo({
      behavior: "auto",
      top: start + (end - start) * 0.255,
    });
  });
  await expect(page.locator("[data-motion-overlay]")).toHaveCount(1);
  await page.waitForTimeout(650);
  await expect(root).not.toHaveAttribute("data-motion-phase", "idle");
  await expect
    .poll(() =>
      page
        .locator(
          '[data-explorer-panel][data-project-slug="fradium"] ' +
            '[data-lead="true"] .opg-evidence-contact-sheet__media',
        )
        .evaluate((frame) => Number(getComputedStyle(frame).opacity)),
    )
    .toBeLessThan(0.01);
  const alignmentDelta = async () =>
    page.evaluate(() => {
      const source = document.querySelector<HTMLElement>(
        '[data-explorer-panel][data-project-slug="fradium"] ' +
          '[data-lead="true"] .opg-evidence-contact-sheet__media',
      );
      const shield = document.querySelector<HTMLElement>(
        "[data-motion-shield]",
      );
      if (!source || !shield) return Number.POSITIVE_INFINITY;
      const sourceRect = source.getBoundingClientRect();
      const shieldRect = shield.getBoundingClientRect();
      return Math.max(
        Math.abs(sourceRect.left - shieldRect.left),
        Math.abs(sourceRect.top - shieldRect.top),
        Math.abs(sourceRect.width - shieldRect.width),
        Math.abs(sourceRect.height - shieldRect.height),
      );
    });
  expect(await alignmentDelta()).toBeLessThanOrEqual(4);
  await page.evaluate(() => window.scrollBy({ behavior: "auto", top: 1 }));
  await page.waitForTimeout(80);
  expect(await alignmentDelta()).toBeLessThanOrEqual(4);
  await expectNoRuntimeFailures(diagnostics, testInfo);
});

test("exact viewport boundary unmounts and restores one motion controller", async ({
  page,
}, testInfo) => {
  const diagnostics = observeRuntimeDiagnostics(page);
  await page.setViewportSize({ width: 1120, height: 760 });
  await page.goto(route);

  const root = page.locator(rootSelector);
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute("data-motion-state", "ready-wide");
  await expect(root).toHaveAttribute("data-sticky-active", "true");
  await expect(page.locator("[data-explorer-motion-controller]")).toHaveCount(1);

  await page.setViewportSize({ width: 1119, height: 760 });
  await expect(root).toHaveAttribute("data-motion-state", "static-viewport");
  await expect(root).toHaveAttribute("data-motion-profile", "desktop-static");
  await expect(root).toHaveAttribute("data-sticky-active", "false");
  await expect(page.locator("[data-explorer-motion-controller]")).toHaveCount(0);
  await expect(page.locator("[data-motion-overlay]")).toHaveCount(0);

  await page.setViewportSize({ width: 1120, height: 759 });
  await expect(root).toHaveAttribute("data-motion-state", "static-viewport");
  await expect(page.locator("[data-explorer-motion-controller]")).toHaveCount(0);

  await page.setViewportSize({ width: 1120, height: 760 });
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute("data-motion-state", "ready-wide");
  await expect(root).toHaveAttribute("data-sticky-active", "true");
  await expect(page.locator("[data-explorer-motion-controller]")).toHaveCount(1);
  await expectNoRuntimeFailures(diagnostics, testInfo);
});

test("Save-Data changed during lazy loading suppresses and safely restores motion", async ({
  page,
}, testInfo) => {
  const diagnostics = observeRuntimeDiagnostics(page);
  let holdNextBuildScript = false;
  let heldBuildScript = false;
  let releaseBuildScript: (() => void) | undefined;
  const buildScriptGate = new Promise<void>((resolve) => {
    releaseBuildScript = resolve;
  });
  await page.route("**/_next/static/chunks/**", async (route) => {
    if (
      holdNextBuildScript &&
      !heldBuildScript &&
      route.request().resourceType() === "script"
    ) {
      heldBuildScript = true;
      await buildScriptGate;
    }
    await route.continue();
  });
  await page.addInitScript(() => {
    const connection = new EventTarget();
    let saveData = false;
    Object.defineProperty(connection, "saveData", {
      configurable: true,
      get: () => saveData,
    });
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: connection,
    });
    (
      window as typeof window & { __setPortfolioSaveData: (value: boolean) => void }
    ).__setPortfolioSaveData = (value) => {
      saveData = value;
      connection.dispatchEvent(new Event("change"));
    };
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);

  const root = page.locator(rootSelector);
  holdNextBuildScript = true;
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute("data-motion-state", "loading");

  await page.evaluate(() => {
    (
      window as typeof window & { __setPortfolioSaveData: (value: boolean) => void }
    ).__setPortfolioSaveData(true);
  });
  await expect(root).toHaveAttribute("data-motion-state", "static-save-data");
  await expect(root).toHaveAttribute("data-motion-profile", "save-data-static");
  await expect(page.locator("[data-explorer-motion-controller]")).toHaveCount(0);
  await expect(page.locator("[data-motion-overlay]")).toHaveCount(0);
  releaseBuildScript?.();
  await page.waitForTimeout(300);
  await expect(root).toHaveAttribute("data-motion-state", "static-save-data");
  await expect(page.locator("[data-explorer-motion-controller]")).toHaveCount(0);

  await page.evaluate(() => {
    (
      window as typeof window & { __setPortfolioSaveData: (value: boolean) => void }
    ).__setPortfolioSaveData(false);
  });
  await expect(root).toHaveAttribute("data-motion-state", "ready-wide");
  await expect(root).toHaveAttribute("data-motion-profile", "desktop-sticky");
  await expect(page.locator("[data-explorer-motion-controller]")).toHaveCount(1);
  await expectNoRuntimeFailures(diagnostics, testInfo);
});

test("a failed lazy chunk leaves the semantic explorer usable", async ({
  page,
}) => {
  const pageErrors: Error[] = [];
  let abortNextBuildScript = false;
  let abortedUrl: string | null = null;
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.route("**/_next/static/chunks/**", async (route) => {
    if (
      abortNextBuildScript &&
      !abortedUrl &&
      route.request().resourceType() === "script"
    ) {
      abortedUrl = route.request().url();
      await route.abort("failed");
      return;
    }
    await route.continue();
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);

  const root = page.locator(rootSelector);
  await expect(root).toHaveAttribute("data-motion-state", "idle");
  abortNextBuildScript = true;
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute("data-motion-state", "failed");
  expect(abortedUrl).toContain("/_next/static/chunks/");

  const nova = page.getByRole("button", {
    name: "Preview evidence for Nova AI Wallet",
  });
  await nova.click();
  await expect(nova).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.locator('[data-explorer-panel][data-project-slug="nova-ai"]'),
  ).toBeVisible();
  await expect(page.locator("[data-explorer-status]")).toHaveText(
    "Showing evidence for Nova AI Wallet.",
  );
  await expect(page.locator("[data-motion-overlay]")).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test("a newly selected project waits for its lead image before creating motion", async ({
  page,
}, testInfo) => {
  const diagnostics = observeRuntimeDiagnostics(page);
  let held = false;
  let releaseImage: (() => void) | undefined;
  const imageGate = new Promise<void>((resolve) => {
    releaseImage = resolve;
  });
  await page.route("**/media/projects/quorum/discover-surface.webp", async (route) => {
    held = true;
    await imageGate;
    await route.continue();
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);

  const root = page.locator(rootSelector);
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute("data-motion-state", "ready-wide");

  await page
    .getByRole("button", { name: "Preview evidence for Quorum" })
    .click();
  await expect.poll(() => held).toBe(true);
  await expect(root).toHaveAttribute("data-motion-state", "loading-media");
  await expect(page.locator("[data-motion-overlay]")).toHaveCount(0);

  releaseImage?.();
  await expect(root).toHaveAttribute("data-motion-state", "ready-wide");
  await page.evaluate(() => {
    const panel = document.querySelector<HTMLElement>(
      '[data-explorer-panel][data-project-slug="quorum"]',
    );
    const sheet = panel?.querySelector<HTMLElement>(
      ".opg-evidence-contact-sheet",
    );
    if (!sheet) throw new Error("Expected the Quorum evidence sheet.");
    const sheetTop = sheet.getBoundingClientRect().top + window.scrollY;
    const start = sheetTop - window.innerHeight * 0.72;
    const end = sheetTop + sheet.offsetHeight - window.innerHeight * 0.28;
    window.scrollTo({
      behavior: "auto",
      top: start + (end - start) * 0.45,
    });
  });

  const overlay = page.locator("[data-motion-overlay]");
  await expect(overlay).toHaveCount(1);
  const bounds = await overlay.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds?.width).toBeGreaterThan(100);
  expect(bounds?.height).toBeGreaterThan(100);
  await expectNoRuntimeFailures(diagnostics, testInfo);
});

test("route replacement during travel restores at most one clean controller", async ({
  page,
}, testInfo) => {
  const diagnostics = observeRuntimeDiagnostics(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);

  const root = page.locator(rootSelector);
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute("data-motion-state", "ready-wide");
  await page.evaluate(() => {
    const sheet = document.querySelector<HTMLElement>(
      ".opg-evidence-contact-sheet",
    );
    if (!sheet) throw new Error("Expected the Fradium evidence sheet.");
    const sheetTop = sheet.getBoundingClientRect().top + window.scrollY;
    const start = sheetTop - window.innerHeight * 0.72;
    const end = sheetTop + sheet.offsetHeight - window.innerHeight * 0.28;
    window.scrollTo({
      behavior: "auto",
      top: start + (end - start) * 0.45,
    });
  });
  await expect(page.locator("[data-motion-overlay]")).toHaveCount(1);

  await page.evaluate(() => {
    window.location.assign("/preview/open-proving-ground/content/fradium");
  });
  await expect(
    page.getByRole("heading", { level: 1, name: "Fradium" }),
  ).toBeVisible();

  await page.goBack();
  await expect(page.locator(rootSelector)).toHaveAttribute(
    "data-enhanced",
    "true",
  );
  await expect
    .poll(() => page.locator("[data-motion-overlay]").count())
    .toBeLessThanOrEqual(1);
  await expect
    .poll(() => page.locator("[data-explorer-motion-controller]").count())
    .toBeLessThanOrEqual(1);
  await page.evaluate(() => window.scrollTo({ behavior: "auto", top: 0 }));
  await expect(page.locator("[data-motion-overlay]")).toHaveCount(0);
  await expectNoRuntimeFailures(diagnostics, testInfo);
});

test("reduced motion keeps semantic switching and never loads the travel module", async ({
  page,
}, testInfo) => {
  const diagnostics = observeRuntimeDiagnostics(page);
  const scriptResponses = observeScriptPaths(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);

  const root = page.locator(rootSelector);
  await expect(root).toHaveAttribute("data-enhanced", "true");
  await page.waitForTimeout(300);
  const coldScripts = new Set(scriptResponses);
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute(
    "data-motion-state",
    "static-reduced-motion",
  );
  await expect(page.locator("[data-explorer-motion-controller]")).toHaveCount(0);
  await expect(page.locator("[data-motion-overlay]")).toHaveCount(0);

  const paygate = page.getByRole("button", {
    name: "Preview evidence for PayGate",
  });
  await paygate.click();
  await expect(paygate).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.locator('[data-explorer-panel][data-project-slug="paygate"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-explorer-panel][data-project-slug="paygate"]'),
  ).not.toHaveAttribute("data-motion-entering", "true");
  await expect(page.locator("[data-motion-overlay]")).toHaveCount(0);
  await page.waitForTimeout(300);
  expect(scriptResponses.filter((script) => !coldScripts.has(script))).toEqual(
    [],
  );
  await expectNoRuntimeFailures(diagnostics, testInfo);
});

test("Save-Data keeps the static profile", async ({
  page,
}, testInfo) => {
  const diagnostics = observeRuntimeDiagnostics(page);
  const scriptResponses = observeScriptPaths(page);
  await page.addInitScript(() => {
    const connection = new EventTarget();
    Object.defineProperty(connection, "saveData", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: connection,
    });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);

  const root = page.locator(rootSelector);
  await expect(root).toHaveAttribute("data-enhanced", "true");
  await page.waitForTimeout(300);
  const coldScripts = new Set(scriptResponses);
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute("data-motion-state", "static-save-data");
  await expect(root).toHaveAttribute("data-motion-profile", "save-data-static");
  await expect(page.locator("[data-explorer-motion-controller]")).toHaveCount(0);
  await expect(page.locator("[data-motion-overlay]")).toHaveCount(0);
  await page.waitForTimeout(300);
  expect(scriptResponses.filter((script) => !coldScripts.has(script))).toEqual(
    [],
  );
  await expectNoRuntimeFailures(diagnostics, testInfo);
});

test("mobile uses the semantic enhancer without loading desktop motion", async ({
  page,
}, testInfo) => {
  const diagnostics = observeRuntimeDiagnostics(page);
  const scriptResponses = observeScriptPaths(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);

  const root = page.locator(rootSelector);
  await expect(root).toHaveAttribute("data-enhanced", "true");
  await page.waitForTimeout(300);
  const coldScripts = new Set(scriptResponses);
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute("data-motion-state", "static-viewport");
  await expect(root).toHaveAttribute("data-motion-profile", "mobile-static");
  await expect(page.locator("[data-explorer-motion-controller]")).toHaveCount(0);

  const quorum = page.getByRole("button", {
    name: "Preview evidence for Quorum",
  });
  await quorum.click();
  await expect(quorum).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.locator('[data-explorer-panel][data-project-slug="quorum"]'),
  ).toBeVisible();
  await expect(page.locator("[data-motion-overlay]")).toHaveCount(0);
  await page.waitForTimeout(300);
  expect(scriptResponses.filter((script) => !coldScripts.has(script))).toEqual(
    [],
  );
  await expectNoRuntimeFailures(diagnostics, testInfo);
});
