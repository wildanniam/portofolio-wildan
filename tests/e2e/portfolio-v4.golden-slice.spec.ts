import { expect, test } from "@playwright/test";

const stageOrder = ["fradium", "nova-ai", "paygate", "quorum"] as const;

test("homepage golden slice owns one hero, research field, and four complete Atlas stages", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator("[data-v4-hero]")).toHaveCount(1);
  await expect(page.locator("[data-research-coordinates]")).toHaveCount(1);
  await expect(page.locator("[data-project-atlas]")).toHaveCount(1);

  const stages = page.locator("[data-atlas-stage]");
  await expect(stages).toHaveCount(4);
  expect(
    await stages.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-atlas-stage")),
    ),
  ).toEqual(stageOrder);

  for (const slug of stageOrder) {
    const stage = page.locator(`[data-atlas-stage="${slug}"]`);
    await expect(stage).toHaveCount(1);
    await expect(stage.locator(`[data-project-scene="${slug}"]`)).toHaveCount(1);
    await expect(stage.locator("[data-stage-action]")).toHaveCount(1);
    expect(
      await stage.locator(":scope > [data-stage-region]").evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-stage-region")),
      ),
    ).toEqual(["header", "figure", "footer"]);
    await expect(stage.locator('[data-fit="contain"]')).not.toHaveCount(0);
    await expect(stage.getByRole("heading", { level: 3 })).toHaveCount(1);
  }
});

test("desktop Atlas resolves the locked 7/12 + 5/12 and 5/12 + 7/12 composition", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "One browser engine is sufficient for deterministic geometry at the static gate.",
  );

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const geometry = await page.locator("[data-project-atlas]").evaluate((atlas) => {
    const grid = atlas.querySelector(".v4-atlas__grid");
    if (!grid) throw new Error("Missing Atlas grid.");
    const gridRect = grid.getBoundingClientRect();
    return {
      gridWidth: gridRect.width,
      stages: Array.from(grid.querySelectorAll("[data-atlas-stage]")).map((stage) => {
        const rect = stage.getBoundingClientRect();
        return {
          slug: stage.getAttribute("data-atlas-stage"),
          left: rect.left,
          top: rect.top,
          width: rect.width,
        };
      }),
    };
  });

  expect(geometry.stages.map(({ slug }) => slug)).toEqual(stageOrder);
  const [fradium, nova, paygate, quorum] = geometry.stages;
  expect(fradium.top).toBeCloseTo(nova.top, 0);
  expect(paygate.top).toBeCloseTo(quorum.top, 0);
  expect(paygate.top).toBeGreaterThan(fradium.top);
  expect(fradium.left).toBeLessThan(nova.left);
  expect(paygate.left).toBeLessThan(quorum.left);
  expect(fradium.width / geometry.gridWidth).toBeCloseTo(7 / 12, 2);
  expect(nova.width / geometry.gridWidth).toBeCloseTo(5 / 12, 2);
  expect(paygate.width / geometry.gridWidth).toBeCloseTo(5 / 12, 2);
  expect(quorum.width / geometry.gridWidth).toBeCloseTo(7 / 12, 2);

  const artifactPresentation = await page
    .locator("[data-project-atlas]")
    .evaluate((atlas) =>
      Array.from(atlas.querySelectorAll("[data-artifact-id]")).map((artifact) => {
        const image = artifact.querySelector("img");
        const scene = artifact.closest("[data-project-scene]");
        const artifactRect = artifact.getBoundingClientRect();
        const sceneRect = scene?.getBoundingClientRect();
        return {
          fit: artifact.querySelector("[data-fit]")?.getAttribute("data-fit"),
          objectFit: image ? getComputedStyle(image).objectFit : null,
          withinScene:
            Boolean(sceneRect) &&
            artifactRect.left >= sceneRect!.left - 1 &&
            artifactRect.right <= sceneRect!.right + 1 &&
            artifactRect.top >= sceneRect!.top - 1 &&
            artifactRect.bottom <= sceneRect!.bottom + 1,
        };
      }),
    );

  expect(artifactPresentation.length).toBeGreaterThanOrEqual(8);
  expect(artifactPresentation.every(({ fit }) => fit === "contain")).toBe(true);
  expect(artifactPresentation.every(({ objectFit }) => objectFit === "contain")).toBe(true);
  expect(artifactPresentation.every(({ withinScene }) => withinScene)).toBe(true);
});

