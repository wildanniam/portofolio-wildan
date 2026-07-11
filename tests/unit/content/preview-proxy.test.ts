import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import { config, proxy } from "../../../src/proxy";

const originalPreviewEnvironment = process.env.PORTFOLIO_V1_PREVIEW;
const originalPreviewToken = process.env.PORTFOLIO_V1_PREVIEW_TOKEN;
const testToken = "portfolio-v1-unit-preview-token-value";
const authorization = `Basic ${Buffer.from(`preview:${testToken}`).toString("base64")}`;

function authenticatedRequest(pathname: string): NextRequest {
  return new NextRequest(`https://portfolio.test${pathname}`, {
    headers: { Authorization: authorization },
  });
}

afterEach(() => {
  if (originalPreviewEnvironment === undefined) {
    delete process.env.PORTFOLIO_V1_PREVIEW;
  } else {
    process.env.PORTFOLIO_V1_PREVIEW = originalPreviewEnvironment;
  }
  if (originalPreviewToken === undefined) {
    delete process.env.PORTFOLIO_V1_PREVIEW_TOKEN;
  } else {
    process.env.PORTFOLIO_V1_PREVIEW_TOKEN = originalPreviewToken;
  }
});

describe("private preview request gate", () => {
  it("matches only the Open Proving Ground preview namespace", () => {
    expect(
      unstable_doesMiddlewareMatch({
        config,
        nextConfig: {},
        url: "/preview/open-proving-ground/content/fradium",
      }),
    ).toBe(true);
    expect(
      unstable_doesMiddlewareMatch({
        config,
        nextConfig: {},
        url: "/work/fradium",
      }),
    ).toBe(false);
  });

  it("returns a semantic no-store 404 when preview is disabled", async () => {
    delete process.env.PORTFOLIO_V1_PREVIEW;

    const response = proxy(
      new NextRequest("https://portfolio.test/preview/open-proving-ground"),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    await expect(response.text()).resolves.toContain(
      "This design checkpoint is not enabled",
    );
  });

  it("passes the request to the preview route only when explicitly enabled", () => {
    process.env.PORTFOLIO_V1_PREVIEW = "1";
    process.env.PORTFOLIO_V1_PREVIEW_TOKEN = testToken;

    const response = proxy(
      authenticatedRequest("/preview/open-proving-ground/content/fradium"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("fails closed when preview credentials are absent or not configured", async () => {
    process.env.PORTFOLIO_V1_PREVIEW = "1";
    delete process.env.PORTFOLIO_V1_PREVIEW_TOKEN;

    const unconfigured = proxy(
      new NextRequest("https://portfolio.test/preview/open-proving-ground"),
    );
    expect(unconfigured.status).toBe(404);
    await expect(unconfigured.text()).resolves.toContain(
      "has not configured a valid preview credential",
    );

    process.env.PORTFOLIO_V1_PREVIEW_TOKEN = testToken;
    const unauthorized = proxy(
      new NextRequest("https://portfolio.test/preview/open-proving-ground"),
    );
    expect(unauthorized.status).toBe(401);
    expect(unauthorized.headers.get("www-authenticate")).toContain("Basic");
    expect(unauthorized.headers.get("cache-control")).toContain("no-store");
  });

  it("rejects an invalid preview credential", () => {
    process.env.PORTFOLIO_V1_PREVIEW = "1";
    process.env.PORTFOLIO_V1_PREVIEW_TOKEN = testToken;

    const response = proxy(
      new NextRequest("https://portfolio.test/preview/open-proving-ground", {
        headers: {
          Authorization: `Basic ${Buffer.from("preview:not-the-token").toString("base64")}`,
        },
      }),
    );

    expect(response.status).toBe(401);
  });

  it("returns a semantic 404 for an unknown project before static fallback", async () => {
    process.env.PORTFOLIO_V1_PREVIEW = "1";
    process.env.PORTFOLIO_V1_PREVIEW_TOKEN = testToken;

    const response = proxy(
      authenticatedRequest(
        "/preview/open-proving-ground/content/not-a-project",
      ),
    );

    expect(response.status).toBe(404);
    await expect(response.text()).resolves.toContain(
      "This project preview does not exist.",
    );
  });
});
