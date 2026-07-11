import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { evaluateMotionEligibility } from "../../../src/components/v1/explorer/project-explorer-motion-policy";

const eligible = {
  height: 760,
  pointerFine: true,
  reducedMotion: false,
  saveData: false,
  width: 1120,
} as const;

describe("project explorer motion policy", () => {
  it("allows only the exact wide, tall, precise-pointer baseline and above", () => {
    expect(evaluateMotionEligibility(eligible)).toEqual({
      eligible: true,
      reason: null,
    });
    expect(
      evaluateMotionEligibility({ ...eligible, height: 900, width: 1440 }),
    ).toEqual({ eligible: true, reason: null });
  });

  it.each([
    [{ ...eligible, width: 1119 }, "viewport"],
    [{ ...eligible, height: 759 }, "viewport"],
    [{ ...eligible, pointerFine: false }, "pointer"],
    [{ ...eligible, reducedMotion: true }, "reduced-motion"],
    [{ ...eligible, saveData: true }, "save-data"],
    [{ ...eligible, width: Number.NaN }, "invalid-geometry"],
    [{ ...eligible, height: 0 }, "invalid-geometry"],
  ])("rejects an ineligible environment", (input, reason) => {
    expect(evaluateMotionEligibility(input)).toEqual({
      eligible: false,
      reason,
    });
  });
});

describe("project explorer dependency boundary", () => {
  it("keeps GSAP and React-GSAP imports inside the dynamic motion module", () => {
    const relativeFiles = [
      "../../../src/components/v1/explorer/project-explorer.tsx",
      "../../../src/components/v1/explorer/project-explorer-island.tsx",
      "../../../src/components/v1/explorer/project-explorer-enhancer.tsx",
      "../../../src/components/v1/explorer/project-explorer-motion-policy.ts",
    ];

    for (const relativeFile of relativeFiles) {
      const source = readFileSync(
        fileURLToPath(new URL(relativeFile, import.meta.url)),
        "utf8",
      );
      expect(source).not.toMatch(/from\s+["'](?:@gsap\/react|gsap(?:\/|["']))/);
    }

    const enhancer = readFileSync(
      fileURLToPath(
        new URL(
          "../../../src/components/v1/explorer/project-explorer-enhancer.tsx",
          import.meta.url,
        ),
      ),
      "utf8",
    );
    expect(enhancer).toContain('import("./project-explorer-motion")');

    const motion = readFileSync(
      fileURLToPath(
        new URL(
          "../../../src/components/v1/explorer/project-explorer-motion.tsx",
          import.meta.url,
        ),
      ),
      "utf8",
    );
    expect(motion).toContain('from "@gsap/react"');
    expect(motion).toContain('from "gsap"');
    expect(motion).toContain('from "gsap/ScrollTrigger"');
    expect(motion).toContain("useGSAP(");
  });
});
