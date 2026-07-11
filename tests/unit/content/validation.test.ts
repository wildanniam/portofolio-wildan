import { describe, expect, it } from "vitest";

import type {
  FullProjectRecord,
  ReadyImageAsset,
} from "../../../src/content/types";
import { validateContentBundle } from "../../../src/content/validate";
import {
  cloneSeedBundle,
  makeMoment,
  makePlannedAsset,
  makeReadyImage,
  makeReadyVideo,
  projectBySlug,
  toBriefProject,
  validationDiagnostics,
} from "./fixtures";

function diagnosticCodes(input: unknown): string[] {
  return validationDiagnostics(input).map((diagnostic) => diagnostic.code);
}

describe("claim provenance rules", () => {
  it("accepts owner attestation for a truthful personal role", () => {
    const content = cloneSeedBundle();
    const roleClaim = projectBySlug(content, "fradium").claims.find(
      (claim) => claim.kind === "role",
    );

    expect(roleClaim?.sources).toEqual([
      expect.objectContaining({ kind: "owner-attestation" }),
    ]);
    expect(() => validateContentBundle(content, () => true)).not.toThrow();
  });

  it("rejects owner-only provenance for an external outcome", () => {
    const content = cloneSeedBundle();
    const externalClaim = projectBySlug(content, "fradium").claims.find(
      (claim) => claim.kind === "award",
    );

    expect(externalClaim).toBeDefined();
    if (!externalClaim) return;
    externalClaim.sources = [
      {
        kind: "owner-attestation",
        confirmedAt: "2026-07-11",
        note: "The owner alone cannot verify a third-party award.",
      },
    ];

    expect(diagnosticCodes(content)).toContain(
      "claim.third-party-source-required",
    );
  });

  it("does not treat planned or private owner-controlled evidence as an independent outcome source", () => {
    const content = cloneSeedBundle();
    const project = projectBySlug(content, "fradium");
    const externalClaim = project.claims.find(
      (claim) => claim.kind === "award",
    );
    const privateEvidence = makePlannedAsset({
      id: "private-owner-controlled-evidence",
      status: "private",
      intendedEvidenceType: "document",
      intendedMediaKind: "document",
    });
    project.evidence.push(privateEvidence);

    expect(externalClaim).toBeDefined();
    expect(privateEvidence).toBeDefined();
    if (!externalClaim || !privateEvidence) return;
    externalClaim.sources = [
      {
        kind: "evidence",
        evidenceId: privateEvidence.id,
        label: "Private owner-controlled evidence",
      },
    ];

    expect(diagnosticCodes(content)).toContain(
      "claim.third-party-source-required",
    );
  });
});

