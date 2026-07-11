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
  await expect(page.locator("figure")).toHaveCount(3);
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
  await expect(page.locator(".opg-project-explorer__project-link")).toHaveCount(4);
  await expect(
    page.getByRole("button", { name: /Preview evidence for/ }),
  ).toHaveCount(4);
  await expect(
    page.getByRole("button", { name: "Preview evidence for Fradium" }),
  ).toBeEnabled();
  await expect(page.locator("[data-project-explorer] figure")).toHaveCount(3);

  await page
    .getByRole("button", { name: "Preview evidence for Nova AI Wallet" })
    .click();
  await expect(page).toHaveURL(
    /\/preview\/open-proving-ground\/site\?project=nova-ai#flagship-work-explorer-panel$/,
  );
  const novaPanel = page.locator(
    '.opg-project-explorer__panel[data-project-slug="nova-ai"]',
  );
  await expect(novaPanel).toBeVisible();
  await expect(novaPanel).toBeFocused();
  await expect(page.locator("[data-project-explorer] figure")).toHaveCount(0);

  await page
    .locator(
      '.opg-project-explorer__project-link[href="/preview/open-proving-ground/content/fradium"]',
    )
    .click();
  await expect(page).toHaveURL(/\/preview\/open-proving-ground\/content\/fradium$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Fradium" }),
  ).toBeVisible();
});
