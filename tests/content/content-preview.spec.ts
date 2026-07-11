import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import {
  expectNoRuntimeFailures,
  observeRuntimeDiagnostics,
} from "../foundation/runtime-diagnostics";

const root = "/preview/open-proving-ground/content";
const screenshotDirectory = resolve(
  process.cwd(),
  ".quality-reports/content/screenshots",
);
const projects = [
  ["agentpay", "AgentPay", 0],
  ["crucible", "Crucible", 0],
  ["fradium", "Fradium", 3],
  ["nova-ai", "Nova AI Wallet", 4],
  ["paygate", "PayGate", 5],
  ["quorum", "Quorum", 4],
  ["specheal", "SpecHeal", 0],
] as const;

async function loadVisibleLazyImages(page: Page): Promise<void> {
  const viewportHeight = page.viewportSize()?.height ?? 900;
  const documentHeight = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );

  for (
    let y = 0;
    y < documentHeight;
    y += Math.max(320, Math.floor(viewportHeight * 0.75))
  ) {
    await page.evaluate((top) => window.scrollTo({ behavior: "auto", top }), y);
    await page.waitForTimeout(35);
  }
  await page.evaluate(() => window.scrollTo({ behavior: "auto", top: 0 }));
  await expect
    .poll(() =>
      page.locator("img").evaluateAll((images) =>
        images.every(
          (image) =>
            (image as HTMLImageElement).complete &&
            (image as HTMLImageElement).naturalWidth > 0,
        ),
      ),
    )
    .toBe(true);
}

test("preview namespace rejects unauthenticated production requests", async ({}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (typeof baseURL !== "string") {
    throw new TypeError("Content preview tests require a string baseURL.");
  }

  const response = await fetch(new URL(root, baseURL), {
    redirect: "manual",
    signal: AbortSignal.timeout(5_000),
  });

  expect(response.status).toBe(401);
  expect(response.headers.get("www-authenticate")).toContain("Basic");
  expect(response.headers.get("cache-control")).toContain("no-store");
  expect(response.headers.get("x-robots-tag")).toContain("noindex");
});

test("preview-enabled builds do not make public project routes routable", async ({
  page,
}) => {
  const response = await page.goto("/work/fradium");

  expect(response?.status()).toBe(404);
  await expect(page.locator("[data-public-v1-not-found]")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { level: 1, name: "Fradium" }),
  ).toHaveCount(0);

  const momentsResponse = await page.goto("/moments");
  expect(momentsResponse?.status()).toBe(404);
  await expect(page.locator("[data-public-v1-not-found]")).toHaveCount(1);
});

test("the private moments route renders the curated sequence without leaking planned media", async ({
  page,
}, testInfo) => {
  const diagnostics = observeRuntimeDiagnostics(page);
  const response = await page.goto("/preview/open-proving-ground/moments");

  expect(response?.status()).toBe(200);
  expect(response?.headers()["cache-control"]).toContain("no-store");
  expect(response?.headers()["x-robots-tag"]).toContain("noindex");
  await expect(page.getByRole("heading", { level: 1, name: "Moments." })).toBeVisible();
  await expect(page.locator(".opg-moments-sequence > li")).toHaveCount(6);
  await expect(page.locator(".opg-moment-story h3")).toHaveText([
    "Second place, after the recovery loop held together",
    "A student journey beyond the build room",
    "A completed sprint, with the result in frame",
    "Research becomes a system question",
    "Learning in public",
    "A global result, held by the whole team",
  ]);
  expect(
    await page.locator(".opg-moments-sequence > li").evaluateAll((items) =>
      items.map((item) => item.getAttribute("data-mode")),
    ),
  ).toEqual(["evidence", "portrait", "evidence", "portrait", "lead", "evidence"]);
  await expect(page.locator("figure, [data-placeholder-media], canvas")).toHaveCount(0);
  await expect(page.getByText("capture-pending")).toHaveCount(0);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await expectNoRuntimeFailures(diagnostics, testInfo);
});

