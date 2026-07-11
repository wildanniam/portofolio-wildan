import { expect, test, type Page, type Response } from "@playwright/test";

import {
  expectNoRuntimeFailures,
  observeRuntimeDiagnostics,
} from "../foundation/runtime-diagnostics";

const homepage = "/preview/open-proving-ground/site";

const routes = [
  {
    heading: "Wildan Syukri Niam",
    name: "homepage",
    path: homepage,
    requiredHook: "[data-portfolio-home-skeleton]",
  },
  {
    heading: "Fradium",
    name: "Fradium",
    path: "/preview/open-proving-ground/content/fradium",
    requiredHook: "[data-project-page]",
  },
  {
    heading: "Moments.",
    name: "Moments",
    path: "/preview/open-proving-ground/moments",
    requiredHook: "[data-moments-page]",
  },
] as const;

function expectProtectedResponse(response: Response | null, routeName: string) {
  expect(response, `${routeName} returned no document response`).not.toBeNull();
  expect(response?.status(), `${routeName} status`).toBe(200);

  const headers = response?.headers() ?? {};
  expect(headers["cache-control"], `${routeName} cache policy`).toContain(
    "private",
  );
  expect(headers["cache-control"], `${routeName} cache policy`).toContain(
    "no-store",
  );
  expect(headers["x-robots-tag"], `${routeName} robots header`).toContain(
    "noindex",
  );
}

async function expectNoHorizontalOverflow(page: Page, context: string) {
  const geometry = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(
    geometry.scrollWidth - geometry.clientWidth,
    `${context} horizontal overflow`,
  ).toBeLessThanOrEqual(1);
}

async function expectOrderedHeadingsAndLandmarks(
  page: Page,
  expectedHeading: string,
) {
  await expect(page.locator('[data-site-shell="v1"]')).toHaveCount(1);
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole("heading", { level: 1, name: expectedHeading }),
  ).toBeVisible();
  await expect(page).toHaveTitle(/\S/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /\S/,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/i,
  );

  const headingLevels = await page
    .locator("h1, h2, h3, h4, h5, h6")
    .evaluateAll((headings) =>
      headings.flatMap((heading) => {
        if (heading.closest("[hidden]")) return [];
        const style = getComputedStyle(heading);
        if (style.display === "none" || style.visibility === "hidden")
          return [];
        return [Number(heading.tagName.slice(1))];
      }),
    );

  expect(headingLevels[0], "the visible heading outline must start at h1").toBe(
    1,
  );
  expect(
    headingLevels.flatMap((level, index) =>
      index > 0 && level > headingLevels[index - 1]! + 1
        ? [{ from: headingLevels[index - 1], index, to: level }]
        : [],
    ),
    "the visible heading outline must not skip levels",
  ).toEqual([]);
}

for (const route of routes) {
  test(`${route.name} preserves the protected release document contract`, async ({
    page,
  }, testInfo) => {
    const diagnostics = observeRuntimeDiagnostics(page);
    const response = await page.goto(route.path);

    expectProtectedResponse(response, route.name);
    await expect(page.locator(route.requiredHook)).toHaveCount(1);
    await expectOrderedHeadingsAndLandmarks(page, route.heading);
    await expectNoHorizontalOverflow(page, route.name);
    await page.waitForLoadState("networkidle");
    await expectNoRuntimeFailures(diagnostics, testInfo);
  });
}

test("primary navigation and explorer selection survive desktop-to-mobile reflow", async ({
  page,
}, testInfo) => {
  const diagnostics = observeRuntimeDiagnostics(page);
  await page.setViewportSize({ height: 760, width: 1120 });
  const response = await page.goto(homepage);

  expectProtectedResponse(response, "homepage interaction smoke");
  const primaryNavigation = page.getByRole("navigation", { name: "Primary" });
  await expect(primaryNavigation).toBeVisible();
  await expect(
    primaryNavigation.locator(".opg-site-navigation__primary a"),
  ).toHaveText(["Home", "Work", "Contact"]);
  await expectNoHorizontalOverflow(page, "1120 by 760 homepage");

  const explorer = page.locator("#flagship-work-explorer-interactive");
  await expect(explorer).toHaveAttribute("data-active-project", "fradium");

  const paygate = page.getByRole("button", {
    name: "Preview evidence for PayGate",
  });
  await paygate.focus();
  await page.keyboard.press("Enter");
  await expect(paygate).toHaveAttribute("aria-pressed", "true");
  await expect(explorer).toHaveAttribute("data-active-project", "paygate");
  await expect(
    page.locator('[data-explorer-panel][data-project-slug="paygate"]'),
  ).toBeVisible();
  await expect(page.locator("[data-explorer-status]")).toHaveText(
    "Showing evidence for PayGate.",
  );
  await expect(page).toHaveURL(/project=paygate/);

  await page.setViewportSize({ height: 844, width: 390 });
  await expectNoHorizontalOverflow(page, "390 by 844 homepage");
  await expect(primaryNavigation).toBeVisible();

  const quorum = page.getByRole("button", {
    name: "Preview evidence for Quorum",
  });
  await quorum.focus();
  await page.keyboard.press("Enter");
  await expect(quorum).toHaveAttribute("aria-pressed", "true");
  await expect(explorer).toHaveAttribute("data-active-project", "quorum");
  await expect(
    page.locator('[data-explorer-panel][data-project-slug="quorum"]'),
  ).toBeVisible();
  await expect(page.locator("[data-explorer-status]")).toHaveText(
    "Showing evidence for Quorum.",
  );
  await expect(page).toHaveURL(/project=quorum/);
  await expectNoHorizontalOverflow(page, "selected mobile explorer");

  await expectNoRuntimeFailures(diagnostics, testInfo);
});
