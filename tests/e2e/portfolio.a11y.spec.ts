import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

type LegacyBaseline = {
  projects: Record<string, Record<string, number>>;
};

const baseline = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "quality/a11y-legacy-baseline.json"),
    "utf8",
  ),
) as LegacyBaseline;

test("legacy root has no new serious or critical axe regressions @a11y", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  await testInfo.attach("axe-result", {
    body: Buffer.from(JSON.stringify(result, null, 2)),
    contentType: "application/json",
  });

  const blocking = result.violations.filter(
    (violation) =>
      violation.impact === "serious" || violation.impact === "critical",
  );
  console.info(
    `axe ${testInfo.project.name}: ${JSON.stringify(
      blocking.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.length,
      })),
    )}`,
  );
  const allowed = baseline.projects[testInfo.project.name] ?? {};
  const regressions = blocking.flatMap((violation) => {
    const limit = allowed[violation.id] ?? 0;
    return violation.nodes.length <= limit
      ? []
      : [
          {
            id: violation.id,
            impact: violation.impact,
            nodes: violation.nodes.length,
            limit,
          },
        ];
  });

  expect(regressions).toEqual([]);
});
