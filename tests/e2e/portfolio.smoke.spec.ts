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
  expect(pageErrors).toEqual([]);
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