describe("project publication gates", () => {
  it("blocks a published full case study while any evidence is planned", () => {
    const content = cloneSeedBundle();
    const project = projectBySlug(content, "fradium");
    project.publication = "published";
    delete project.socialImageAssetId;
    project.evidence = [
      makePlannedAsset({ id: "planned-product-reality" }),
      makePlannedAsset({
        id: "planned-system-reasoning",
        intendedEvidenceType: "architecture",
        intendedMediaKind: "svg",
        evidenceFunctions: ["system-reasoning"],
      }),
      makePlannedAsset({
        id: "planned-verification",
        intendedEvidenceType: "test-result",
        evidenceFunctions: ["verification"],
      }),
    ];
    project.role.evidenceIds = [];
    if (project.caseStudyState !== "full") throw new Error("Expected full project.");
    project.decisions = project.decisions.map((decision) => ({
      ...decision,
      evidenceIds: [],
    }));

    const codes = diagnosticCodes(content);

    expect(codes).toContain("publication.planned-project-media");
    expect(
      codes.filter((code) => code === "publication.full-evidence-gate"),
    ).toHaveLength(3);
  });

  it("accepts a published full case study with ready evidence for all three functions", () => {
    const content = cloneSeedBundle();
    const project = projectBySlug(content, "fradium");
    expect(project.caseStudyState).toBe("full");
    if (project.caseStudyState !== "full") return;

    const evidence = makeReadyImage({
      id: "full-case-study-evidence",
      evidenceFunctions: [
        "product-reality",
        "system-reasoning",
        "verification",
      ],
    });
    project.publication = "published";
    project.evidence = [evidence];
    project.socialImageAssetId = evidence.id;
    project.role.evidenceIds = [];
    project.decisions = project.decisions.map((decision) => ({
      ...decision,
      evidenceIds: [evidence.id],
    }));

    expect(() => validateContentBundle(content, () => true)).not.toThrow();
  });

  it("requires a social image before a full case study can be published", () => {
    const content = cloneSeedBundle();
    const project = projectBySlug(content, "fradium");
    const evidence = makeReadyImage({
      id: "complete-full-evidence-without-social-image",
      evidenceFunctions: [
        "product-reality",
        "system-reasoning",
        "verification",
      ],
    });
    project.publication = "published";
    project.evidence = [evidence];
    project.role.evidenceIds = [];
    if (project.caseStudyState !== "full") throw new Error("Expected full project.");
    project.decisions = project.decisions.map((decision) => ({
      ...decision,
      evidenceIds: [evidence.id],
    }));

    expect(diagnosticCodes(content)).toContain(
      "publication.full-social-image-required",
    );
  });

  it("blocks a published brief without ready media", () => {
    const content = cloneSeedBundle();
    const project = projectBySlug(content, "nova-ai");
    const brief = toBriefProject(project, {
      publication: "published",
      evidence: [makePlannedAsset()],
    });
    delete brief.socialImageAssetId;
    content.projects[content.projects.indexOf(project)] = brief;

    expect(diagnosticCodes(content)).toEqual(
      expect.arrayContaining([
        "publication.planned-project-media",
        "publication.brief-ready-media-required",
      ]),
    );
  });

  it("accepts a published brief with one ready media item and no MDX requirement", () => {
    const content = cloneSeedBundle();
    const readyEvidence = makeReadyImage({ id: "brief-ready-evidence" });
    const project = projectBySlug(content, "nova-ai");
    const brief = toBriefProject(project, {
      publication: "published",
      evidence: [readyEvidence],
    });
    delete brief.socialImageAssetId;
    brief.role.evidenceIds = [];
    content.projects[content.projects.indexOf(project)] = brief;
    const source = content.sources.projects.find(
      (candidate) => candidate.slug === brief.slug,
    );
    if (!source) throw new Error("Missing project source fixture.");
    delete source.caseStudyMdxPath;

    expect(() => validateContentBundle(content, () => true)).not.toThrow();
  });
});

describe("project social-image references", () => {
  it("accepts a ready raster image owned by the same project", () => {
    const content = cloneSeedBundle();
    const project = projectBySlug(content, "fradium");
    const socialImage = makeReadyImage({ id: "fradium-social-image" });
    project.evidence.push(socialImage);
    project.socialImageAssetId = socialImage.id;

    expect(() => validateContentBundle(content, () => true)).not.toThrow();
  });

  it("rejects a social image owned by another project", () => {
    const content = cloneSeedBundle();
    const fradium = projectBySlug(content, "fradium");
    const nova = projectBySlug(content, "nova-ai");
    const socialImage = makeReadyImage({ id: "nova-social-image" });
    nova.evidence.push(socialImage);
    fradium.socialImageAssetId = socialImage.id;

    expect(diagnosticCodes(content)).toContain(
      "reference.project-social-image-ownership",
    );
  });

  it("rejects a planned social image", () => {
    const content = cloneSeedBundle();
    const project = projectBySlug(content, "fradium");
    const plannedImage = makePlannedAsset({
      id: "planned-social-image",
    });
    project.evidence.push(plannedImage);
    project.socialImageAssetId = plannedImage.id;

    expect(diagnosticCodes(content)).toContain(
      "reference.project-social-image-readiness",
    );
  });

  it("rejects ready SVG evidence because the social image must be raster", () => {
    const content = cloneSeedBundle();
    const project = projectBySlug(content, "fradium");
    const svg = makeReadyImage({
      id: "fradium-social-svg",
      mediaKind: "svg",
      src: "/media/tests/social-graphic.svg",
    });
    project.evidence.push(svg);
    project.socialImageAssetId = svg.id;

    expect(diagnosticCodes(content)).toContain(
      "reference.project-social-image-kind",
    );
  });
});

