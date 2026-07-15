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

describe("canonical V4 content inventory", () => {
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
    expect(
      content.homepage.projectStages.map((stage) => ({
        projectSlug: stage.projectSlug,
        outcomeClaimId: stage.outcomeClaimId,
        variant: stage.variant,
      })),
    ).toEqual([
      {
        projectSlug: "fradium",
        outcomeClaimId: "fradium-wchl-2025",
        variant: "wide-left",
      },
      {
        projectSlug: "nova-ai",
        outcomeClaimId: "nova-lisk-recognition",
        variant: "narrow-right",
      },
      {
        projectSlug: "paygate",
        outcomeClaimId: "paygate-instaward-2026",
        variant: "narrow-left",
      },
      {
        projectSlug: "quorum",
        outcomeClaimId: "quorum-six-testnet-flows",
        variant: "wide-right",
      },
    ]);
    expect(content.homepage.featuredMomentIds).toEqual([
      "refactory-build-room",
      "fradium-wchl-team",
      "self-healing-research",
      "learning-in-public",
    ]);
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

  it("locks the public identity, research territories, and exact Atlas narratives", () => {
    const content = loadContentBundle({ repositoryRoot: REPOSITORY_ROOT });

    expect(content.profile).toMatchObject({
      identity: "AI Researcher & Web3 Builder",
      discipline: "Software Engineering",
      researchDirection: "Trustworthy autonomous systems",
      headline: {
        lead: "I research how AI agents reason.",
        continuation: "I build software that lets them act.",
        supporting:
          "My work sits at the intersection of AI agents, software engineering, and blockchain infrastructure—turning research questions into working prototypes and products.",
      },
      operatingRhythm: ["Researching", "Building", "Shipping"],
    });
    expect(content.research.territories.map(({ name }) => name)).toEqual([
      "AI Agents",
      "Trustworthy Autonomous Systems",
      "On-chain Intelligence",
      "Agentic Payments",
    ]);
    expect(
      Object.fromEntries(
        content.research.territories.map(({ id, projectSlugs }) => [
          id,
          projectSlugs,
        ]),
      ),
    ).toMatchObject({
      "trustworthy-autonomous-systems": ["fradium", "nova-ai"],
      "agentic-payments": ["paygate", "quorum"],
    });
    expect(
      content.homepage.projectStages.map(
        ({ projectSlug, question, answer, flowLabels }) => ({
          projectSlug,
          question,
          answer,
          flowLabels,
        }),
      ),
    ).toEqual([
      {
        projectSlug: "fradium",
        question: "How can people see wallet risk before they sign?",
        answer:
          "A Web3 trust layer that brings AI and community signals into the transaction decision.",
        flowLabels: ["address", "signals", "risk verdict", "user decision"],
      },
      {
        projectSlug: "nova-ai",
        question:
          "Can a prompt become an on-chain action without giving up user control?",
        answer:
          "An AI wallet that prepares the action while the user keeps the final signature.",
        flowLabels: [
          "prompt",
          "interpreted intent",
          "proposed action",
          "approval",
        ],
      },
      {
        projectSlug: "paygate",
        question: "How should an AI agent pay for a single API call?",
        answer:
          "Agent-native API payments on Stellar, from HTTP 402 to verified delivery.",
        flowLabels: [
          "request",
          "402",
          "payment",
          "verification",
          "200 response",
        ],
      },
      {
        projectSlug: "quorum",
        question:
          "How can collaborators share event access and revenue without reconciliation chaos?",
        answer:
          "Wallet passes, on-chain splits, and settlement in one event flow.",
        flowLabels: [
          "event",
          "pass",
          "check-in",
          "split",
          "settlement proof",
        ],
      },
    ]);
  });

  it("records first-party brand provenance and ready Atlas artifacts", () => {
    const content = loadContentBundle({ repositoryRoot: REPOSITORY_ROOT });

    for (const stage of content.homepage.projectStages) {
      const project = content.projects.find(
        (candidate) => candidate.slug === stage.projectSlug,
      );
      expect(project?.branding?.mark.provenance).toEqual(
        expect.objectContaining({
          sourceRepository: expect.stringMatching(/^https:\/\/github\.com\//),
          revision: expect.stringMatching(/^[a-f0-9]{40}$/),
          sourcePath: expect.any(String),
          creator: expect.any(String),
          rights: expect.any(String),
        }),
      );
      expect(
        stage.artifactAssetIds.every((id) =>
          project?.evidence.some(
            (asset) => asset.id === id && asset.status === "ready",
          ),
        ),
      ).toBe(true);
      for (const id of stage.artifactAssetIds) {
        const asset = project?.evidence.find((candidate) => candidate.id === id);
        if (!asset || asset.status !== "ready") {
          throw new Error(`Missing ready Atlas artifact ${id}.`);
        }
        expect(asset.provenance).toEqual(
          expect.objectContaining({
            kind: "owned",
            sourceRepository: project?.links.source.status === "public"
              ? project.links.source.url
              : expect.any(String),
            revision: expect.stringMatching(/^[a-f0-9]{40}$/),
            sourcePath: expect.any(String),
          }),
        );
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
