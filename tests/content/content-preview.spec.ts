import { expect, test } from "@playwright/test";

import {
  expectNoRuntimeFailures,
  observeRuntimeDiagnostics,
} from "../foundation/runtime-diagnostics";

const root = "/preview/open-proving-ground/content";
const projects = [
  ["agentpay", "AgentPay"],
  ["crucible", "Crucible"],
  ["fradium", "Fradium"],
  ["nova-ai", "Nova AI Wallet"],
  ["paygate", "PayGate"],
  ["quorum", "Quorum"],
  ["specheal", "SpecHeal"],
] as const;

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

test("all canonical preview projects are server-rendered and non-indexable", async ({
  page,
}, testInfo) => {
  const diagnostics = observeRuntimeDiagnostics(page);

  for (const [slug, title] of projects) {
    const response = await page.goto(`${root}/${slug}`);
    expect(response?.status(), slug).toBe(200);
    expect(response?.headers()["cache-control"], slug).toContain("no-store");
    expect(response?.headers()["x-robots-tag"], slug).toContain("noindex");
    await expect(page.locator('[data-site-shell="v1"]')).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/i,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /nofollow/i,
    );
    await expect(page.locator("figure")).toHaveCount(0);
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
    "Project facts.",
    "Problem and stakes",
    "My role and the team",
    "Constraint",
    "Decision",
    "System behavior",
    "Evidence sequence",
    "Outcome and validation",
    "Where it stands",
    "What I'd improve next",
  ]);
  await expect(
    page.locator('[data-case-study-component="SourceLink"]'),
  ).toHaveAttribute(
    "href",
    "https://bse.telkomuniversity.ac.id/tim-fradium-berhasil-meraih-global-finale-winner-fully-on-chain-track-pada-world-computer-hacker-league-2025/",
  );

  await page.goto(`${root}/agentpay`);
  await expect(page.locator("[data-project-narrative]")).toContainText(
    "machine-readable tool discovery",
  );
  await expect(
    page.getByRole("heading", { level: 2, name: "Problem and stakes" }),
  ).toHaveCount(0);

  await expectNoRuntimeFailures(diagnostics, testInfo);
});

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
