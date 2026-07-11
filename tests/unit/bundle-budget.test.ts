import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  analyzeResponseOutcomes,
  appManifestKeyToRoutePattern,
  classifyHttpErrorResponses,
  classifyNetworkFailures,
  evaluateBudget,
  routeMatchesPattern,
  selectRouteBudget,
  uniqueSuccessfulResponses,
} from "../../scripts/lib/bundle-budget.mjs";

describe("evaluateBudget", () => {
  it("passes values at or below every configured ceiling", () => {
    const result = evaluateBudget(
      {
        totalInitialJavaScriptGzipBytes: 170_000,
        routeOwnedJavaScriptGzipBytes: 17_500,
      },
      {
        totalInitialJavaScriptGzipBytes: 170_000,
        routeOwnedJavaScriptGzipBytes: 18_000,
      },
    );

    expect(result.passed).toBe(true);
    expect(result.checks).toEqual([
      expect.objectContaining({
        metric: "totalInitialJavaScriptGzipBytes",
        remaining: 0,
        passed: true,
      }),
      expect.objectContaining({
        metric: "routeOwnedJavaScriptGzipBytes",
        remaining: 500,
        passed: true,
      }),
    ]);
  });

  it("fails explicitly when a metric is over budget or missing", () => {
    const result = evaluateBudget(
      { totalInitialJavaScriptGzipBytes: 170_001 },
      {
        totalInitialJavaScriptGzipBytes: 170_000,
        cssGzipBytes: 30_000,
      },
    );

    expect(result.passed).toBe(false);
    expect(result.checks).toEqual([
      expect.objectContaining({
        metric: "totalInitialJavaScriptGzipBytes",
        remaining: -1,
        passed: false,
        reason: "over-limit",
      }),
      expect.objectContaining({
        metric: "cssGzipBytes",
        actual: null,
        passed: false,
        reason: "metric-missing",
      }),
    ]);
  });

  it("rejects invalid metric values instead of producing a false pass", () => {
    expect(() =>
      evaluateBudget(
        { totalInitialJavaScriptGzipBytes: Number.NaN },
        { totalInitialJavaScriptGzipBytes: 150_000 },
      ),
    ).toThrow(/finite, non-negative number/);
  });
});

describe("route budget matching", () => {
  const routes = {
    "/": { limits: { cssGzipBytes: 30_000 } },
    "/work/[slug]": {
      limits: { totalInitialJavaScriptGzipBytes: 165_000 },
    },
  };

  it("matches a concrete case-study route to its dynamic budget", () => {
    expect(routeMatchesPattern("/work/fradium", "/work/[slug]")).toBe(true);
    expect(selectRouteBudget(routes, "/work/fradium")).toEqual({
      pattern: "/work/[slug]",
      budget: routes["/work/[slug]"],
    });
  });

  it("prefers an exact route budget", () => {
    expect(selectRouteBudget(routes, "/")).toEqual({
      pattern: "/",
      budget: routes["/"],
    });
  });
});

describe("App Router manifest normalization", () => {
  it("removes route groups without changing the public route", () => {
    expect(appManifestKeyToRoutePattern("/(legacy)/page")).toBe("/");
    expect(appManifestKeyToRoutePattern("/(v1)/work/[slug]/page")).toBe(
      "/work/[slug]",
    );
  });

  it("removes parallel-route slots from the public route", () => {
    expect(appManifestKeyToRoutePattern("/(v1)/@modal/work/[slug]/page")).toBe(
      "/work/[slug]",
    );
  });
});

describe("committed V1 viewport budgets", () => {
  const budgetConfig = JSON.parse(
    readFileSync(new URL("../../quality/budgets.json", import.meta.url), "utf8"),
  );

  it("samples both desktop and mobile when the V1 profile is activated", () => {
    expect(budgetConfig.profiles.v1.sampleViewports).toEqual([
      "desktop",
      "mobile",
    ]);
    expect(budgetConfig.viewports.mobile).toMatchObject({
      width: 390,
      height: 844,
      hasTouch: true,
      isMobile: true,
    });
  });

  it("preserves the stricter mobile media ceilings", () => {
    expect(
      budgetConfig.profiles.v1.routes["/"].viewportLimits.mobile,
    ).toEqual({
      initialMediaTransferBytes: 500_000,
      largestImageTransferBytes: 140_000,
    });
    expect(
      budgetConfig.profiles.v1.routes["/work/[slug]"].viewportLimits.mobile,
    ).toEqual({
      initialMediaTransferBytes: 500_000,
      largestImageTransferBytes: 140_000,
    });
  });
});

describe("network failure policy", () => {
  const allowance = {
    pathname: "/_vercel/speed-insights/script.js",
    resourceType: "script",
    errorText: "net::ERR_ABORTED",
  };
  const baseFailure = {
    url: "http://127.0.0.1:3102/_vercel/speed-insights/script.js",
    resourceType: "script",
    errorText: "net::ERR_ABORTED",
  };

  it("allows only the exact same-origin failure signature", () => {
    expect(
      classifyNetworkFailures(
        [baseFailure],
        "http://127.0.0.1:3102",
        [allowance],
      ),
    ).toEqual({ allowed: [baseFailure], unexpected: [] });
  });

  it.each([
    { resourceType: "image" },
    { errorText: "net::ERR_FAILED" },
    { url: "https://example.com/_vercel/speed-insights/script.js" },
  ])("rejects a mismatched failure signature: %o", (override) => {
    const failure = { ...baseFailure, ...override };
    expect(
      classifyNetworkFailures(
        [failure],
        "http://127.0.0.1:3102",
        [allowance],
      ),
    ).toEqual({ allowed: [], unexpected: [failure] });
  });
});

describe("successful response accounting", () => {
  it("keeps a successful response when a separate request to the same URL fails", () => {
    const successfulRequest = {};
    const failedRequest = {};
    const successfulResponse = {
      request: () => successfulRequest,
      status: () => 200,
      url: () => "https://example.com/runtime.js",
    };
    const failedResponse = {
      request: () => failedRequest,
      status: () => 200,
      url: () => "https://example.com/runtime.js",
    };

    expect(
      uniqueSuccessfulResponses(
        [successfulResponse, failedResponse],
        new Set([failedRequest]),
      ),
    ).toEqual([successfulResponse]);
  });

  it("reports HTTP subresource errors while leaving redirects alone", () => {
    const response = (status: number, url: string) => ({
      request: () => ({ resourceType: () => "script" }),
      status: () => status,
      url: () => url,
    });
    const redirect = response(302, "https://example.com/redirect.js");
    const missing = response(404, "https://example.com/missing.js");

    expect(classifyHttpErrorResponses([redirect, missing])).toEqual([
      {
        url: "https://example.com/missing.js",
        resourceType: "script",
        status: 404,
      },
    ]);
  });

  it("keeps a same-URL 404 visible when a later response succeeds", () => {
    const response = (status: number) => ({
      request: () => ({ resourceType: () => "script" }),
      status: () => status,
      url: () => "https://example.com/retried.js",
    });
    const missing = response(404);
    const recovered = response(200);

    const outcome = analyzeResponseOutcomes(
      [missing, recovered],
      new Set(),
    );
    expect(outcome.httpErrorResponses).toEqual([
      {
        url: "https://example.com/retried.js",
        resourceType: "script",
        status: 404,
      },
    ]);
    expect(outcome.uniqueResponses).toEqual([recovered]);
  });
});
