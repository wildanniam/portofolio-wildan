import { describe, expect, it } from "vitest";

import { loadContentBundle } from "../../../src/content/repository.node";
import { REPOSITORY_ROOT } from "./fixtures";

const expectedProjects = [
  ["agentpay", "brief", "Product Builder & Full-Stack Developer"],
  ["crucible", "brief", "Full-Stack & Smart Contract Developer"],
  ["fradium", "full", "Leader & Full-Stack Developer"],
  ["nova-ai", "full", "Full-Stack & AI Builder"],
  ["paygate", "full", "Founder & Full-Stack Developer"],
  ["quorum", "full", "Full-Stack Product Builder"],
  [
    "specheal",
    "brief",
    "Product Developer, Full-Stack Developer & AI Integration Lead",
  ],
] as const;

describe("canonical V2 project inventory", () => {
  it("retains four full flagships and three lighter archive projects with approved roles", () => {
    const content = loadContentBundle({ repositoryRoot: REPOSITORY_ROOT });

    expect(
      content.projects.map((project) => [
        project.slug,
        project.caseStudyState,
        project.role.label,
      ]),
    ).toEqual(expectedProjects);
    expect(
      content.projects
        .filter((project) => project.publication === "published")
        .map((project) => project.slug),
    ).toEqual(["fradium", "nova-ai", "paygate", "quorum"]);
    expect(content.homepage.flagshipProjectSlugs).toEqual([
      "fradium",
      "nova-ai",
      "paygate",
      "quorum",
    ]);
    expect(content.homepage.flagshipHighlightClaimIds).toEqual({
      fradium: "fradium-wchl-2025",
      "nova-ai": "nova-lisk-recognition",
      paygate: "paygate-instaward-2026",
      quorum: "quorum-six-testnet-flows",
    });
    expect(content.homepage.currentlyBuildingIds).toEqual([
      "paygate-active-2026",
    ]);

    for (const project of content.projects) {
      const source = content.sources.projects.find(
        (candidate) => candidate.slug === project.slug,
      );
      expect(source).toBeDefined();
      if (project.caseStudyState === "full") {
        expect(source?.caseStudyMdxPath).toBe(
          `content/projects/${project.slug}/case-study.mdx`,
        );
      } else {
        expect(source?.caseStudyMdxPath).toBeUndefined();
      }
    }
  });

  it("keeps the exact sourced PayGate Instaward statement", () => {
    const content = loadContentBundle({ repositoryRoot: REPOSITORY_ROOT });
    const claim = content.projects
      .find((project) => project.slug === "paygate")
      ?.claims.find((candidate) => candidate.id === "paygate-instaward-2026");

    expect(claim).toEqual(
      expect.objectContaining({
        kind: "grant",
        text: "PayGate was awarded a $5,000 SCF Instaward.",
        scope:
          "Awarded funding; not a claim of partnership, mainnet launch, revenue, or sprint completion.",
      }),
    );
    expect(claim?.sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "url",
          url: "https://x.com/Indo_Stellar/status/2075550378553421994",
        }),
        expect.objectContaining({
          kind: "url",
          url: "https://stellar.gitbook.io/scf-handbook/scf-awards/instawards/official-rules",
        }),
        expect.objectContaining({ kind: "owner-attestation" }),
      ]),
    );
  });

  it("keeps all four published flagship evidence packages ready", () => {
    const content = loadContentBundle({ repositoryRoot: REPOSITORY_ROOT });
    const flagships = ["fradium", "nova-ai", "paygate", "quorum"].map((slug) => {
      const project = content.projects.find((candidate) => candidate.slug === slug);
      expect(project, slug).toBeDefined();
      return project!;
    });

    for (const project of flagships) {
      expect(project.publication, project.slug).toBe("published");
      expect(project.socialImageAssetId, project.slug).toBeDefined();
      expect(
        project.evidence.every((asset) => asset.status === "ready"),
        project.slug,
      ).toBe(true);

      const readyFunctions = new Set(
        project.evidence.flatMap((asset) =>
          asset.status === "ready" ? asset.evidenceFunctions : [],
        ),
      );
      expect(readyFunctions, project.slug).toEqual(
        new Set(["product-reality", "system-reasoning", "verification"]),
      );

      const socialImage = project.evidence.find(
        (asset) => asset.id === project.socialImageAssetId,
      );
      expect(socialImage, project.slug).toMatchObject({
        mediaKind: "image",
        status: "ready",
      });
    }
  });
});
