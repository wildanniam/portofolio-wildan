import { describe, expect, it } from "vitest";

import { selectHomepage } from "../../../src/content/queries";
import { loadContentBundle } from "../../../src/content/repository.node";
import { REPOSITORY_ROOT } from "./fixtures";

const expectedStages = [
  ["fradium", "wide-left"],
  ["nova-ai", "narrow-right"],
  ["paygate", "narrow-left"],
  ["quorum", "wide-right"],
] as const;

const expectedSlots = {
  fradium: ["atlas-primary-surface", "atlas-supporting-fragment"],
  "nova-ai": ["atlas-primary-surface", "atlas-supporting-fragment"],
  paygate: ["atlas-primary-surface", "atlas-supporting-fragment"],
  quorum: [
    "atlas-primary-surface",
    "atlas-supporting-fragment",
    "atlas-decoration",
  ],
} as const;

describe("Portfolio V4 homepage selection contract", () => {
  it("resolves every canonical Atlas stage without silently dropping content", () => {
    const content = loadContentBundle({ repositoryRoot: REPOSITORY_ROOT });
    const selection = selectHomepage(content, { asOf: "2026-07-15" });

    expect(selection.projectStages).toHaveLength(
      content.homepage.projectStages.length,
    );
    expect(
      selection.projectStages.map(({ stage }) => [
        stage.projectSlug,
        stage.variant,
      ]),
    ).toEqual(expectedStages);

    for (const selected of selection.projectStages) {
      const { artifacts, outcomeClaim, project, stage } = selected;
      expect(project.slug).toBe(stage.projectSlug);
      expect(project.claims).toContain(outcomeClaim);
      expect(outcomeClaim.id).toBe(stage.outcomeClaimId);
      expect(artifacts.map(({ id }) => id)).toEqual(stage.artifactAssetIds);
      expect(artifacts).toHaveLength(stage.artifactAssetIds.length);
    }
  });

  it("keeps authentic Atlas assets intrinsic, project-owned, and mobile-ready", () => {
    const content = loadContentBundle({ repositoryRoot: REPOSITORY_ROOT });
    const selection = selectHomepage(content, { asOf: "2026-07-15" });

    for (const { artifacts, project } of selection.projectStages) {
      const slots = expectedSlots[project.slug as keyof typeof expectedSlots];
      expect(slots).toBeDefined();
      expect(artifacts.map(({ slot }) => slot)).toEqual(slots);

      for (const artifact of artifacts) {
        expect(["image", "svg"]).toContain(artifact.mediaKind);
        expect(artifact.src).toMatch(
          new RegExp(`^/media/projects/${project.slug}/atlas/`),
        );
        expect(artifact.crop).toEqual({ mode: "intrinsic" });
        expect(artifact.provenance).toMatchObject({
          kind: "owned",
          sourceRepository: expect.any(String),
          revision: expect.stringMatching(/^[a-f0-9]{40}$/),
          sourcePath: expect.any(String),
        });
      }

      const primary = artifacts.find(
        ({ slot }) => slot === "atlas-primary-surface",
      );
      expect(primary).toBeDefined();
      expect(primary).toHaveProperty("mobile.src");
      expect(primary).toHaveProperty("mobile.crop.mode", "intrinsic");
    }
  });

  it("keeps every project mark authentic, decorative, and revision-pinned", () => {
    const content = loadContentBundle({ repositoryRoot: REPOSITORY_ROOT });
    const selection = selectHomepage(content, { asOf: "2026-07-15" });

    for (const { project } of selection.projectStages) {
      expect(project.branding?.mark).toMatchObject({
        accessibility: { mode: "decorative" },
        provenance: {
          sourceRepository: expect.stringMatching(/^https:\/\/github\.com\//),
          revision: expect.stringMatching(/^[a-f0-9]{40}$/),
          sourcePath: expect.any(String),
          creator: expect.any(String),
          rights: expect.any(String),
        },
      });
    }
  });

  it("resolves one lead and three supporting documentary Moments without fallback", () => {
    const content = loadContentBundle({ repositoryRoot: REPOSITORY_ROOT });
    const selection = selectHomepage(content, { asOf: "2026-07-15" });

    expect(selection.featuredMoments).toHaveLength(
      content.homepage.featuredMoments.length,
    );
    expect(
      selection.featuredMoments.map(({ featured }) => featured.role),
    ).toEqual(["lead", "supporting", "supporting", "supporting"]);

    for (const { asset, featured, moment } of selection.featuredMoments) {
      expect(moment.id).toBe(featured.momentId);
      expect(moment.publication).toBe("published");
      expect(moment.assets).toContain(asset);
      expect(asset.id).toBe(featured.assetId);
      expect(asset.mediaKind).toBe("image");
      expect(asset.provenance.kind).toBe("documentary-photo");
      expect(asset.mobile).toBeDefined();
    }
  });
});
