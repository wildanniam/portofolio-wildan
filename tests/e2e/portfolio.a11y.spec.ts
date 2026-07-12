import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const route of ["/", "/work", "/work/paygate", "/moments", "/about", "/contact"] as const) {
  test(`${route} has no serious or critical accessibility violations @a11y`, async ({ page }, testInfo) => {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    await testInfo.attach(`axe-${route === "/" ? "home" : route.slice(1)}`, {
      body: Buffer.from(JSON.stringify(result, null, 2)),
      contentType: "application/json",
    });

    const blocking = result.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.length }));
    expect(blocking).toEqual([]);
  });
}