test("all canonical preview projects are server-rendered and non-indexable", async ({
  page,
}, testInfo) => {
  const diagnostics = observeRuntimeDiagnostics(page);

  for (const [slug, title, evidenceCount] of projects) {
    const response = await page.goto(`${root}/${slug}`);
    expect(response?.status(), slug).toBe(200);
    expect(response?.headers()["cache-control"], slug).toContain("no-store");
    expect(response?.headers()["x-robots-tag"], slug).toContain("noindex");
    await expect(page.locator('[data-site-shell="v1"]')).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.locator("[data-project-page]")).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/i,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /nofollow/i,
    );
    await expect(page.locator("figure")).toHaveCount(evidenceCount);
    await expect(page.locator("canvas")).toHaveCount(0);
  }

  await expectNoRuntimeFailures(diagnostics, testInfo);
});

test("full MDX and brief YAML routes render their intended structures", async ({
  page,
}, testInfo) => {
  const diagnostics = observeRuntimeDiagnostics(page);

  await page.goto(`${root}/fradium`);
  await expect(page.getByRole("heading", { level: 2 })).toHaveText([
    "Problem and stakes",
    "My role and the team",
    "Constraint",
    "Decision",
    "System behavior",
    "Evidence sequence",
    "Outcome and validation",
    "Where it stands",
    "What I'd improve next",
    "Evidence record",
  ]);
  await expect(
    page.locator('[data-case-study-component="SourceLink"]'),
  ).toHaveAttribute(
    "href",
    "https://bse.telkomuniversity.ac.id/tim-fradium-berhasil-meraih-global-finale-winner-fully-on-chain-track-pada-world-computer-hacker-league-2025/",
  );

  await page.goto(`${root}/agentpay`);
  await expect(page.locator('[data-project-state="brief"]')).toContainText(
    "machine-readable tool discovery",
  );
  await expect(page.getByRole("heading", { level: 2 })).toHaveText([
    "Why it exists",
    "What the build produced",
    "My role",
  ]);
  await expect(
    page.getByRole("heading", { level: 2, name: "Problem and stakes" }),
  ).toHaveCount(0);

  await expectNoRuntimeFailures(diagnostics, testInfo);
});

test("the server-first portfolio composition exposes all four flagships", async ({
  page,
}, testInfo) => {
  const diagnostics = observeRuntimeDiagnostics(page);
  const response = await page.goto("/preview/open-proving-ground/site");

  expect(response?.status()).toBe(200);
  await expect(page.locator('[data-portfolio-home-skeleton]')).toHaveCount(1);
  await expect(
    page.getByRole("heading", { level: 1, name: "Wildan Syukri Niam" }),
  ).toBeVisible();
  await expect(page.locator(".opg-project-explorer__project-link")).toHaveText([
    "Fradium",
    "Nova AI Wallet",
    "PayGate",
    "Quorum",
  ]);
  await expect(
    page.locator(
      '.opg-project-explorer__project-link[href="/preview/open-proving-ground/content/fradium"]',
    ),
  ).toHaveCount(1);
  await expect(page.getByText("Building PayGate on Stellar")).toBeVisible();
  await expect(page.locator("[data-project-explorer] figure")).toHaveCount(16);
  await expect(page.locator("canvas, [data-placeholder-media]")).toHaveCount(0);

  await expectNoRuntimeFailures(diagnostics, testInfo);
});

test("the explorer keeps links and preview controls as separate keyboard actions", async ({
  page,
}, testInfo) => {
  const diagnostics = observeRuntimeDiagnostics(page);
  await page.goto("/preview/open-proving-ground/site");

  const previewGroup = page.getByRole("group", {
    name: "Project evidence previews",
  });
  const buttons = previewGroup.getByRole("button", {
    name: /Preview evidence for/,
  });
  await expect(buttons).toHaveCount(4);
  await expect(buttons.first()).toBeEnabled();

  const novaButton = page.getByRole("button", {
    name: "Preview evidence for Nova AI Wallet",
  });
  await novaButton.focus();
  await page.keyboard.press("Enter");
  await expect(novaButton).toHaveAttribute("aria-pressed", "true");
  const novaPanel = page.locator(
    '.opg-project-explorer__panel[data-project-slug="nova-ai"]',
  );
  await expect(novaPanel).toBeVisible();
  await expect(novaButton).toBeFocused();
  await expect(novaPanel).toBeInViewport();
  const panelBounds = await novaPanel.boundingBox();
  expect(panelBounds).not.toBeNull();
  expect(panelBounds?.y).toBeGreaterThan(-1);
  expect(panelBounds?.y).toBeLessThan(800);
  await expect(page).toHaveURL(
    /\/preview\/open-proving-ground\/site\?project=nova-ai#flagship-work-explorer-panel$/,
  );
  await expect(page.locator("[data-explorer-status]")).toHaveText(
    "Showing evidence for Nova AI Wallet.",
  );
  await expect(
    page.locator(
      '.opg-project-explorer__panel[data-project-slug="nova-ai"] .opg-evidence-contact-sheet',
    ),
  ).toHaveCount(1);
  await expect(novaPanel.locator("figure")).toHaveCount(4);

  const fradiumButton = page.getByRole("button", {
    name: "Preview evidence for Fradium",
  });
  await fradiumButton.click();
  await expect(fradiumButton).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.locator('.opg-project-explorer__panel[data-project-slug="fradium"] figure'),
  ).toHaveCount(3);

  await expectNoRuntimeFailures(diagnostics, testInfo);
});