test("mobile golden slice preserves strict reading order, visible logos, and bounded scenes", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "Explicit mobile viewport coverage only needs one engine at the static gate.",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const result = await page.locator("[data-project-atlas]").evaluate((atlas) => {
    const stages = Array.from(atlas.querySelectorAll("[data-atlas-stage]"));
    return {
      overflow:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
      stages: stages.map((stage) => {
        const rect = stage.getBoundingClientRect();
        const mark = stage.querySelector("[data-brand-asset]");
        const markRect = mark?.getBoundingClientRect();
        return {
          slug: stage.getAttribute("data-atlas-stage"),
          top: rect.top,
          width: rect.width,
          order: getComputedStyle(stage).order,
          markVisible: Boolean(markRect && markRect.width > 0 && markRect.height > 0),
        };
      }),
    };
  });

  expect(result.overflow).toBeLessThanOrEqual(0);
  expect(result.stages.map(({ slug }) => slug)).toEqual(stageOrder);
  expect(result.stages.every(({ markVisible }) => markVisible)).toBe(true);
  expect(result.stages.every(({ order }) => Number(order) >= 0)).toBe(true);
  expect(result.stages.every(({ width }) => width <= 350.5)).toBe(true);
  expect(result.stages.map(({ top }) => top)).toEqual(
    [...result.stages.map(({ top }) => top)].sort((left, right) => left - right),
  );
});

test("Atlas motion loads near the section, settles once, and preserves geometry", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "The motion contract is deterministic and needs one engine at this gate.",
  );

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const atlas = page.locator("[data-project-atlas]");
  await expect(atlas).toHaveAttribute("data-atlas-motion-state", "static");
  await expect(page.locator("[data-atlas-motion-controller]")).toHaveCount(0);

  const before = await atlas.evaluate((element) =>
    Array.from(element.querySelectorAll("[data-atlas-stage]")).map((stage) => {
      const rect = stage.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
      };
    }),
  );

  for (const slug of stageOrder) {
    await page
      .locator(`[data-atlas-stage="${slug}"]`)
      .scrollIntoViewIfNeeded();
  }

  await expect(page.locator("[data-atlas-motion-controller]")).toHaveCount(1);
  await expect(atlas).toHaveAttribute("data-atlas-motion-state", "settled");

  const after = await atlas.evaluate((element) =>
    Array.from(element.querySelectorAll("[data-atlas-stage]")).map((stage) => {
      const rect = stage.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
      };
    }),
  );

  expect(after).toEqual(before);
  await expect(atlas.locator(".v4-stage__artifact").first()).toHaveCSS(
    "transform",
    "none",
  );
  await expect(atlas.locator(".v4-stage__artifact").first()).toHaveCSS(
    "opacity",
    "1",
  );
});

test.describe("reduced-motion static fallback", () => {
  test("keeps the complete Atlas static and never mounts the runtime", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const atlas = page.locator("[data-project-atlas]");

    await atlas.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    await expect(atlas).toHaveAttribute("data-atlas-motion-state", "static");
    await expect(page.locator("[data-atlas-motion-controller]")).toHaveCount(0);
    await expect(atlas.locator(".v4-stage__artifact").first()).toHaveCSS(
      "opacity",
      "1",
    );
    await expect(atlas.locator(".v4-stage__artifact").first()).toHaveCSS(
      "transform",
      "none",
    );
  });
});

test.describe("no-JavaScript static fallback", () => {
  test.use({ javaScriptEnabled: false });

  test("renders the complete Atlas and every case-study action", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-atlas-stage]")).toHaveCount(4);
    await expect(page.locator("[data-project-scene]")).toHaveCount(4);
    await expect(page.locator("[data-stage-action]")).toHaveCount(4);
    await expect(page.locator("[data-atlas-motion-controller]")).toHaveCount(0);
    await expect(page.locator("[data-atlas-stage] img")).not.toHaveCount(0);
  });
});
