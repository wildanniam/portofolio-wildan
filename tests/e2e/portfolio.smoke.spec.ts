import { expect, test } from "@playwright/test";

test("the V3 homepage makes identity, proof, and distinct flagship work visible", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  await expect(page.locator("[data-portfolio-v3]")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1, name: "I build systems you can inspect." })).toBeVisible();
  await expect(page.locator(".pfn-atlas-item")).toHaveCount(4);
  await expect(page.locator(".pfn-atlas-item--feature")).toHaveCount(1);
  await expect(page.locator(".pfn-atlas-item--column")).toHaveCount(1);
  await expect(page.locator(".pfn-atlas-item--compact")).toHaveCount(1);
  await expect(page.locator(".pfn-atlas-item--landscape")).toHaveCount(1);
  await expect(page.getByRole("link", { name: /Open .* case study/ })).toHaveCount(4);
  await expect(page.locator(".pfn-hero__portrait img")).not.toHaveAttribute("loading", "lazy");
  await expect(page.locator(".opg-project-explorer")).toHaveCount(0);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("all published V3 routes render their primary content", async ({ page }) => {
  const routes = [
    ["/work", "Systems with a trail behind them."],
    ["/work/fradium", "Fradium"],
    ["/work/nova-ai", "Nova AI Wallet"],
    ["/work/paygate", "PayGate"],
    ["/work/quorum", "Quorum"],
    ["/moments", "The work around the work."],
    ["/about", "I make ambitious systems easier to see."],
    ["/contact", "Let's build something worth inspecting."],
  ] as const;

  for (const [route, heading] of routes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.locator("[data-portfolio-v3]")).toHaveCount(1);
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
    await expect(page.getByRole("button", { name: "All moments" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Build", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Wins", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Give" })).toHaveCount(0);

    await page.getByRole("button", { name: "Build", exact: true }).click();
    await expect(page.locator(".pfn-moment-record")).toHaveCount(1);
    await page.getByRole("button", { name: "Open Building in the room, not only for the demo" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close image" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});

test("sitemap and robots expose only the V3 public surface", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapBody = await sitemap.text();
  for (const route of ["/", "/work", "/about", "/contact", "/moments", "/work/fradium", "/work/nova-ai", "/work/paygate", "/work/quorum"]) {
    expect(sitemapBody).toContain(`https://portofolio-wildan-zeta.vercel.app${route}`);
  }
  expect(sitemapBody).not.toContain("/preview/");

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const robotsBody = await robots.text();
  expect(robotsBody).toContain("Allow: /");
  expect(robotsBody).not.toContain("/preview/");
  expect(robotsBody).toContain(
    "Sitemap: https://portofolio-wildan-zeta.vercel.app/sitemap.xml",
  );
});

test("unknown routes keep the V3 visual shell", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.locator("[data-portfolio-v3]")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1, name: "This page could not be found." })).toBeVisible();
});

test("mobile navigation is operable, route-aware, and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/work/paygate");

  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Navigate" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "page");

  await page.getByRole("button", { name: "Close navigation" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  await dialog.getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { level: 1, name: "I make ambitious systems easier to see." })).toBeVisible();
});

test("the responsive surface has no horizontal overflow at release breakpoints", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "The matrix runs once with explicit viewports.");

  const routes = ["/", "/work", "/work/paygate", "/moments", "/about", "/contact"] as const;
  const viewports = [
    { width: 320, height: 720 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ] as const;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("[data-portfolio-v3]")).toHaveCount(1);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${route} at ${viewport.width}px`).toBeLessThanOrEqual(0);
    }
  }
});

test("case studies lead with outcome, authorship, and inspectable evidence", async ({ page }) => {
  await page.goto("/work/paygate");
  const viewportHeight = await page.evaluate(() => window.innerHeight);

  await expect(page.getByRole("heading", { name: "Founder & Full-Stack Developer" })).toBeVisible();
  await expect(page.locator(".pfn-case-figure").first().locator("img")).toBeVisible();
  const outcome = page.locator(".pfn-case-outcome");
  await expect(outcome).toBeAttached();
  const outcomeY = await outcome.evaluate((node) => node.getBoundingClientRect().top + window.scrollY);
  expect(outcomeY).toBeLessThanOrEqual(viewportHeight * 2);
  await expect(page.getByRole("link", { name: /Open live project/i })).toHaveAttribute("href", /^https?:\/\//);
  await expect(page.getByRole("link", { name: /View source/i })).toHaveAttribute("href", /^https?:\/\//);
});

test("Moments lightbox preserves context, keyboard behavior, and trigger focus", async ({ page }) => {
  await page.goto("/moments");
  const trigger = page.getByRole("button", { name: "Open A global result, held by the whole team" });
  await trigger.focus();
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "A global result, held by the whole team" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Event", { exact: true })).toBeVisible();
  await expect(dialog.getByText("Date", { exact: true })).toBeVisible();
  await expect(dialog.getByText("Place", { exact: true })).toBeVisible();
  await expect(dialog.locator(".pfn-lightbox__copy > p")).toHaveCount(3);

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("responsive media exposes mobile art direction and reduced motion stays quiet", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.locator(".pfn-hero__portrait source[media='(max-width: 639px)']")).toHaveCount(1);
  const longestMotion = await page.evaluate(() => {
    const toMilliseconds = (value: string) => {
      const number = Number.parseFloat(value);
      return value.endsWith("ms") ? number : number * 1000;
    };
    return Math.max(
      ...Array.from(document.querySelectorAll("[data-portfolio-v3] *")).flatMap((node) => {
        const style = getComputedStyle(node);
        return [...style.animationDuration.split(","), ...style.transitionDuration.split(",")]
          .map((value) => toMilliseconds(value.trim()))
          .filter(Number.isFinite);
      }),
    );
  });
  expect(longestMotion).toBeLessThanOrEqual(10);
});

test("release routes remain coherent at Firefox and WebKit tablet and mobile widths", async ({ page }, testInfo) => {
  test.skip(
    !["desktop-firefox", "desktop-webkit"].includes(testInfo.project.name),
    "Cross-engine responsive matrix only.",
  );

  const routes = [
    ["/", "I build systems you can inspect."],
    ["/work", "Systems with a trail behind them."],
    ["/work/fradium", "Fradium"],
    ["/work/nova-ai", "Nova AI Wallet"],
    ["/work/paygate", "PayGate"],
    ["/work/quorum", "Quorum"],
    ["/moments", "The work around the work."],
    ["/about", "I make ambitious systems easier to see."],
    ["/contact", "Let's build something worth inspecting."],
  ] as const;
  const viewports = [
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ] as const;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const [route, heading] of routes) {
      const response = await page.goto(route);
      expect([200, 304], `${testInfo.project.name}: ${route}`).toContain(response?.status());
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${testInfo.project.name}: ${route} at ${viewport.width}px`).toBeLessThanOrEqual(0);
    }
  }
});
