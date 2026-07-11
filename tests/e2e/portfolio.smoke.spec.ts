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

test("work and contact are real server-rendered V1 routes", async ({ page }) => {
  for (const [route, title] of [
    ["/work", "Work"],
    ["/contact", "Contact"],
  ] as const) {
    const response = await page.goto(route);

    expect(response?.status(), route).toBe(200);
    await expect(page).toHaveURL(new RegExp(`${route}$`));
    await expect(page.locator('[data-site-shell="v1"]')).toHaveCount(1);
    await expect(page.locator('[data-site-shell="legacy"]')).toHaveCount(0);
    await expect(page.locator("main#main-content")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      `${title} — Wildan Syukri Niam`,
    );
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
      "content",
      `${title} — Wildan Syukri Niam`,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://wildanniam.dev${route}`,
    );
  }
});

test("the V1 shell exposes a visible keyboard skip path without horizontal overflow", async ({
  page,
}) => {
  await page.goto("/work");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work#main-content$/);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("unpublished projects and moments fail closed inside the V1 shell", async ({
  page,
}) => {
  for (const route of ["/work/fradium", "/work/not-a-project", "/moments"]) {
    const response = await page.goto(route);

    expect(response?.status(), route).toBe(404);
    await expect(page.locator('[data-site-shell="v1"]')).toHaveCount(1);
    await expect(page.locator('[data-site-shell="legacy"]')).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
      "content",
      /noindex/i,
    );
  }
});

test("SEO discovery exposes public routes without preview records", async ({
  request,
}) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapBody = await sitemap.text();

  for (const route of ["/", "/work", "/contact"]) {
    expect(sitemapBody).toContain(`https://wildanniam.dev${route}`);
  }
  for (const privatePath of [
    "/preview/",
    "/moments",
    "/work/fradium",
    "/work/nova-ai",
    "/work/paygate",
    "/work/quorum",
  ]) {
    expect(sitemapBody).not.toContain(privatePath);
  }

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const robotsBody = await robots.text();
  expect(robotsBody).toContain("Disallow: /preview/open-proving-ground/");
  expect(robotsBody).toContain("Sitemap: https://wildanniam.dev/sitemap.xml");
});

test("the deferred contact API is not publicly callable", async ({ request }) => {
  const response = await request.post("/api/contact", {
    data: {
      email: "visitor@example.com",
      message: "This endpoint must stay unavailable.",
      name: "Portfolio visitor",
    },
  });

  expect([404, 405]).toContain(response.status());
});

test("critical V1 routes remain useful without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
  });
  const page = await context.newPage();

  for (const route of ["/work", "/contact"]) {
    const response = await page.goto(route);

    expect(response?.status(), route).toBe(200);
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole("link", { name: "Home", exact: true }),
    ).toHaveAttribute(
      "href",
      "/",
    );
  }

  await context.close();
});
