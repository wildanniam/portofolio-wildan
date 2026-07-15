import { expect, test } from "@playwright/test";

const flagshipOrder = ["fradium", "nova-ai", "paygate", "quorum"] as const;
const publicRoutes = [
  "/",
  "/work",
  ...flagshipOrder.map((slug) => `/work/${slug}`),
  "/moments",
  "/about",
  "/contact",
] as const;

test("the V4 homepage leads with Wildan's research-builder identity and four flagship systems", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  const shell = page.locator('[data-portfolio-v4="true"]');
  await expect(shell).toHaveCount(1);
  await expect(page.locator("[data-v4-hero] h1")).toContainText(
    "I build software that lets them act.",
  );
  await expect(page.locator("[data-v4-hero] img")).toBeVisible();
  await expect(page.locator("[data-atlas-stage]")).toHaveCount(4);
  await expect(page.locator("[data-stage-action]")).toHaveCount(4);
  await expect(page.locator(".opg-project-explorer")).toHaveCount(0);
  await expect(page.locator("[data-portfolio-v3]")).toHaveCount(0);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("the work archive presents four complete, ordered, intrinsically contained records", async ({
  page,
}) => {
  await page.goto("/work");

  const records = page.locator("[data-work-record]");
  await expect(records).toHaveCount(4);
  expect(
    await records.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-work-record")),
    ),
  ).toEqual(flagshipOrder);

  for (const slug of flagshipOrder) {
    const record = page.locator(`[data-work-record="${slug}"]`);
    await expect(record.getByRole("heading", { level: 2 })).toHaveCount(1);
    await expect(record.locator("[data-brand-asset]")).toHaveCount(1);
    await expect(record.locator("figure img")).toHaveCSS("object-fit", "contain");
    await expect(record.getByRole("link", { name: "Read case study" })).toHaveAttribute(
      "href",
      `/work/${slug}`,
    );
  }
});

test("every flagship case study opens with a question, authorship, narrative, and evidence", async ({
  page,
}) => {
  for (const slug of flagshipOrder) {
    const response = await page.goto(`/work/${slug}`);
    expect(response?.status(), slug).toBe(200);

    const caseStudy = page.locator(`[data-project-case="${slug}"]`);
    await expect(caseStudy).toHaveCount(1);
    await expect(caseStudy.locator(".v4-case-opening h1")).toHaveCount(1);
    await expect(caseStudy.locator(".v4-case-opening__role")).not.toBeEmpty();
    await expect(caseStudy.locator(".v4-case-opening__visual img")).toHaveCSS(
      "object-fit",
      "contain",
    );
    await expect(caseStudy.locator(".v4-case-opening__facts div")).toHaveCount(4);
    await expect(caseStudy.locator(".v4-case-story__narrative h2")).not.toHaveCount(0);
    await expect(caseStudy.locator(".v4-case-evidence__item img")).not.toHaveCount(0);
    await expect(caseStudy.getByRole("navigation", { name: "Case study navigation" })).toHaveCount(1);
  }
});

test("Moments keeps seven documentary records and an accessible contextual lightbox", async ({
  browser,
  page,
  baseURL,
}) => {
  const noJsContext = await browser.newContext({ baseURL, javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto("/moments");
  await expect(noJsPage.locator("[data-moment]")).toHaveCount(7);
  await noJsContext.close();

  await page.goto("/moments");
  await expect(page.locator("[data-moment]")).toHaveCount(7);
  await expect(page.locator(".v4-moment-card--featured")).toHaveCount(1);
  await expect(page.locator(".v4-moment-card--featured")).toHaveAttribute(
    "data-moment",
    "refactory-build-room",
  );

  const trigger = page.getByRole("button", {
    name: "Open Building in the room, not only for the demo",
  });
  await trigger.focus();
  await trigger.click();

  const dialog = page.getByRole("dialog", {
    name: "Building in the room, not only for the demo",
  });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(dialog.getByRole("button", { name: "Close image" })).toBeFocused();
  await expect(dialog.getByText("Date", { exact: true })).toBeVisible();
  await expect(dialog.getByText("Place", { exact: true })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.body).overflow))
    .toBe("hidden");

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("about and contact retain an authored story and direct working contact", async ({
  page,
}) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "difficult questions",
  );
  await expect(page.locator(".v4-about__practice img")).toBeVisible();
  await expect(page.locator(".v4-about__principles li")).toHaveCount(3);
  await expect(page.locator(".v4-about__map li")).toHaveCount(4);

  await page.goto("/contact");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("uncertain");
  await expect(page.locator(".v4-contact__email")).toHaveAttribute(
    "href",
    "mailto:wildanniam4@gmail.com",
  );
  await expect(page.locator(".v4-contact__details a")).toHaveAttribute(
    "href",
    /^https:\/\//,
  );
});

test("sitemap and robots expose only the V4 public surface", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapBody = await sitemap.text();
  for (const route of publicRoutes) {
    expect(sitemapBody).toContain(
      `https://portofolio-wildan-zeta.vercel.app${route === "/" ? "" : route}`,
    );
  }
  expect(sitemapBody).not.toContain("/preview/");

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const robotsBody = await robots.text();
  expect(robotsBody).toContain("Allow: /");
  expect(robotsBody).toContain(
    "Sitemap: https://portofolio-wildan-zeta.vercel.app/sitemap.xml",
  );
});

test("every public route stays inside supported responsive widths", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "The explicit route and viewport matrix runs once.",
  );

  const viewports = [
    { width: 320, height: 720 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 1000 },
  ] as const;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of publicRoutes) {
      await page.goto(route);
      await expect(page.locator('[data-portfolio-v4="true"]')).toHaveCount(1);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${route} at ${viewport.width}px`).toBeLessThanOrEqual(0);
    }
  }
});

test("reduced motion leaves every visible route element settled", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.locator("[data-atlas-motion-controller]")).toHaveCount(0);
  const longestMotion = await page.evaluate(() => {
    const toMilliseconds = (value: string) => {
      const number = Number.parseFloat(value);
      return value.endsWith("ms") ? number : number * 1000;
    };
    return Math.max(
      0,
      ...Array.from(document.querySelectorAll('[data-portfolio-v4="true"] *')).flatMap(
        (node) => {
          const style = getComputedStyle(node);
          return [
            ...style.animationDuration.split(","),
            ...style.transitionDuration.split(","),
          ]
            .map((value) => toMilliseconds(value.trim()))
            .filter(Number.isFinite);
        },
      ),
    );
  });
  expect(longestMotion).toBeLessThanOrEqual(10);
});

test("Firefox and WebKit render every route with one visible primary heading", async ({
  page,
}, testInfo) => {
  test.skip(
    !["desktop-firefox", "desktop-webkit"].includes(testInfo.project.name),
    "Cross-engine route coherence only.",
  );

  for (const viewport of [
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    for (const route of publicRoutes) {
      const response = await page.goto(route);
      expect([200, 304], `${testInfo.project.name}: ${route}`).toContain(
        response?.status(),
      );
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  }
});
