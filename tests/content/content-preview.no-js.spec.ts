import { expect, test } from "@playwright/test";

const root = "/preview/open-proving-ground/content";

test("full and brief projects plus private 404 remain readable without JavaScript", async ({
  page,
}) => {
  const projectResponse = await page.goto(`${root}/fradium`);

  expect(projectResponse?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "Fradium" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Decision" }),
  ).toBeVisible();
  await expect(
    page.locator('[data-case-study-component="SourceLink"]'),
  ).toContainText("Read the official Telkom University result.");
  const backLinks = page.getByRole("link", { name: "Back to work" });
  await expect(backLinks).toHaveCount(2);
  await expect(backLinks.first()).toHaveAttribute(
    "href",
    "/preview/open-proving-ground/site",
  );

  const briefResponse = await page.goto(`${root}/agentpay`);
  expect(briefResponse?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "AgentPay" }),
  ).toBeVisible();
  await expect(page.locator('[data-project-state="brief"]')).toContainText(
    "The prototype shipped a public marketplace",
  );
  await expect(
    page.getByRole("heading", { level: 2, name: "Problem and stakes" }),
  ).toHaveCount(0);

  const missingResponse = await page.goto(`${root}/not-a-project`);
  expect(missingResponse?.status()).toBe(404);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "This project preview does not exist.",
    }),
  ).toBeVisible();
});

test("the portfolio composition and project links work without JavaScript", async ({
  page,
}) => {
  const response = await page.goto("/preview/open-proving-ground/site");

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "Wildan Syukri Niam" }),
  ).toBeVisible();
  await expect(page.locator(".opg-project-ledger__title")).toHaveCount(4);

  await page
    .locator('a[href="/preview/open-proving-ground/content/fradium"]')
    .click();
  await expect(page).toHaveURL(/\/preview\/open-proving-ground\/content\/fradium$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Fradium" }),
  ).toBeVisible();
});
