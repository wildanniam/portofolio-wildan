import { describe, expect, it } from "vitest";

import {
  auditReleaseRoutes,
  extractHtmlSignals,
  RELEASE_ROUTE_AUDIT_SCHEMA_VERSION,
} from "../../../scripts/lib/release-route-audit.mjs";

const origin = "https://portfolio.test";

function html({
  anchors = [],
  canonical,
  description = "Evidence-backed portfolio page.",
  ids = ["main-content"],
  noindex = false,
  ogImage = `${origin}/social.png`,
  ogUrl,
  title = "Portfolio page",
}: {
  anchors?: string[];
  canonical?: string;
  description?: string | null;
  ids?: string[];
  noindex?: boolean;
  ogImage?: string | null;
  ogUrl?: string;
  title?: string;
} = {}) {
  return `<!doctype html>
    <html><head>
      <title>${title}</title>
      ${description ? `<meta name="description" content="${description}">` : ""}
      ${noindex ? '<meta name="robots" content="noindex, nofollow">' : ""}
      ${canonical ? `<link rel="canonical" href="${canonical}">` : ""}
      <meta property="og:title" content="${title}">
      ${description ? `<meta property="og:description" content="${description}">` : ""}
      ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ""}
      ${ogUrl ? `<meta property="og:url" content="${ogUrl}">` : ""}
    </head><body>
      ${ids.map((id) => `<main id="${id}"></main>`).join("")}
      ${anchors.map((href) => `<a href="${href}">Link</a>`).join("")}
    </body></html>`;
}

function response(
  body: string,
  {
    contentType = "text/html; charset=utf-8",
    headers = {},
    status = 200,
  }: {
    contentType?: string;
    headers?: Record<string, string>;
    status?: number;
  } = {},
) {
  return new Response(body, {
    status,
    headers: { "Content-Type": contentType, ...headers },
  });
}

function makeFetch(
  fixtures: Record<string, () => Response>,
  requests: Array<{ authorization: string | null; path: string }> = [],
) {
  return async (input: URL | RequestInfo, init?: RequestInit) => {
    const url = new URL(input instanceof URL ? input : input.toString());
    const headers = new Headers(init?.headers);
    requests.push({
      authorization: headers.get("authorization"),
      path: `${url.pathname}${url.search}`,
    });
    const fixture = fixtures[`${url.pathname}${url.search}`];
    return fixture ? fixture() : response("Not found", { status: 404 });
  };
}

describe("release route HTML extraction", () => {
  it("extracts decoded metadata, anchors, and sorted document ids", () => {
    const signals = extractHtmlSignals(`
      <title>Work &amp; proof</title>
      <meta content="A &amp; B" name="description">
      <meta content="Work proof" property="og:title">
      <meta property="og:description" content="A release proof">
      <meta property="og:image" content="https://portfolio.test/social.png">
      <meta property="og:url" content="https://portfolio.test/work">
      <link href="/work" rel="canonical alternate">
      <a href="/contact?from=work&amp;mode=direct">Contact</a>
      <div id="zeta"></div><div id='alpha'></div>
    `);

    expect(signals).toEqual({
      anchors: ["/contact?from=work&mode=direct"],
      canonical: "/work",
      description: "A & B",
      ids: ["alpha", "zeta"],
      openGraph: {
        description: "A release proof",
        image: "https://portfolio.test/social.png",
        title: "Work proof",
        url: "https://portfolio.test/work",
      },
      robots: null,
      title: "Work & proof",
    });
  });
});

