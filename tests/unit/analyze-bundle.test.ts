import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  buildAssetSetRelationship,
  enhancementBudgetLimits,
  evaluateExplorerEnhancementReadiness,
  parseArgs,
  partitionPostTriggerBuildAssets,
  selectEnhancementBudgetLimit,
} from "../../scripts/analyze-bundle.mjs";
import { evaluateBudget } from "../../scripts/lib/bundle-budget.mjs";

describe("bundle enhancement trigger CLI", () => {
  it.each(["near", "intent"] as const)(
    "accepts the explicit %s trigger without changing defaults",
    (trigger) => {
      const defaults = parseArgs([]);
      const options = parseArgs(["--enhancement-trigger", trigger]);

      expect(defaults.enhancementTrigger).toBeUndefined();
      expect(options).toMatchObject({
        enhancementTrigger: trigger,
        network: true,
        enforce: true,
        route: "/",
      });
    },
  );

  it("rejects an ambiguous trigger name", () => {
    expect(() =>
      parseArgs(["--enhancement-trigger", "scroll-or-hover"]),
    ).toThrow(/must be near or intent/);
  });

  it("keeps the real near and intent probe wired into the CI command", () => {
    const packageJson = JSON.parse(
      readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
    );
    const runner = readFileSync(
      new URL("../../scripts/analyze-explorer-bundle.mjs", import.meta.url),
      "utf8",
    );
    const workflow = readFileSync(
      new URL("../../.github/workflows/ci.yml", import.meta.url),
      "utf8",
    );

    expect(packageJson.scripts["analyze:bundle:explorer"]).toContain(
      "analyze-explorer-bundle.mjs",
    );
    expect(runner).toContain('["near", "intent"]');
    expect(workflow).toContain("npm run analyze:bundle:explorer");
  });
});

describe("explorer enhancement readiness", () => {
  it("accepts exactly one ready controller for an eligible desktop", () => {
    expect(
      evaluateExplorerEnhancementReadiness(
        { controllerCount: 1, motionState: "ready-wide" },
        true,
      ),
    ).toEqual({
      expectedControllerCount: 1,
      expectedState: "ready-wide",
      mismatchCount: 0,
      passed: true,
    });
  });

  it("rejects a failed or missing eligible enhancement", () => {
    expect(
      evaluateExplorerEnhancementReadiness(
        { controllerCount: 0, motionState: "failed" },
        true,
      ).mismatchCount,
    ).toBe(1);
  });

  it("accepts a static profile without a controller when motion is suppressed", () => {
    expect(
      evaluateExplorerEnhancementReadiness(
        { controllerCount: 0, motionState: "static-viewport" },
        false,
      ).passed,
    ).toBe(true);
  });
});

describe("post-trigger asset accounting", () => {
  it("partitions repeat requests away from the disjoint additional set", () => {
    expect(
      partitionPostTriggerBuildAssets(
        ["static/chunks/runtime-hash.js"],
        [
          "static/chunks/motion-hash.js",
          "static/chunks/runtime-hash.js",
          "static/chunks/motion-hash.js",
        ],
      ),
    ).toEqual({
      additionalFiles: ["static/chunks/motion-hash.js"],
      alreadyColdFiles: ["static/chunks/runtime-hash.js"],
      coldRelationship: {
        partitionMethod: "observed-post-trigger-minus-cold-navigation",
        disjointByConstruction: true,
        alreadyColdFiles: ["static/chunks/runtime-hash.js"],
      },
    });
  });

  it("reports deterministic intersections and subset status", () => {
    expect(
      buildAssetSetRelationship(
        ["static/chunks/motion-hash.js", "static/chunks/gsap-hash.js"],
        ["static/chunks/gsap-hash.js", "static/chunks/other-hash.js"],
      ),
    ).toEqual({
      referenceAvailable: true,
      isSubset: false,
      intersectionFiles: ["static/chunks/gsap-hash.js"],
      outsideReferenceFiles: ["static/chunks/motion-hash.js"],
    });
  });

  it("does not claim a subset when the dynamic manifest is unavailable", () => {
    expect(
      buildAssetSetRelationship(["static/chunks/motion-hash.js"], [], false),
    ).toEqual({
      referenceAvailable: false,
      isSubset: null,
      intersectionFiles: [],
      outsideReferenceFiles: ["static/chunks/motion-hash.js"],
    });
  });
});

describe("lazy explorer budget selection", () => {
  it("prefers a dedicated explorer limit when one is configured", () => {
    expect(
      selectEnhancementBudgetLimit({
        lazyExplorerJavaScriptGzipBytes: 60_000,
        lazyJavaScriptGzipBytes: 55_000,
      }),
    ).toEqual({
      conceptualMetric: "lazyExplorerJavaScriptGzipBytes",
      sourceMetric: "lazyExplorerJavaScriptGzipBytes",
      limit: 60_000,
    });
  });

  it("uses and identifies the committed lazy JavaScript fallback", () => {
    const budgetConfig = JSON.parse(
      readFileSync(
        new URL("../../quality/budgets.json", import.meta.url),
        "utf8",
      ),
    );

    expect(
      selectEnhancementBudgetLimit(budgetConfig.profiles.v1.routes["/"].limits),
    ).toEqual({
      conceptualMetric: "lazyExplorerJavaScriptGzipBytes",
      sourceMetric: "lazyJavaScriptGzipBytes",
      limit: 60_000,
    });
  });

  it("fails the enhancement gate on post-trigger runtime or state errors", () => {
    const metrics = {
      postTriggerAdditionalJavaScriptGzipBytes: 46_038,
      postTriggerUnexpectedFailedRequestCount: 0,
      postTriggerHttpErrorResponseCount: 0,
      postTriggerPageErrorCount: 1,
      postTriggerEnhancementStateMismatchCount: 1,
    };

    const evaluation = evaluateBudget(
      metrics,
      enhancementBudgetLimits(60_000),
    );
    expect(evaluation.passed).toBe(false);
    expect(
      evaluation.checks
        .filter((check) => !check.passed)
        .map((check) => check.metric),
    ).toEqual([
      "postTriggerPageErrorCount",
      "postTriggerEnhancementStateMismatchCount",
    ]);
  });
});