describe("homepage flagship highlight claims", () => {
  it("accepts one project-owned claim for every flagship", () => {
    const content = cloneSeedBundle();

    expect(content.homepage.flagshipHighlightClaimIds).toEqual({
      fradium: "fradium-wchl-2025",
      "nova-ai": "nova-lisk-recognition",
      paygate: "paygate-instaward-2026",
      quorum: "quorum-six-testnet-flows",
    });
    expect(() => validateContentBundle(content, () => true)).not.toThrow();
  });

  it("requires exact coverage of the flagship project list", () => {
    const content = cloneSeedBundle();
    delete content.homepage.flagshipHighlightClaimIds.fradium;
    content.homepage.flagshipHighlightClaimIds.agentpay = "agentpay-role";

    expect(
      diagnosticCodes(content).filter(
        (code) => code === "reference.homepage-highlight-coverage",
      ),
    ).toHaveLength(2);
  });

  it("rejects a highlight claim owned by a different project", () => {
    const content = cloneSeedBundle();
    content.homepage.flagshipHighlightClaimIds.fradium = "nova-role";

    expect(diagnosticCodes(content)).toContain(
      "reference.homepage-highlight-ownership",
    );
  });

  it("rejects an unknown highlight claim", () => {
    const content = cloneSeedBundle();
    content.homepage.flagshipHighlightClaimIds.fradium = "unknown-claim";

    expect(diagnosticCodes(content)).toContain(
      "reference.homepage-highlight-claim",
    );
  });
});

describe("moment publication gates", () => {
  it("blocks a published moment that only has planned media", () => {
    const content = cloneSeedBundle();
    content.moments = [
      makeMoment({
        publication: "published",
        assets: [
          {
            id: "planned-moment-photo",
            status: "needs-redaction",
            slot: "moment-documentary-frame",
            evidenceFunctions: ["verification"],
            intendedEvidenceType: "moment",
            intendedMediaKind: "image",
            redactionNotes: "Remove badge details before publication.",
          },
        ],
      }),
    ];

    expect(diagnosticCodes(content)).toEqual(
      expect.arrayContaining([
        "publication.moment-ready-media-required",
        "publication.planned-moment-media",
      ]),
    );
  });

  it("requires documentary-photo provenance for published moment imagery", () => {
    const content = cloneSeedBundle();
    content.moments = [
      makeMoment({
        publication: "published",
        assets: [makeReadyImage({ id: "owned-moment-photo" })],
      }),
    ];

    expect(diagnosticCodes(content)).toContain(
      "publication.moment-photo-provenance",
    );
  });

  it("accepts a published moment with a ready, rights-cleared documentary photo", () => {
    const content = cloneSeedBundle();
    const documentaryPhoto: ReadyImageAsset = makeReadyImage({
      id: "documentary-moment-photo",
      evidenceType: "moment",
      evidenceFunctions: ["verification"],
      provenance: {
        kind: "documentary-photo",
        source: "Wildan's original camera file",
        credit: "Wildan Syukri Niam",
        rights: "owned",
        consent: "confirmed",
        capturedAt: "2026-05-13",
      },
    });
    content.moments = [
      makeMoment({
        publication: "published",
        assets: [documentaryPhoto],
      }),
    ];

    expect(() => validateContentBundle(content, () => true)).not.toThrow();
  });
});

describe("ready media file presence", () => {
  it("reports missing desktop, mobile, and video-poster files independently", () => {
    const content = cloneSeedBundle();
    const project = projectBySlug(content, "fradium") as FullProjectRecord;
    const projectIndex = content.projects.indexOf(project);
    const firstNewAssetIndex = project.evidence.length;
    project.evidence.push(
      makeReadyImage({ id: "missing-image-files" }),
      makeReadyVideo({ id: "missing-video-files" }),
    );

    const missingPaths = new Set([
      "public/media/tests/product-desktop.webp",
      "public/media/tests/product-mobile.webp",
      "public/media/tests/verification-loop.mp4",
      "public/media/tests/verification-poster.webp",
    ]);

    const diagnostics = validationDiagnostics(
      content,
      (repositoryPath) => !missingPaths.has(repositoryPath),
    );
    const codes = diagnostics.map((diagnostic) => diagnostic.code);

    expect(
      codes.filter((code) => code === "source.ready-asset-missing"),
    ).toHaveLength(2);
    expect(codes).toContain("source.ready-mobile-asset-missing");
    expect(codes).toContain("source.ready-video-poster-missing");
    expect(
      diagnostics
        .filter((diagnostic) => diagnostic.code.startsWith("source.ready"))
        .map((diagnostic) => diagnostic.path),
    ).toEqual(
      expect.arrayContaining([
        `$content.projects[${projectIndex}].evidence[${firstNewAssetIndex}].src`,
        `$content.projects[${projectIndex}].evidence[${firstNewAssetIndex}].mobile.src`,
        `$content.projects[${projectIndex}].evidence[${firstNewAssetIndex + 1}].src`,
        `$content.projects[${projectIndex}].evidence[${firstNewAssetIndex + 1}].poster`,
      ]),
    );
  });
});

