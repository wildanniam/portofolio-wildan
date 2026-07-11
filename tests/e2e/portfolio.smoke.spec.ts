import { expect, test } from "@playwright/test";

test("the current root exposes its identity and primary work path", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Building trustworthy AI agents for Web3 systems.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore work" })).toHaveAttribute(
    "href",
    "#work",
  );
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator('[data-site-shell="legacy"]')).toHaveCount(1);
  await expect(page.locator('[data-site-shell="v1"]')).toHaveCount(0);
  await expect(
    page.locator('a[href^="/preview/open-proving-ground"]'),
  ).toHaveCount(0);

  const preservedSurface = await page.evaluate(() => ({
    bodyBackground: getComputedStyle(document.body).backgroundColor,
    htmlColorScheme: getComputedStyle(document.documentElement).colorScheme,
  }));
  expect(preservedSurface.bodyBackground).toBe("rgb(5, 7, 6)");
  expect(preservedSurface.htmlColorScheme).toBe("dark");
  expect(pageErrors).toEqual([]);
});

test("the V1 foundation preview is private in the default build", async ({
  page,
}) => {
  const response = await page.goto("/preview/open-proving-ground");

  expect(response?.status()).toBe(404);
  await expect(page.locator('[data-site-shell="v1"]')).toHaveCount(1);
  await expect(page.locator('[data-site-shell="legacy"]')).toHaveCount(0);
});

test("unknown public routes keep the preserved legacy shell", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(page.locator('[data-site-shell="legacy"]')).toHaveCount(1);
  await expect(page.locator('[data-site-shell="v1"]')).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "This page could not be found.",
    }),
  ).toBeVisible();
});

test("legacy route shims preserve direct work and contact navigation", async ({
  page,
}) => {
  await page.goto("/work");
  await expect(page).toHaveURL(/\/#work$/);
  await expect(page.locator("#work")).toBeAttached();

  await page.goto("/contact");
  await expect(page).toHaveURL(/\/#contact$/);
  await expect(page.locator("#contact")).toBeAttached();
});
