import { describe, expect, it } from "vitest";

import {
  auditV4PresentationSource,
  auditV4PresentationTree,
} from "../../../scripts/lib/v4-presentation-audit.mjs";
import { REPOSITORY_ROOT } from "../content/fixtures";

describe("Portfolio V4 presentation policy audit", () => {
  it("accepts bounded local presentation patterns", () => {
    const source = `
      import { gsap } from "gsap";
      import { ResponsiveMedia } from "./responsive-media";

      export function Scene() {
        return <ResponsiveMedia asset={asset} fit="contain" />;
      }

      gsap.to(node, { opacity: 1, repeat: 0 });
      const trigger = { pin: false, scrub: false };
    `;

    expect(auditV4PresentationSource(source)).toEqual([]);
  });

  it("rejects runtime, ordering, motion, cursor, remote-asset, and legacy regressions", () => {
    const source = `
      import { Canvas } from "@react-three/fiber";
      import { OldStage } from "@/components/pfn/pfn-home";

      const motion = { pin: true, scrub: 1, repeat: -1 };
      const image = <img src="https://cdn.example.com/fake.png" />;
      const canvas = <canvas />;

      .mobile-stage { order: -1; cursor: none; }
    `;
    const rules = auditV4PresentationSource(source).map(({ rule }) => rule);

    expect(new Set(rules)).toEqual(
      new Set([
        "negative-order",
        "three-runtime",
        "canvas-runtime",
        "scroll-pin",
        "scroll-scrub",
        "infinite-repeat",
        "custom-cursor",
        "remote-visual",
        "v3-presentation-import",
      ]),
    );
  });

  it("rejects destructive cover cropping inside artifact primitives", () => {
    const source = `
      export function ArtifactFragment() {
        return (
          <figure data-artifact-id="paygate-receipt">
            <ResponsiveMedia asset={asset} fit="cover" />
          </figure>
        );
      }
    `;

    expect(
      auditV4PresentationSource(source).map(({ rule }) => rule),
    ).toContain("artifact-cover");
  });

  it("keeps the checked-in V4 modules inside the locked policy", () => {
    const result = auditV4PresentationTree({ projectRoot: REPOSITORY_ROOT });

    expect(result.files.length).toBeGreaterThan(0);
    expect(result.violations).toEqual([]);
  });
});
