import { describe, expect, it } from "vitest";

import { toProjectExplorerDto } from "../../../src/content/explorer-dto";
import {
  cloneSeedBundle,
  makeReadyImage,
  projectBySlug,
} from "./fixtures";

describe("explorer client-boundary DTO", () => {
  it("emits only canonical claim text, ready media, and public actions", () => {
    const content = cloneSeedBundle();
    const project = projectBySlug(content, "fradium");
    const highlightedClaim = project.claims.find(
      (claim) => claim.id === "fradium-wchl-2025",
    );
    expect(highlightedClaim).toBeDefined();
    if (!highlightedClaim) return;

    highlightedClaim.sources = [
      {
        kind: "owner-attestation",
        confirmedAt: "2026-07-11",
        note: "DO_NOT_LEAK_RAW_CLAIM_SOURCE",
      },
    ];
    project.evidence = [
      makeReadyImage({
        id: "fradium-ready-frame",
        provenance: {
          kind: "owned",
          creator: "Wildan Syukri Niam",
          rightsNote: "DO_NOT_LEAK_RIGHTS_NOTE",
        },
        claimIds: [highlightedClaim.id],
      }),
      {
        id: "fradium-private-frame",
        status: "private",
        slot: "private-source",
        intendedEvidenceType: "source",
        intendedMediaKind: "document",
        evidenceFunctions: ["verification"],
        acquisitionNotes: "DO_NOT_LEAK_ACQUISITION_NOTE",
        redactionNotes: "DO_NOT_LEAK_REDACTION_NOTE",
      },
    ];
    project.links.docs = {
      status: "private",
      note: "DO_NOT_LEAK_PRIVATE_LINK_NOTE",
    };

    const dto = toProjectExplorerDto(
      project,
      { ...highlightedClaim, text: "CALLER_INJECTED_TEXT" },
      "/preview/open-proving-ground/content/fradium",
    );
    const serialized = JSON.stringify(dto);

    expect(JSON.parse(serialized)).toEqual(dto);
    expect(dto.href).toBe("/preview/open-proving-ground/content/fradium");
    expect(dto.highlightedClaim.text).toBe(highlightedClaim.text);
    expect(dto.highlightedClaim).not.toHaveProperty("sources");
    expect(dto.highlightedClaim).not.toHaveProperty("scope");
    expect(dto.role).toEqual({ label: "Leader & Full-Stack Developer" });
    expect(dto.media.map((media) => media.id)).toEqual([
      "fradium-ready-frame",
    ]);
    expect(dto.media[0]).not.toHaveProperty("provenance");
    expect(dto.media[0]).not.toHaveProperty("claimIds");
    expect(dto.actions.map((action) => action.kind)).toEqual([
      "live",
      "source",
      "demo",
    ]);
    expect(serialized).not.toContain("CALLER_INJECTED_TEXT");
    expect(serialized).not.toContain("DO_NOT_LEAK_RAW_CLAIM_SOURCE");
    expect(serialized).not.toContain("DO_NOT_LEAK_RIGHTS_NOTE");
    expect(serialized).not.toContain("DO_NOT_LEAK_ACQUISITION_NOTE");
    expect(serialized).not.toContain("DO_NOT_LEAK_REDACTION_NOTE");
    expect(serialized).not.toContain("DO_NOT_LEAK_PRIVATE_LINK_NOTE");
  });

  it("rejects a claim from another project and unsafe resolved hrefs", () => {
    const content = cloneSeedBundle();
    const fradium = projectBySlug(content, "fradium");
    const nova = projectBySlug(content, "nova-ai");
    const novaClaim = nova.claims[0];

    expect(() =>
      toProjectExplorerDto(fradium, novaClaim, "/work/fradium"),
    ).toThrow(/does not belong to fradium/);
    expect(() =>
      toProjectExplorerDto(fradium, fradium.claims[0], "javascript:alert(1)"),
    ).toThrow(/safe root-relative path/);
    expect(() =>
      toProjectExplorerDto(fradium, fradium.claims[0], "//example.com/fradium"),
    ).toThrow(/safe root-relative path/);
  });
});
