import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProjectPage } from "../../../src/components/v1/case-study/project-page";
import { partitionProjectEvidence } from "../../../src/components/v1/case-study/project-evidence-sequence";
import type {
  FullProjectRecord,
  ReadyDocumentAsset,
} from "../../../src/content/types";
import {
  cloneSeedBundle,
  makePlannedAsset,
  makeReadyImage,
  makeReadyVideo,
  projectBySlug,
} from "../content/fixtures";

function fullProjectFixture(): FullProjectRecord {
  const project = projectBySlug(cloneSeedBundle(), "fradium");
  if (project.caseStudyState !== "full") {
    throw new Error("Fradium must remain a full case study for this fixture.");
  }

  const document: ReadyDocumentAsset = {
    id: "verification-document",
    status: "ready",
    slot: "verification-document",
    evidenceType: "document",
    evidenceFunctions: ["verification"],
    mediaKind: "document",
    src: "/media/tests/verification.pdf",
    width: 1200,
    height: 900,
    crop: { mode: "intrinsic" },
    caption: "A verification document with a durable text alternative.",
    provenance: {
      kind: "third-party",
      creator: "Example verifier",
      source: "https://example.com/verification",
      license: "Used by permission",
    },
    title: "Verification record",
    textAlternative:
      "A written record describing the checks and their bounded result.",
    pageCount: 4,
  };

  project.evidence = [
    makeReadyImage({
      id: "opening-product-frame",
      src: "/media/tests/public-beta.webp",
      caption: "The current public product surface.",
    }),
    makePlannedAsset({
      id: "private-future-capture",
      status: "private",
      acquisitionNotes: "This private note must never reach rendered markup.",
    }),
    makeReadyImage({
      id: "system-diagram",
      evidenceType: "architecture",
      evidenceFunctions: ["system-reasoning"],
      mediaKind: "svg",
      src: "/media/tests/system-map.svg",
      width: 1600,
      height: 1000,
      mobile: undefined,
      alt: "A system decision diagram",
      longDescription:
        "The client prepares evidence, the service evaluates it, and the user makes the final decision.",
      caption: "The inspected system boundary and decision flow.",
    }),
    makeReadyVideo({
      id: "verification-loop",
      caption: "A short recorded verification path.",
      mobile: {
        src: "/media/tests/verification-loop-mobile.mp4",
        width: 900,
        height: 1200,
        crop: {
          mode: "focal",
          aspectRatio: "3:4",
          focalPoint: { x: 0.5, y: 0.5 },
        },
      },
    }),
    document,
  ];

  return project;
}

function occurrenceCount(value: string, search: string): number {
  return value.split(search).length - 1;
}

describe("server-rendered project evidence sequence", () => {
  it("selects the first ready product-reality asset as the opening without reordering the rest", () => {
    const project = fullProjectFixture();
    const [product, planned, diagram, video, document] = project.evidence;
    if (!product || !planned || !diagram || !video || !document) {
      throw new Error("The evidence fixture is incomplete.");
    }

    project.evidence = [diagram, planned, product, video, document];
    const partition = partitionProjectEvidence(project.evidence);

    expect(partition.opening?.id).toBe("opening-product-frame");
    expect(partition.sequence.map((asset) => asset.id)).toEqual([
      "system-diagram",
      "verification-loop",
      "verification-document",
    ]);
  });

  it("puts ready product reality in the opening and keeps later evidence in source order", () => {
    const markup = renderToStaticMarkup(
      createElement(ProjectPage, {
        narrative: createElement(
          "p",
          { "data-narrative-marker": true },
          "Case-study narrative",
        ),
        preview: true,
        project: fullProjectFixture(),
      }),
    );
    const openingIndex = markup.indexOf('data-evidence-id="opening-product-frame"');
    const narrativeIndex = markup.indexOf("data-narrative-marker");
    const diagramIndex = markup.indexOf('data-evidence-id="system-diagram"');
    const videoIndex = markup.indexOf('data-evidence-id="verification-loop"');
    const documentIndex = markup.indexOf(
      'data-evidence-id="verification-document"',
    );

    expect(openingIndex).toBeGreaterThan(-1);
    expect(openingIndex).toBeLessThan(narrativeIndex);
    expect(diagramIndex).toBeGreaterThan(narrativeIndex);
    expect(videoIndex).toBeGreaterThan(diagramIndex);
    expect(documentIndex).toBeGreaterThan(videoIndex);
    expect(occurrenceCount(markup, "<figure")).toBe(4);

    expect(markup).toContain('/media/tests/public-beta.webp');
    expect(markup).toContain('/media/tests/product-mobile.webp');
    expect(markup).toContain('media="(max-width: 639px)"');
    expect(markup).toContain('loading="eager"');
    expect(markup).toContain('src="/media/tests/system-map.svg"');
    expect(markup).toContain("Scroll horizontally to inspect the full diagram.");
    expect(markup).toContain('role="region"');
    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain("Detailed image description");
    expect(markup).toContain("The client prepares evidence");
    expect(markup).toContain("Recorded steps");
    expect(markup).toContain("Inspect the verified state.");
    expect(markup).toContain("/media/tests/verification-loop-mobile.mp4");
    expect(markup).toContain("Verification record");
    expect(markup).toContain("Document / 4 pages");
    expect(markup).toContain('href="/media/tests/verification.pdf"');
    expect(markup).toContain("Product Reality / Product");
    expect(markup).toContain("System Reasoning / Architecture");
    expect(markup).not.toContain("01 / 04");
    expect(markup).not.toContain("·");

    expect(markup).toContain("Open live beta");
    expect(markup).toContain("Inspect source");
    expect(markup).toContain("Original source");
    expect(markup).toContain('rel="noopener noreferrer"');
    expect(markup).toContain("(opens in a new tab)");

    expect(markup).not.toContain("private-future-capture");
    expect(markup).not.toContain("This private note");
    expect(markup).not.toContain("placeholder");
    expect(markup).not.toContain("Coming soon");
    expect(markup).toMatch(
      /opg-evidence-figure__media[\s\S]*?<\/div><figcaption/,
    );
  });

  it("emits no evidence container when every asset is planned or private", () => {
    const project = fullProjectFixture();
    project.evidence = [
      makePlannedAsset({ id: "planned-only" }),
      makePlannedAsset({ id: "private-only", status: "private" }),
    ];

    const markup = renderToStaticMarkup(
      createElement(ProjectPage, {
        narrative: createElement("p", null, "Narrative without ready media."),
        project,
      }),
    );

    expect(markup).not.toContain("data-project-opening-evidence");
    expect(markup).not.toContain("data-project-evidence-sequence");
    expect(markup).not.toContain("opg-evidence-figure");
    expect(markup).not.toContain("planned-only");
    expect(markup).not.toContain("private-only");
  });

  it("keeps the case-study evidence renderer server-only", () => {
    const componentPaths = [
      "../../../src/components/v1/case-study/project-evidence-sequence.tsx",
      "../../../src/components/v1/evidence/evidence-caption.tsx",
      "../../../src/components/v1/evidence/evidence-figure.tsx",
      "../../../src/components/v1/evidence/evidence-media.tsx",
    ];

    for (const path of componentPaths) {
      const source = readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
      expect(source).not.toMatch(/^\s*["']use client["'];?/m);
    }
  });
});
