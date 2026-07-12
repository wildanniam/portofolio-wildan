import { expect, test } from "@playwright/test";

test("the V2 homepage makes identity and equal-weight work visible", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  await expect(page.locator("[data-portfolio-v2]")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1, name: "Building is how I learn." })).toBeVisible();
  await expect(page.locator(".pfn-project-item")).toHaveCount(4);
  await expect(page.getByRole("link", { name: "Read field notes" })).toHaveCount(4);
  await expect(page.locator(".opg-project-explorer")).toHaveCount(0);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("all published V2 routes render their primary content", async ({ page }) => {
  const routes = [
    ["/work", "Work with a trail behind it."],
    ["/work/fradium", "Fradium"],
    ["/work/nova-ai", "Nova AI Wallet"],
    ["/work/paygate", "PayGate"],
    ["/work/quorum", "Quorum"],
    ["/moments", "The work around the work."],
    ["/about", "I learn by making the system visible."],
    ["/contact", "Make the next system more trustworthy."],
  ] as const;

  for (const [route, heading] of routes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.locator("[data-portfolio-v2]")).toHaveCount(1);
  }
});

test("Moments retain a server-rendered gallery and accessible client controls", async ({ browser, page, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  const noJsPage = await context.newPage();
  const response = await noJsPage.goto("/moments");
  expect(response?.status()).toBe(200);
  await expect(noJsPage.locator(".pfn-moment-record")).toHaveCount(7);
  await context.close();

  await test.step("enhanced gallery exposes category filters", async () => {
    await page.goto("/moments");
    await expect(page.getByRole("button", { name: "All notes" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Build", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Win", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Give" })).toHaveCount(0);

    await page.getByRole("button", { name: "Build", exact: true }).click();
    await expect(page.locator(".pfn-moment-record")).toHaveCount(1);
    await page.getByRole("button", { name: "Open Building in the room, not only for the demo" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close image" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});

test("sitemap and robots expose only the V2 public surface", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapBody = await sitemap.text();
  for (const route of ["/", "/work", "/about", "/contact", "/moments", "/work/fradium", "/work/nova-ai", "/work/paygate", "/work/quorum"]) {
    expect(sitemapBody).toContain(`https://wildanniam.dev${route}`);
  }
  expect(sitemapBody).not.toContain("/preview/");

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const robotsBody = await robots.text();
  expect(robotsBody).toContain("Allow: /");
  expect(robotsBody).not.toContain("/preview/");
  expect(robotsBody).toContain("Sitemap: https://wildanniam.dev/sitemap.xml");
});

test("unknown routes keep the V2 visual shell", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.locator("[data-portfolio-v2]")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1, name: "This page could not be found." })).toBeVisible();
});