describe("schema and referential acceptance matrix", () => {
  it.each([
    [
      "canonical slug syntax",
      (content: ReturnType<typeof cloneSeedBundle>) => {
        projectBySlug(content, "fradium").slug = "Bad Slug";
      },
      "$content.projects",
    ],
    [
      "public-link verification metadata",
      (content: ReturnType<typeof cloneSeedBundle>) => {
        const link = projectBySlug(content, "fradium").links.live;
        if (link.status !== "public") throw new Error("Expected public link.");
        delete (link as Partial<typeof link>).lastVerifiedAt;
      },
      ".links.live.lastVerifiedAt",
    ],
    [
      "positive ready-media dimensions",
      (content: ReturnType<typeof cloneSeedBundle>) => {
        projectBySlug(content, "fradium").evidence.push(
          makeReadyImage({ width: 0 }),
        );
      },
      ".width",
    ],
    [
      "required image alt metadata",
      (content: ReturnType<typeof cloneSeedBundle>) => {
        const image = makeReadyImage();
        delete (image as Partial<typeof image>).alt;
        projectBySlug(content, "fradium").evidence.push(image);
      },
      ".evidence",
    ],
    [
      "normalized focal coordinates",
      (content: ReturnType<typeof cloneSeedBundle>) => {
        projectBySlug(content, "fradium").evidence.push(
          makeReadyImage({
            crop: {
              mode: "focal",
              aspectRatio: "16:10",
              focalPoint: { x: 1.5, y: 0.5 },
            },
          }),
        );
      },
      ".crop.focalPoint.x",
    ],
    [
      "strict unknown-field rejection",
      (content: ReturnType<typeof cloneSeedBundle>) => {
        (projectBySlug(content, "fradium") as unknown as Record<string, unknown>)[
          "presentationColor"
        ] = "mint";
      },
      "$content.projects",
    ],
  ])("rejects invalid %s", (_, mutate, expectedPath) => {
    const content = cloneSeedBundle();
    mutate(content);

    const diagnostics = validationDiagnostics(content);
    expect(diagnostics.some((diagnostic) => diagnostic.code.startsWith("schema.")))
      .toBe(true);
    expect(diagnostics.some((diagnostic) => diagnostic.path.includes(expectedPath)))
      .toBe(true);
  });

  it.each([
    [
      "homepage project",
      (content: ReturnType<typeof cloneSeedBundle>) =>
        content.homepage.flagshipProjectSlugs.push("unknown-project"),
      "reference.homepage-project",
    ],
    [
      "decision evidence",
      (content: ReturnType<typeof cloneSeedBundle>) => {
        const project = projectBySlug(content, "fradium");
        if (project.caseStudyState !== "full") throw new Error("Expected full project.");
        project.decisions[0].evidenceIds.push("unknown-evidence");
      },
      "reference.decision-evidence",
    ],
    [
      "licensed asset",
      (content: ReturnType<typeof cloneSeedBundle>) => {
        content.assetLicenseManifest.entries.push({
          id: "unknown-asset-license",
          name: "Example license",
          creator: "Example creator",
          source: "https://example.com/source",
          license: "Example license terms",
          usage: "published-asset",
          assetIds: ["unknown-evidence"],
          lastVerifiedAt: "2026-07-11",
        });
      },
      "reference.license-asset",
    ],
  ])("rejects an unknown %s reference", (_, mutate, expectedCode) => {
    const content = cloneSeedBundle();
    mutate(content);

    expect(diagnosticCodes(content)).toContain(expectedCode);
  });
});
