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

  const briefResponse = await page.goto(`${root}/agentpay`);
  expect(briefResponse?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "AgentPay" }),
  ).toBeVisible();
  await expect(page.locator("[data-project-narrative]")).toContainText(
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