test("the flagship preview surfaces have no blocking axe findings", async ({
  page,
}, testInfo) => {
  for (const route of [
    "/preview/open-proving-ground/site",
    "/preview/open-proving-ground/moments",
    `${root}/fradium`,
    `${root}/nova-ai`,
    `${root}/paygate`,
    `${root}/quorum`,
  ]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const blocking = result.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    );

    await testInfo.attach(`axe-${route.replaceAll("/", "-") || "root"}`, {
      body: Buffer.from(JSON.stringify(result, null, 2)),
      contentType: "application/json",
    });
    expect(
      blocking.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.length,
      })),
    ).toEqual([]);
  }
});

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const) {
  test(`${viewport.name} remaining flagship case studies stay bounded`, async ({
    page,
  }, testInfo) => {
    mkdirSync(screenshotDirectory, { recursive: true });
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const [slug, title, evidenceCount, sourceCount] of [
      ["nova-ai", "Nova AI Wallet", 4, 1],
      ["paygate", "PayGate", 5, 2],
      ["quorum", "Quorum", 4, 1],
    ] as const) {
      await page.goto(`${root}/${slug}`);
      await expect(
        page.getByRole("heading", { level: 1, name: title }),
      ).toBeVisible();
      await expect(page.locator("figure")).toHaveCount(evidenceCount);
      await expect(
        page.locator('[data-case-study-component="SourceLink"]'),
      ).toHaveCount(sourceCount);
      await expect(page.locator("img").first()).toHaveJSProperty(
        "complete",
        true,
      );
      await loadVisibleLazyImages(page);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `${slug} horizontal overflow`).toBeLessThanOrEqual(1);

      const screenshotPath = resolve(
        screenshotDirectory,
        `${slug}-${viewport.name}.png`,
      );
      await page.screenshot({
        animations: "disabled",
        fullPage: true,
        path: screenshotPath,
      });
      await testInfo.attach(`${slug}-${viewport.name}`, {
        contentType: "image/png",
        path: screenshotPath,
      });
    }
  });
}

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "reflow-200-equivalent", width: 640, height: 800 },
  { name: "mobile", width: 390, height: 844 },
] as const) {
  test(`${viewport.name} static Fradium checkpoints remain bounded`, async ({
    page,
  }, testInfo) => {
    mkdirSync(screenshotDirectory, { recursive: true });
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const [name, route] of [
      ["home", "/preview/open-proving-ground/site"],
      ["case-study", `${root}/fradium`],
    ] as const) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator("img").first()).toHaveJSProperty(
        "complete",
        true,
      );

      const overflow = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      }));
      expect(overflow.documentWidth).toBeLessThanOrEqual(overflow.viewportWidth);

      const screenshotPath = resolve(
        screenshotDirectory,
        `${viewport.name}-${name}.png`,
      );
      await page.screenshot({
        animations: "disabled",
        fullPage: true,
        path: screenshotPath,
      });
      await testInfo.attach(`${viewport.name}-${name}`, {
        contentType: "image/png",
        path: screenshotPath,
      });
    }
  });
}

test("unknown project preview returns a visible semantic 404", async ({ page }) => {
  const response = await page.goto(`${root}/not-a-project`);

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "This project preview does not exist.",
    }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
});
