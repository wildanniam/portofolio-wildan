import { describe, expect, it } from "vitest";

import { toLinkDto, toProjectSummaryDto } from "../../../src/content/dto";
import {
  cloneSeedBundle,
  makeReadyImage,
  projectBySlug,
} from "./fixtures";

describe("client-safe project DTO", () => {
  it("round-trips as plain JSON and omits planned media plus claim/role provenance authoring data", () => {
    const content = cloneSeedBundle();
    const project = projectBySlug(content, "fradium");
    const roleClaim = project.claims.find((claim) => claim.kind === "role");
    expect(roleClaim).toBeDefined();
    if (!roleClaim) return;
    roleClaim.sources = [
      {
        kind: "owner-attestation",
        confirmedAt: "2026-07-11",
        note: "DO_NOT_LEAK_OWNER_ATTESTATION_NOTE",
      },
    ];
    project.evidence = [
      makeReadyImage({ id: "public-ready-evidence" }),
      {
        id: "private-authoring-evidence",
        status: "private",
        slot: "internal-proof",
        evidenceFunctions: ["verification"],
        intendedEvidenceType: "document",
        intendedMediaKind: "document",
        acquisitionNotes: "DO_NOT_LEAK_ACQUISITION_NOTE",
        redactionNotes: "DO_NOT_LEAK_REDACTION_NOTE",
      },
    ];

    const dto = toProjectSummaryDto(project);
    const serialized = JSON.stringify(dto);

    expect(JSON.parse(serialized)).toEqual(dto);
    expect(dto.evidence.map((asset) => asset.id)).toEqual([
      "public-ready-evidence",
    ]);
    expect(dto.claims[0]).not.toHaveProperty("sources");
    expect(dto.role).not.toHaveProperty("claimIds");
    expect(dto.role).not.toHaveProperty("evidenceIds");
    expect(dto).not.toHaveProperty("collaborators");
    expect(dto).not.toHaveProperty("decisions");
    expect(serialized).not.toContain("DO_NOT_LEAK_OWNER_ATTESTATION_NOTE");
    expect(serialized).not.toContain("DO_NOT_LEAK_ACQUISITION_NOTE");
    expect(serialized).not.toContain("DO_NOT_LEAK_REDACTION_NOTE");
  });

  it("renames public URLs to href and preserves bounded non-public link notes", () => {
    expect(
      toLinkDto({
        status: "public",
        url: "https://example.com/project",
        lastVerifiedAt: "2026-07-11",
      }),
    ).toEqual({
      status: "public",
      href: "https://example.com/project",
      lastVerifiedAt: "2026-07-11",
    });
    expect(
      toLinkDto({ status: "private", note: "Invite-only repository." }),
    ).toEqual({ status: "private", note: "Invite-only repository." });
    expect(toLinkDto({ status: "not-applicable" })).toEqual({
      status: "not-applicable",
    });
  });
});
