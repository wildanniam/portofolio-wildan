import { expect, test } from "@playwright/test";

const publishedRoutes = [
  "/",
  "/work",
  "/work/fradium",
  "/work/nova-ai",
  "/work/paygate",
  "/work/quorum",
  "/moments",
  "/about",
  "/contact",
] as const;

async function expectCanonicalShell(page: import("@playwright/test").Page) {
  const shell = page.locator('[data-portfolio-v4="true"]');
  await expect(shell).toHaveCount(1);
  await expect(shell.locator(":scope > header")).toHaveCount(1);
  await expect(shell.locator(":scope > main")).toHaveCount(1);
  await expect(shell.locator(":scope > footer")).toHaveCount(1);

  const main = shell.locator(":scope > main");
  const mainId = await main.getAttribute("id");
  expect(mainId).toBeTruthy();
  await expect(shell.locator(':scope > a[href^="#"]').first()).toHaveAttribute(
    "href",
    `#${mainId}`,
  );
}

test("published routes and the custom 404 use one canonical V4 shell", async ({
  page,
}) => {
  for (const route of publishedRoutes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expectCanonicalShell(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  }

  const missingResponse = await page.goto("/this-v4-route-does-not-exist");
  expect(missingResponse?.status()).toBe(404);
  await expectCanonicalShell(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
});

test("skip navigation reaches and focuses the route main landmark", async ({
  page,
}) => {
  await page.goto("/");

  const shell = page.locator('[data-portfolio-v4="true"]');
  const main = shell.locator(":scope > main");
  const skipLink = shell.locator(':scope > a[href^="#"]').first();

  await skipLink.focus();
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(main).toBeFocused();
});

test("desktop navigation is canonical, route-aware, and external-link safe", async ({
  page,
}) => {
  await page.goto("/work/paygate");

  const primaryNavigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  const secondaryNavigation = page.getByRole("navigation", {
    name: "Secondary navigation",
  });

  await expect(primaryNavigation).toHaveCount(1);
  await expect(secondaryNavigation).toHaveCount(1);
  await expect(primaryNavigation.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(primaryNavigation.locator('[aria-current="page"]')).toHaveAttribute(
    "href",
    "/work",
  );

  const externalLinks = secondaryNavigation.locator('a[target="_blank"]');
  expect(await externalLinks.count()).toBeGreaterThan(0);
  for (const link of await externalLinks.all()) {
    await expect(link).toHaveAttribute("href", /^https?:\/\//);
    await expect(link).toHaveAttribute("rel", /(?:^|\s)noreferrer(?:\s|$)/);
  }
});

test("mobile navigation is modal, route-aware, and restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/work/paygate");

  const trigger = page.locator('button[aria-haspopup="dialog"]');
  await expect(trigger).toHaveCount(1);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();

  const dialog = page.locator("dialog[open]");
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(dialog.getByRole("navigation")).toHaveCount(1);
  await expect(dialog.locator('[aria-current="page"]')).toHaveAttribute(
    "href",
    "/work",
  );
  await expect
    .poll(() =>
      page.evaluate(() => {
        const active = document.activeElement;
        const openDialog = document.querySelector("dialog[open]");
        return Boolean(active && openDialog?.contains(active));
      }),
    )
    .toBe(true);
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.body).overflow))
    .toBe("hidden");

  await dialog.getByRole("button", { name: "Close navigation" }).click();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  const reopenedDialog = page.locator("dialog[open]");
  await expect(reopenedDialog).toBeVisible();
  const dialogBox = await reopenedDialog.boundingBox();
  expect(dialogBox).not.toBeNull();
  if (!dialogBox) throw new Error("Expected an open navigation dialog.");
  expect(dialogBox.x).toBeGreaterThan(2);
  await page.mouse.click(Math.floor(dialogBox.x / 2), 4);
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(page.locator("dialog[open]")).toBeVisible();

  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press("Tab");
    const focusStayedInside = await page.evaluate(() => {
      const active = document.activeElement;
      const openDialog = document.querySelector("dialog[open]");
      return Boolean(active && openDialog?.contains(active));
    });
    expect(focusStayedInside).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.body).overflow))
    .not.toBe("hidden");
});

test("the V4 shell introduces no horizontal overflow at supported widths", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "Explicit viewport coverage only needs one browser engine at this shell gate.",
  );

  const routes = ["/", "/work/paygate", "/this-v4-route-does-not-exist"] as const;
  const viewports = [
    { width: 320, height: 800 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 1000 },
  ] as const;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route);
      await expectCanonicalShell(page);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `${route} at ${viewport.width}px`).toBeLessThanOrEqual(0);

      const clippedShellControls = await page.evaluate(() => {
        const shell = document.querySelector('[data-portfolio-v4="true"]');
        if (!shell) return ["missing-shell"];
        const viewportWidth = document.documentElement.clientWidth;
        return Array.from(
          shell.querySelectorAll(
            ":scope > header a, :scope > header button, :scope > footer a, :scope > footer button",
          ),
        )
          .filter((element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              rect.width > 0 &&
              rect.height > 0
            );
          })
          .flatMap((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left < -1 || rect.right > viewportWidth + 1
              ? [
                  `${element.tagName.toLowerCase()}[${Math.round(rect.left)},${Math.round(rect.right)}]`,
                ]
              : [];
          });
      });
      expect(
        clippedShellControls,
        `${route} shell controls at ${viewport.width}px`,
      ).toEqual([]);
    }
  }
});