describe("release route audit", () => {
  it("passes public, protected, withheld, discovery, and internal-link boundaries", async () => {
    const requests: Array<{ authorization: string | null; path: string }> = [];
    const fetchImpl = makeFetch(
      {
        "/": () =>
          response(
            html({
              anchors: [
                "/contact",
                "#main-content",
                "mailto:wildan@example.test",
              ],
              canonical: `${origin}/`,
              ogUrl: `${origin}/`,
              title: "Wildan Syukri Niam",
            }),
          ),
        "/contact": () =>
          response(
            html({
              canonical: `${origin}/contact`,
              ogUrl: `${origin}/contact`,
              title: "Contact",
            }),
          ),
        "/moments": () =>
          response(html({ noindex: true, title: "Not found" }), {
            status: 404,
          }),
        "/preview/open-proving-ground/site": () =>
          response(
            html({
              anchors: ["/preview/open-proving-ground/site#main-content"],
              noindex: true,
              title: "Private composition",
            }),
            {
              headers: {
                "Cache-Control": "private, no-store, max-age=0",
                "X-Robots-Tag": "noindex, nofollow",
              },
            },
          ),
        "/robots.txt": () =>
          response(
            `User-agent: *\nAllow: /\nDisallow: /preview/open-proving-ground/\nSitemap: ${origin}/sitemap.xml\n`,
            { contentType: "text/plain" },
          ),
        "/sitemap.xml": () =>
          response(
            `<urlset><url><loc>${origin}/</loc></url><url><loc>${origin}/contact</loc></url></urlset>`,
            { contentType: "application/xml" },
          ),
        "/social.png": () => response("png", { contentType: "image/png" }),
      },
      requests,
    );

    const report = await auditReleaseRoutes({
      expectedSitemapPaths: ["/", "/contact"],
      fetchImpl,
      forbiddenSitemapPrefixes: ["/preview", "/moments"],
      origin,
      previewAuthorization: "Basic protected-token",
      routes: [
        { classification: "public", expectedStatus: 200, path: "/" },
        { classification: "public", expectedStatus: 200, path: "/contact" },
        {
          classification: "protected",
          expectedStatus: 200,
          path: "/preview/open-proving-ground/site",
        },
        { classification: "withheld", expectedStatus: 404, path: "/moments" },
      ],
    });

    expect(report.schemaVersion).toBe(RELEASE_ROUTE_AUDIT_SCHEMA_VERSION);
    expect(report.summary).toEqual({
      errors: 0,
      internalLinks: 3,
      openGraphImages: 1,
      passed: true,
      routes: 4,
      warnings: 0,
    });
    expect(report.findings).toEqual([]);
    expect(
      requests.find(
        (request) => request.path === "/preview/open-proving-ground/site",
      )?.authorization,
    ).toBe("Basic protected-token");
    expect(
      requests.find((request) => request.path === "/contact")?.authorization,
    ).toBeNull();
  });

  it("reports metadata, placeholder, internal route, and discovery regressions", async () => {
    const fetchImpl = makeFetch({
      "/": () =>
        response(
          html({
            anchors: [
              "#",
              "/missing",
              "/redirect",
              "/preview/open-proving-ground/site",
              "https://example.com/todo",
            ],
            canonical: undefined,
            description: null,
            ogImage: null,
            ogUrl: undefined,
          }),
        ),
      "/missing": () => response(html({ title: "Missing" }), { status: 404 }),
      "/redirect": () =>
        response("", { headers: { Location: "/missing" }, status: 302 }),
      "/preview/open-proving-ground/site": () =>
        response(html({ noindex: true }), {
          headers: {
            "Cache-Control": "private, no-store",
            "X-Robots-Tag": "noindex, nofollow",
          },
        }),
      "/robots.txt": () =>
        response("User-agent: *\nAllow: /\n", { contentType: "text/plain" }),
      "/sitemap.xml": () =>
        response(
          `<urlset><url><loc>${origin}/moments</loc></url><url><loc>${origin}/moments</loc></url></urlset>`,
          { contentType: "application/xml" },
        ),
    });

    const report = await auditReleaseRoutes({
      expectedSitemapPaths: ["/"],
      fetchImpl,
      forbiddenSitemapPrefixes: ["/moments", "/preview"],
      origin,
      previewAuthorization: "Basic protected-token",
      routes: [{ classification: "public", expectedStatus: 200, path: "/" }],
    });
    const codes: string[] = report.findings.map(
      (entry: { code: string }) => entry.code,
    );

    expect(report.summary.passed).toBe(false);
    expect(codes).toEqual(
      expect.arrayContaining([
        "discovery.robots-preview-disallow",
        "discovery.robots-sitemap",
        "discovery.sitemap-private-route",
        "discovery.sitemap-route-missing",
        "discovery.sitemap-route-duplicate",
        "discovery.sitemap-route-unexpected",
        "href.internal-status",
        "href.internal-redirect",
        "href.placeholder",
        "href.public-preview-leak",
        "metadata.canonical-missing",
        "metadata.description-missing",
        "metadata.og-description-missing",
        "metadata.og-image-missing",
        "metadata.og-url-missing",
      ]),
    );
    expect(
      codes.filter((code: string) => code === "href.placeholder"),
    ).toHaveLength(2);
  });
});
